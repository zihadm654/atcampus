import { prisma } from "@/lib/db";
import { ExtendedUser } from "@/types/auth-types";
import { APIError } from "better-auth/api";

/**
 * Create an invitation for a user to join an organization
 */
export async function createInvitation(
    organizationId: string,
    inviterId: string,
    email: string,
    role: string = "member"
) {
    // Check if inviter is a member of the organization
    const inviterMembership = await prisma.member.findFirst({
        where: {
            userId: inviterId,
            organizationId,
        },
    });

    if (!inviterMembership) {
        throw new APIError("FORBIDDEN", {
            message: "You must be a member of this organization to invite others",
        });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const existingMembership = await prisma.member.findFirst({
            where: {
                userId: existingUser.id,
                organizationId,
            },
        });

        if (existingMembership) {
            throw new APIError("BAD_REQUEST", {
                message: "User is already a member of this organization",
            });
        }
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findFirst({
        where: {
            email,
            organizationId,
            status: "pending",
        },
    });

    if (existingInvitation) {
        throw new APIError("BAD_REQUEST", {
            message: "An invitation for this user already exists",
        });
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await prisma.invitation.create({
        data: {
            organizationId,
            inviterId,
            email,
            role,
            expiresAt,
        },
        include: {
            organization: true,
            inviter: true,
        },
    });

    return invitation;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string, userId: string) {
    // Get invitation
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: { organization: true },
    });

    if (!invitation) {
        throw new APIError("NOT_FOUND", {
            message: "Invitation not found",
        });
    }

    // Check if invitation is still valid
    if (invitation.expiresAt < new Date()) {
        throw new APIError("BAD_REQUEST", {
            message: "Invitation has expired",
        });
    }

    if (invitation.status !== "pending") {
        throw new APIError("BAD_REQUEST", {
            message: "Invitation is no longer valid",
        });
    }

    // Check if user is already a member
    const existingMembership = await prisma.member.findFirst({
        where: {
            userId,
            organizationId: invitation.organizationId,
        },
    });

    if (existingMembership) {
        throw new APIError("BAD_REQUEST", {
            message: "You are already a member of this organization",
        });
    }

    // Update invitation status
    await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "accepted" },
    });

    // Create membership
    const membership = await prisma.member.create({
        data: {
            userId,
            organizationId: invitation.organizationId,
            role: invitation.role,
        },
    });

    return { invitation, membership };
}

/**
 * Get pending invitations for a user
 */
export async function getPendingInvitations(email: string) {
    const invitations = await prisma.invitation.findMany({
        where: {
            email,
            status: "pending",
            expiresAt: { gte: new Date() },
        },
        include: {
            organization: true,
            inviter: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return invitations;
}

/**
 * Check if user can invite members to organization
 */
export async function canInviteMembers(userId: string, organizationId: string): Promise<boolean> {
    const membership = await prisma.member.findFirst({
        where: {
            userId,
            organizationId,
            role: {
                in: ["owner", "admin"], // Only owners and admins can invite
            },
        },
    });

    return !!membership;
}