"use server";

import type { UserRole, UserStatus } from "@prisma/client";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/types/auth-types";

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const currentUser = await getCurrentUser();

    // Check if current user is admin
    if (!(currentUser && isAdmin(currentUser))) {
      throw new APIError("FORBIDDEN", {
        message: "Only administrators can update user roles",
      });
    }

    // Validate role
    const validRoles = [
      "STUDENT",
      "PROFESSOR",
      "INSTITUTION",
      "ORGANIZATION",
      "ADMIN",
    ];
    if (!validRoles.includes(newRole)) {
      throw new APIError("BAD_REQUEST", {
        message: "Invalid role specified",
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

/**
 * Update a user's status (admin only)
 */
export async function updateUserStatus(userId: string, newStatus: UserStatus) {
  try {
    const currentUser = await getCurrentUser();

    // Check if current user is admin
    if (!(currentUser && isAdmin(currentUser))) {
      throw new APIError("FORBIDDEN", {
        message: "Only administrators can update user status",
      });
    }

    // Validate status
    const validStatuses = ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"];
    if (!validStatuses.includes(newStatus)) {
      throw new APIError("BAD_REQUEST", {
        message: "Invalid status specified",
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error updating user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

/**
 * Approve an institution or organization user
 */
export async function approveInstitutionUser(userId: string) {
  try {
    const currentUser = await getCurrentUser();

    // Check if current user is admin
    if (!(currentUser && isAdmin(currentUser))) {
      throw new APIError("FORBIDDEN", {
        message: "Only administrators can approve institution users",
      });
    }

    // Get user to check their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError("NOT_FOUND", {
        message: "User not found",
      });
    }

    // Check if user is an institution or organization
    if (user.role !== "INSTITUTION" && user.role !== "ORGANIZATION") {
      throw new APIError("BAD_REQUEST", {
        message: "Only institution and organization users can be approved",
      });
    }

    // Update user status to ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    console.error("Error approving institution user:", error);
    return { success: false, error: "Failed to approve institution user" };
  }
}
