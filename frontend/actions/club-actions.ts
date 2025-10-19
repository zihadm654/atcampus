"use server";

import { ClubMemberRole, ClubStatus, type ClubType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { notifyClubMemberJoined } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";
import {
  clubLikeSchema,
  createClubSchema,
  joinClubSchema,
  type TClubLike,
  type TCreateClub,
  type TJoinClub,
  type TUpdateClub,
  type TUpdateClubMember,
  updateClubMemberSchema,
  updateClubSchema,
} from "@/lib/validations/club";
import type { ClubWithDetails, ExtendedClub } from "@/types/club-types";

// Helper function to get club with details
function getClubInclude(userId?: string) {
  return {
    creator: {
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        email: true,
      },
    },
    organization: {
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    },
    faculty: {
      select: {
        id: true,
        name: true,
        shortName: true,
      },
    },
    members: {
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true,
          },
        },
      },
    },
    likesUsers: userId
      ? {
          where: { userId },
          take: 1,
        }
      : false,
    _count: {
      select: {
        members: {
          where: { isActive: true },
        },
        likesUsers: true,
        events: true,
      },
    },
  };
}

// Create club - Institution users only
export async function createClubAction(
  data: TCreateClub
): Promise<{ success: boolean; data?: ExtendedClub; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is an institution
    if (user.role !== "INSTITUTION") {
      return { success: false, error: "Only institutions can create clubs" };
    }

    // Validate input data
    const validatedData = createClubSchema.parse(data);

    // Create the club
    const club = await prisma.club.create({
      data: {
        ...validatedData,
        creatorId: user.id,
        status: ClubStatus.ACTIVE,
      },
      include: getClubInclude(user.id),
    });

    // Add creator as first member with admin role
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: user.id,
        role: ClubMemberRole.PRESIDENT,
        isActive: true,
      },
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true, data: club as unknown as ExtendedClub };
  } catch (error) {
    console.error("Error creating club:", error);
    return { success: false, error: "Failed to create club" };
  }
}

// Get clubs with filtering
export async function getClubsAction(
  filters: {
    organizationId?: string;
    facultyId?: string;
    status?: ClubStatus;
    type?: ClubType;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  success: boolean;
  data?: ExtendedClub[];
  total?: number;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const {
      organizationId,
      facultyId,
      status,
      type,
      isPublic = true,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      isActive: true,
      ...(status && { status }),
      ...(type && { clubType: type }),
      ...(organizationId && { organizationId }),
      ...(facultyId && { facultyId }),
      ...(isPublic !== undefined && { isPublic }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: getClubInclude(user.id),
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.club.count({ where }),
    ]);

    return { success: true, data: clubs as unknown as ExtendedClub[], total };
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return { success: false, error: "Failed to fetch clubs" };
  }
}

// Get single club with details
export async function getClubByIdAction(
  clubId: string
): Promise<{ success: boolean; data?: ClubWithDetails; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        ...getClubInclude(user.id),
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
                isOnline: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!club) {
      return { success: false, error: "Club not found" };
    }

    return { success: true, data: club as unknown as ClubWithDetails };
  } catch (error) {
    console.error("Error fetching club:", error);
    return { success: false, error: "Failed to fetch club" };
  }
}

// Update club - Only creator or admin can update
export async function updateClubAction(
  clubId: string,
  data: TUpdateClub
): Promise<{ success: boolean; data?: ExtendedClub; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = updateClubSchema.parse(data);

    // Check if club exists and user has permission
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          where: { userId: user.id, isActive: true },
        },
      },
    });

    if (!existingClub) {
      return { success: false, error: "Club not found" };
    }

    // Check if user is creator or admin
    const isCreator = existingClub.creatorId === user.id;
    const isAdmin = existingClub.members.some(
      (member) =>
        member.userId === user.id && member.role === ClubMemberRole.PRESIDENT
    );

    if (!(isCreator || isAdmin)) {
      return {
        success: false,
        error: "Only club creators or admins can update this club",
      };
    }

    // Transform data to match Prisma schema
    const updateData: any = {
      ...validatedData,
      clubType: validatedData.type,
      socialLinks: validatedData.socialMedia
        ? JSON.stringify(validatedData.socialMedia)
        : undefined,
      meetingFrequency: validatedData.meetingSchedule ? "CUSTOM" : undefined,
      meetingLocation: validatedData.meetingSchedule,
    };

    // Remove fields that don't exist in Prisma schema
    delete updateData.type;
    delete updateData.socialMedia;
    delete updateData.meetingSchedule;

    // Update the club
    const club = await prisma.club.update({
      where: { id: clubId },
      data: updateData,
      include: getClubInclude(user.id),
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true, data: club as unknown as ExtendedClub };
  } catch (error) {
    console.error("Error updating club:", error);
    return { success: false, error: "Failed to update club" };
  }
}

// Delete club - Only creator can delete
export async function deleteClubAction(
  clubId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if club exists and user is the creator
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!existingClub) {
      return { success: false, error: "Club not found" };
    }

    if (existingClub.creatorId !== user.id) {
      return {
        success: false,
        error: "Only the club creator can delete this club",
      };
    }

    // Soft delete the club
    await prisma.club.update({
      where: { id: clubId },
      data: { isActive: false },
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error deleting club:", error);
    return { success: false, error: "Failed to delete club" };
  }
}

// Join club - Students can join clubs
export async function joinClubAction(
  data: TJoinClub
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = joinClubSchema.parse(data);

    // Check if club exists and is active
    const club = await prisma.club.findUnique({
      where: { id: validatedData.clubId },
    });

    if (!club) {
      return { success: false, error: "Club not found" };
    }

    if (!club.isActive || club.status !== ClubStatus.ACTIVE) {
      return { success: false, error: "Club is not available for membership" };
    }

    // Check if club is public or if user has invitation
    if (!club.isPublic) {
      return {
        success: false,
        error: "This club is private and requires invitation to join",
      };
    }

    // Check if user is already a member
    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: validatedData.clubId,
        },
      },
    });

    if (existingMembership?.isActive) {
      return { success: false, error: "You are already a member of this club" };
    }

    // Check membership limits
    const memberCount = await prisma.clubMember.count({
      where: {
        clubId: validatedData.clubId,
        isActive: true,
      },
    });

    if (club.maxMembers && memberCount >= club.maxMembers) {
      return {
        success: false,
        error: "Club has reached maximum membership capacity",
      };
    }

    // Create or update membership
    let membership;
    if (existingMembership) {
      membership = await prisma.clubMember.update({
        where: { id: existingMembership.id },
        data: {
          isActive: true,
          role: ClubMemberRole.MEMBER,
          joinedAt: new Date(),
        },
      });
    } else {
      membership = await prisma.clubMember.create({
        data: {
          userId: user.id,
          clubId: validatedData.clubId,
          role: ClubMemberRole.MEMBER,
          isActive: true,
        },
      });
    }

    // Send notification to club creator and admins
    await notifyClubMemberJoined(club.id, user.id, user.name);

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error joining club:", error);
    return { success: false, error: "Failed to join club" };
  }
}

// Leave club - Members can leave clubs
export async function leaveClubAction(
  clubId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Find the user's membership
    const membership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId,
        },
      },
    });

    if (!membership) {
      return { success: false, error: "You are not a member of this club" };
    }

    // Update membership status to inactive
    await prisma.clubMember.update({
      where: { id: membership.id },
      data: { isActive: false },
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error leaving club:", error);
    return { success: false, error: "Failed to leave club" };
  }
}

// Update club member - Admin only
export async function updateClubMemberAction(
  clubId: string,
  memberId: string,
  data: TUpdateClubMember
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = updateClubMemberSchema.parse(data);

    // Check if user is admin of the club
    const adminMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== ClubMemberRole.ADVISOR) {
      return {
        success: false,
        error: "Only club admins can update member roles",
      };
    }

    // Update the member
    await prisma.clubMember.update({
      where: { id: memberId },
      data: {
        role: validatedData.role,
        isActive: validatedData.isActive,
        position: validatedData.position,
        bio: validatedData.bio,
      },
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error updating club member:", error);
    return { success: false, error: "Failed to update club member" };
  }
}

// Like/unlike club
export async function toggleClubLikeAction(
  data: TClubLike
): Promise<{ success: boolean; isLiked?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = clubLikeSchema.parse(data);

    // Check if like exists
    const existingLike = await prisma.clubLike.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: validatedData.clubId,
        },
      },
    });

    if (existingLike) {
      // Unlike the club
      await prisma.clubLike.delete({
        where: { id: existingLike.id },
      });

      revalidatePath("/clubs");
      revalidatePath("/profile/[username]");

      return { success: true, isLiked: false };
    }
    // Like the club
    await prisma.clubLike.create({
      data: {
        userId: user.id,
        clubId: validatedData.clubId,
      },
    });

    revalidatePath("/clubs");
    revalidatePath("/profile/[username]");

    return { success: true, isLiked: true };
  } catch (error) {
    console.error("Error toggling club like:", error);
    return { success: false, error: "Failed to toggle club like" };
  }
}

// Get user's clubs
export async function getUserClubsAction(
  userId: string
): Promise<{ success: boolean; data?: ExtendedClub[]; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Get clubs created by the user
    const createdClubs = await prisma.club.findMany({
      where: {
        creatorId: userId,
        isActive: true,
      },
      include: getClubInclude(currentUser.id),
      orderBy: { createdAt: "desc" },
    });

    // Get clubs the user is a member of
    const memberClubs = await prisma.club.findMany({
      where: {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
        isActive: true,
      },
      include: getClubInclude(currentUser.id),
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: [...createdClubs, ...memberClubs] as unknown as ExtendedClub[],
    };
  } catch (error) {
    console.error("Error fetching user clubs:", error);
    return { success: false, error: "Failed to fetch user clubs" };
  }
}
