import { prisma } from "@/lib/db";
import type { ExtendedUser } from "@/types/auth-types";

/**
 * Handle post-registration tasks for different user types
 */
export async function handlePostRegistration(user: ExtendedUser) {
  try {
    // Handle institution users
    if (user.role === "INSTITUTION" && user.institution) {
      await handleInstitutionRegistration(user);
    }

    // Handle organization users
    if (user.role === "ORGANIZATION" && user.institution) {
      await handleOrganizationRegistration(user);
    }

    // Handle professor users with institute ID
    if (user.role === "PROFESSOR" && user.instituteId) {
      await handleProfessorRegistration(user);
    }

    console.log(`Post-registration tasks completed for user ${user.id}`);
  } catch (error) {
    console.error(`Error in post-registration for user ${user.id}:`, error);
  }
}

/**
 * Handle institution user registration
 */
async function handleInstitutionRegistration(user: ExtendedUser) {
  try {
    // Create organization for institution
    const organization = await prisma.organization.create({
      data: {
        name: user.institution || `${user.name}'s Institution`,
        slug: createSlug(user.institution || user.name),
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    console.log(
      `Created organization ${organization.id} for institution user ${user.id}`
    );
  } catch (error) {
    console.error(
      `Error creating organization for institution user ${user.id}:`,
      error
    );
  }
}

/**
 * Handle organization user registration
 */
async function handleOrganizationRegistration(user: ExtendedUser) {
  try {
    // Create organization for organization user
    const organization = await prisma.organization.create({
      data: {
        name: user.institution || `${user.name}'s Organization`,
        slug: createSlug(user.institution || user.name),
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    console.log(
      `Created organization ${organization.id} for organization user ${user.id}`
    );
  } catch (error) {
    console.error(
      `Error creating organization for organization user ${user.id}:`,
      error
    );
  }
}

/**
 * Handle professor registration with institute ID
 */
async function handleProfessorRegistration(user: ExtendedUser) {
  try {
    // If professor has an institute ID, try to associate with faculty
    if (user.instituteId) {
      const faculty = await prisma.faculty.findFirst({
        where: {
          id: user.instituteId,
        },
      });

      if (faculty) {
        // Associate professor with faculty
        await prisma.member.updateMany({
          where: {
            userId: user.id,
          },
          data: {
            facultyId: faculty.id,
          },
        });

        console.log(
          `Associated professor ${user.id} with faculty ${faculty.id}`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error associating professor ${user.id} with faculty:`,
      error
    );
  }
}

/**
 * Create a URL-friendly slug from a string
 */
function createSlug(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "organization"
  );
}

/**
 * Check if user needs approval
 */
export function needsApproval(user: ExtendedUser): boolean {
  // Institutions and organizations need approval
  return user.role === "INSTITUTION" || user.role === "ORGANIZATION";
}

/**
 * Check if user is approved
 */
export function isUserApproved(user: ExtendedUser): boolean {
  return user.status === "ACTIVE" || user.status === "SUSPENDED";
}
