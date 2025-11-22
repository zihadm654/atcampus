import { prisma } from "@/lib/db";
import { notifyFollow, notifyFollowRequest } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
        requireFollowApproval: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check for pending follow request
    const pendingRequest = await prisma.followRequest.findUnique({
      where: {
        requesterId_targetId: {
          requesterId: loggedInUser.id,
          targetId: userId,
        },
        status: "PENDING",
      },
    });

    const data = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
      followRequestStatus: pendingRequest?.status || null,
      hasPendingFollowRequest: !!pendingRequest,
      isPrivateAccount: user.requireFollowApproval,
      followRequestId: pendingRequest?.id || null, // Add the follow request ID
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is trying to follow themselves
    if (loggedInUser.id === userId) {
      return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if target user exists and get their privacy settings
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        requireFollowApproval: true
      },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return Response.json({ error: "Already following this user" }, { status: 400 });
    }

    // Check if there's already a pending follow request
    const existingRequest = await prisma.followRequest.findUnique({
      where: {
        requesterId_targetId: {
          requesterId: loggedInUser.id,
          targetId: userId,
        },
      },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return Response.json({ error: "Follow request already pending" }, { status: 400 });
    }

    // If target user requires follow approval, create a follow request instead
    if (targetUser.requireFollowApproval) {
      // Create follow request
      const followRequest = await prisma.followRequest.create({
        data: {
          requesterId: loggedInUser.id,
          targetId: userId,
        },
      });

      // Create notification for the target user
      await notifyFollowRequest(loggedInUser.id, userId);

      return Response.json({
        message: "Follow request sent successfully",
        followRequest
      });
    }

    // If no approval required, create direct follow relationship
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {},
    });

    // Notify the user being followed
    await notifyFollow(loggedInUser.id, userId);

    return Response.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is trying to unfollow themselves
    if (loggedInUser.id === userId) {
      return Response.json({ error: "Cannot unfollow yourself" }, { status: 400 });
    }

    // Check if following relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      return Response.json({ error: "Not following this user" }, { status: 400 });
    }

    // Delete the follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
    });

    return Response.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
