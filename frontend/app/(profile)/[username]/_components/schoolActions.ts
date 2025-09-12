'use server';

import { MemberRole, Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

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
  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }
  try {
    const school = await prisma.school.create({
      data: {
        ...validatedValues,
        organizationId: user.id,
        slug: validatedValues.slug || validatedValues.name
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-*|-*$/g, ''),
      },
    });
    return school;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A school with this slug already exists.');
    }
    throw error;
  }
}

const updateSchoolSchema = createSchoolSchema.extend({ id: z.string() });

export async function updateSchool(values: z.infer<typeof updateSchoolSchema>) {
  const user = await getCurrentUser();
  const validatedValues = updateSchoolSchema.parse(values);
  const { id, ...dataToUpdate } = updateSchoolSchema.parse(values);

  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }
  const school = await prisma.school.update({
    where: { id: id, organizationId: user.id },
    data: dataToUpdate,
  });
  return school;
}

export async function deleteSchool(schoolId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }
  await prisma.school.delete({
    where: { id: schoolId, organizationId: user.id },
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

  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }

  const school = await prisma.school.findUnique({
    where: { id: validatedValues.schoolId, organizationId: user.id },
  });

  if (!school) throw new Error('School not found');

  try {
    // Create a default member for the faculty with faculty assignment
    const defaultMember = await prisma.member.create({
      data: {
        userId: user.id,
        role: MemberRole.ORGANIZATION_ADMIN,
        organizationId: school.organizationId,
        facultyId: null, // Will be set after faculty creation
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        name: validatedValues.name,
        description: validatedValues.description,
        logo: validatedValues.logo,
        coverPhoto: validatedValues.coverPhoto,
        slug:
          validatedValues.slug ||
          validatedValues.name
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-*|-*$/g, ''),
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

    // Update the member to associate with the new faculty
    await prisma.member.update({
      where: { id: defaultMember.id },
      data: {
        facultyId: faculty.id,
      },
    });

    return faculty;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A faculty with this slug already exists.');
    }
    throw error;
  }
}

const updateFacultySchema = createFacultySchema.extend({ id: z.string() });

export async function updateFaculty(
  values: z.infer<typeof updateFacultySchema>
) {
  const validatedValues = updateFacultySchema.parse(values);
  const user = await getCurrentUser();
  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }
  const data: any = {
    name: validatedValues.name,
    description: validatedValues.description,
    slug: validatedValues.slug,
    coverPhoto: validatedValues.coverPhoto,
    logo: validatedValues.logo,
  };
  if (validatedValues.schoolId) {
    data.school = {
      connect: {
        id: validatedValues.schoolId,
      },
    };
  }
  const faculty = await prisma.faculty.update({
    where: { id: validatedValues.id },
    data,
  });
  return faculty;
}

export async function deleteFaculty(facultyId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'INSTITUTION') {
    throw new Error('Unauthorized');
  }
  await prisma.faculty.delete({ where: { id: facultyId } });
}

export async function getProfessorsForFaculty(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        members: {
          include: {
            user: true
          },
        },
      },
    });

    return faculty?.members || [];
  } catch (error) {
    console.error('Error fetching professors:', error);
    throw error;
  }
}

export async function assignMemberToFaculty(
  memberId: string,
  facultyId: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'INSTITUTION') {
      throw new Error('Unauthorized');
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
      throw new Error('Member not found');
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
      throw new Error('Faculty not found');
    }

    // Create professor profile if it doesn't exist
    // const professorProfile = await prisma.members.upsert({
    //   where: {
    //     professorId: member.userId,
    //   },
    //   update: {
    //     faculties: {
    //       connect: { id: facultyId },
    //     },
    //   },
    //   create: {
    //     professorId: member.userId,
    //     faculties: {
    //       connect: { id: facultyId },
    //     },
    //   },
    // });

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        role: MemberRole.PROFESSOR,
        faculty: {
          connect: { id: facultyId },
        },
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: member.userId },
      data: {
        role: MemberRole.PROFESSOR,
      },
    });

    // Update faculty with the new professor
    // await prisma.faculty.update({
    //   where: { id: facultyId },
    //   data: {
    //     members: {
    //       connect: { id: professorProfile.id },
    //     },
    //   },
    // });

    return {
      success: true,
      member: updatedMember,
      // professorProfile,
      faculty,
    };
  } catch (error) {
    console.error('Error assigning member to faculty:', error);
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
            role: MemberRole.STUDENT,
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
    console.error('Error fetching faculty members:', error);
    throw error;
  }
}

export async function removeProfessorFromFaculty(
  memberId: string,
  facultyId: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'INSTITUTION') {
      throw new Error('Unauthorized');
    }

    // Remove faculty connection from professor profile
    // await prisma.member.update({
    //   where: {
    //     userId_organizationId: { userId: memberId, organizationId: facultyId },
    //   },
    //   data: {
    //     faculty: {
    //       disconnect: { id: facultyId },
    //     },
    //   },
    // });

    // Update member role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        role: MemberRole.STUDENT,
        faculty: {
          disconnect: true,
        },
      },
    });

    return {
      success: true,
      message: 'Professor removed from faculty successfully',
      member: updatedMember,
    };
  } catch (error) {
    console.error('Error removing professor from faculty:', error);
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
            user: true
          },
        },
        school: true,
      },
    });

    if (!faculty) {
      throw new Error('Faculty not found');
    }

    return faculty;
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    throw error;
  }
}
