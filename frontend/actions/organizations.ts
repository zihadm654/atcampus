"use server";

import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";
import {
  acceptInvitation,
  createInvitation,
  getPendingInvitations,
} from "@/lib/organization-invitations";
import { getCurrentUser } from "@/lib/session";

export async function getOrganizations() {
  const user = await getCurrentUser();

  const members = await prisma.member.findMany({
    where: {
      userId: user?.id,
    },
    include: {
      organization: true,
    },
  });

  return members.map((member) => member.organization);
}

export async function getActiveOrganization(userId: string) {
  const memberUser = await prisma.member.findFirst({
    where: {
      userId,
    },
  });

  if (!memberUser) {
    return null;
  }

  const activeOrganization = await prisma.organization.findFirst({
    where: { id: memberUser.organizationId },
  });

  return activeOrganization;
}

export async function getOrganizationBySlug(slug: string) {
  try {
    const organizationBySlug = await prisma.organization.findFirst({
      where: { slug },
      include: {
        members: {
          select: {
            user: true,
          },
        },
      },
    });

    return organizationBySlug;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Server action to create an invitation
 */
export async function inviteMember(
  organizationId: string,
  email: string,
  role = "member",
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new APIError("UNAUTHORIZED", {
        message: "You must be logged in to invite members",
      });
    }

    const invitation = await createInvitation(
      organizationId,
      user.id,
      email,
      role,
    );

    return { success: true, invitation };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error inviting member:", error);
    return { success: false, error: "Failed to invite member" };
  }
}

/**
 * Server action to accept an invitation
 */
export async function acceptOrganizationInvitation(invitationId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new APIError("UNAUTHORIZED", {
        message: "You must be logged in to accept invitations",
      });
    }

    const result = await acceptInvitation(invitationId, user.id);

    return { success: true, result };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error accepting invitation:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

/**
 * Server action to get pending invitations for current user
 */
export async function fetchPendingInvitations() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new APIError("UNAUTHORIZED", {
        message: "You must be logged in to view invitations",
      });
    }

    const invitations = await getPendingInvitations(user.email);

    return { success: true, invitations };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error fetching invitations:", error);
    return { success: false, error: "Failed to fetch invitations" };
  }
}
