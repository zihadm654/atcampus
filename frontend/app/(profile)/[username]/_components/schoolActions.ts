'use server';

import { Prisma } from '@prisma/client';
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
        instituteId: user.id,
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
    where: { id: id, instituteId: user.id },
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
    where: { id: schoolId, instituteId: user.id },
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
    where: { id: validatedValues.schoolId, instituteId: user.id },
  });
  if (!school) throw new Error('School not found');
  try {
    const faculty = await prisma.faculty.create({
      data: {
        ...validatedValues,
        slug:
          validatedValues.slug ||
          validatedValues.name
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-*|-*$/g, ''),
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
        professors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return faculty?.professors || [];
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
    // First get the member details
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Create or update professor profile
    const professorProfile = await prisma.professorProfile.upsert({
      where: { userId: member.userId },
      update: {
        faculties: {
          connect: { id: facultyId },
        },
      },
      create: {
        userId: member.userId,
        faculties: {
          connect: { id: facultyId },
        },
      },
    });

    // Update member with faculty assignment
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        facultyId: facultyId,
      },
    });

    return { professorProfile, updatedMember };
  } catch (error) {
    console.error('Error assigning member to faculty:', error);
    throw error;
  }
}
