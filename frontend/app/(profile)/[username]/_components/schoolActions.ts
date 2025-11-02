"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Remove all user profile related imports and schemas
// Keep only school and faculty schemas and actions

const createSchoolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
  coverPhoto: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
});

export async function createSchool(values: z.infer<typeof createSchoolSchema>) {
  const validatedValues = createSchoolSchema.parse(values);
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }
  try {
    // Generate a unique slug if not provided
    let slug = validatedValues.slug;
    if (!slug) {
      slug = validatedValues.name
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-*|-*$/g, "");

      // Check if slug already exists and generate a unique one
      let existingSchool = await prisma.school.findUnique({
        where: { slug_institutionId: { slug, institutionId: user.id } },
      });

      let counter = 1;
      while (existingSchool) {
        slug = `${validatedValues.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}-${counter}`;
        counter++;
        existingSchool = await prisma.school.findUnique({
          where: { slug_institutionId: { slug, institutionId: user.id } },
        });
      }
    }

    const school = await prisma.school.create({
      data: {
        ...validatedValues,
        institutionId: user.id,
        slug,
      },
    });
    return school;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A school with this slug already exists.");
    }
    throw error;
  }
}

const updateSchoolSchema = createSchoolSchema.extend({ id: z.string() });

export async function updateSchool(values: z.infer<typeof updateSchoolSchema>) {
  const user = await getCurrentUser();
  const validatedValues = updateSchoolSchema.parse(values);
  const { id, ...dataToUpdate } = validatedValues;

  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }

  // Verify that the school belongs to this institution
  const existingSchool = await prisma.school.findUnique({
    where: { id, institutionId: user.id },
  });

  if (!existingSchool) {
    throw new Error("School not found or unauthorized");
  }

  // Handle slug generation if not provided
  if (!dataToUpdate.slug && dataToUpdate.name) {
    dataToUpdate.slug = dataToUpdate.name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-*|-*$/g, "");
  }

  const school = await prisma.school.update({
    where: { id, institutionId: user.id },
    data: dataToUpdate,
  });
  return school;
}

export async function deleteSchool(schoolId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }

  // Verify that the school belongs to this institution
  const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
      institutionId: user.id,
    },
  });

  if (!school) {
    throw new Error("School not found or unauthorized");
  }

  await prisma.school.delete({
    where: {
      id: schoolId,
      institutionId: user.id,
    },
  });
}

const createFacultySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
  coverPhoto: z.string().optional(),
  logo: z.string().optional(),
  schoolId: z.string(),
});

export async function createFaculty(
  values: z.infer<typeof createFacultySchema>
) {
  const validatedValues = createFacultySchema.parse(values);
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }

  const school = await prisma.school.findUnique({
    where: { id: validatedValues.schoolId, institutionId: user.id },
  });

  if (!school) throw new Error("School not found");

  try {
    // Generate a unique slug using the compound unique constraint
    let slug = validatedValues.slug;
    if (!slug) {
      slug = validatedValues.name
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-*|-*$/g, "");

      // Check if slug already exists for this school and generate a unique one
      let existingFaculty = await prisma.faculty.findUnique({
        where: { slug_schoolId: { slug, schoolId: validatedValues.schoolId } },
      });

      let counter = 1;
      while (existingFaculty) {
        slug = `${validatedValues.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}-${counter}`;
        counter++;
        existingFaculty = await prisma.faculty.findUnique({
          where: {
            slug_schoolId: { slug, schoolId: validatedValues.schoolId },
          },
        });
      }
    }

    // Create the faculty directly
    const faculty = await prisma.faculty.create({
      data: {
        name: validatedValues.name,
        description: validatedValues.description,
        logo: validatedValues.logo,
        coverPhoto: validatedValues.coverPhoto,
        slug,
        school: {
          connect: { id: validatedValues.schoolId },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        school: true,
      },
    });

    return { success: true, faculty };
  } catch (error) {
    console.error("Error creating faculty:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A faculty with this slug already exists.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to create faculty. Please try again.");
  }
}

const updateFacultySchema = createFacultySchema.extend({ id: z.string() });

export async function updateFaculty(
  values: z.infer<typeof updateFacultySchema>
) {
  const validatedValues = updateFacultySchema.parse(values);
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }

  // Verify that the faculty belongs to a school owned by this institution
  const faculty = await prisma.faculty.findUnique({
    where: { id: validatedValues.id },
    include: {
      school: true,
    },
  });

  if (!faculty || faculty.school.institutionId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Handle slug generation if not provided
  const data: any = {
    name: validatedValues.name,
    description: validatedValues.description,
    coverPhoto: validatedValues.coverPhoto,
    logo: validatedValues.logo,
  };

  if (!validatedValues.slug && validatedValues.name) {
    data.slug = validatedValues.name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-*|-*$/g, "");
  } else if (validatedValues.slug) {
    data.slug = validatedValues.slug;
  }

  // Only update school if provided and different
  if (
    validatedValues.schoolId &&
    validatedValues.schoolId !== faculty.schoolId
  ) {
    data.school = {
      connect: {
        id: validatedValues.schoolId,
      },
    };
  }

  const facultyResult = await prisma.faculty.update({
    where: { id: validatedValues.id },
    data,
  });
  return facultyResult;
}

export async function deleteFaculty(facultyId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "INSTITUTION") {
    throw new Error("Unauthorized");
  }

  // First, verify that the faculty belongs to a school owned by this institution
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    include: {
      school: true,
    },
  });

  if (!faculty || faculty.school.institutionId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.faculty.delete({
    where: {
      id: facultyId,
    },
  });
}

export async function getProfessorsForFaculty(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return faculty?.members || [];
  } catch (error) {
    console.error("Error fetching professors:", error);
    throw error;
  }
}

export async function assignMemberToFaculty(
  memberId: string,
  facultyId: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "INSTITUTION") {
      throw new Error("Unauthorized");
    }

    // Get member with user details
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        faculty: true,
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Get faculty
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        members: true,
        school: true,
      },
    });

    if (!faculty) {
      throw new Error("Faculty not found");
    }

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        role: "member",
        faculty: {
          connect: { id: facultyId },
        },
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: member.userId },
      data: {
        role: "PROFESSOR",
      },
    });

    return {
      success: true,
      member: updatedMember,
      faculty,
    };
  } catch (error) {
    console.error("Error assigning member to faculty:", error);
    throw error;
  }
}

export async function getFacultyMembers(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        members: {
          where: {
            role: "member",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return faculty?.members || [];
  } catch (error) {
    console.error("Error fetching faculty members:", error);
    throw error;
  }
}

export async function removeProfessorFromFaculty(memberId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "INSTITUTION") {
      throw new Error("Unauthorized");
    }

    // Update member role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        role: "member",
        faculty: {
          disconnect: true,
        },
      },
    });

    return {
      success: true,
      message: "Professor removed from faculty successfully",
      member: updatedMember,
    };
  } catch (error) {
    console.error("Error removing professor from faculty:", error);
    throw error;
  }
}

export async function getFacultyDetails(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        school: true,
      },
    });

    if (!faculty) {
      throw new Error("Faculty not found");
    }

    return faculty;
  } catch (error) {
    console.error("Error fetching faculty details:", error);
    throw error;
  }
}
