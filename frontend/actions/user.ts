import { prisma } from '@/lib/db';
import { getCurrentSession } from '@/lib/session';
import { TUserSkillSchema, userSkillSchema } from '@/lib/validations/validation';
import { z } from 'zod';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        name: true,
        emailVerified: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export async function updateSkill(id: string, data: TUserSkillSchema) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update skills");
    }

    // Validate input data
    const validatedData = userSkillSchema.parse(data);

    // Check if user owns this skill
    const existingSkill = await prisma.userSkill.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingSkill) {
      throw new Error("Skill not found");
    }

    if (existingSkill.userId !== session.user.id) {
      throw new Error("You can only update your own skills");
    }

    // Check for duplicate skill title (case-insensitive)
    const duplicateSkill = await prisma.skill.findFirst({
      where: {
        name: { equals: validatedData.title, mode: "insensitive" },
        userSkills: {
          some: {
            userId: session.user.id,
            id: { not: id }, // Exclude current skill
          },
        },
      },
    });

    if (duplicateSkill) {
      throw new Error("You already have a skill with this name");
    }

    // Create or update the skill
    const skill = await prisma.skill.upsert({
      where: { name: validatedData.title },
      update: { category: validatedData.category },
      create: { name: validatedData.title, category: validatedData.category },
    });

    // Update the user's skill
    const userSkill = await prisma.userSkill.update({
      where: { id },
      data: {
        level: validatedData.level,
        yearsOfExperience: validatedData.yearsOfExperience,
        skillId: skill.id,
      },
      include: {
        skill: true,
        _count: {
          select: { endorsements: true },
        },
      },
    });

    return userSkill;
  } catch (error) {
    console.error("Error updating skill:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0]?.message || "Invalid skill data");
    }
    throw error;
  }
}

export async function deleteSkill(id: string) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("You must be logged in to delete skills");
    }

    // Check if user owns this skill
    const existingSkill = await prisma.userSkill.findUnique({
      where: { id },
      select: { userId: true, title: true },
    });

    if (!existingSkill) {
      throw new Error("Skill not found");
    }

    if (existingSkill.userId !== session.user.id) {
      throw new Error("You can only delete your own skills");
    }

    // Check for existing endorsements
    const endorsementCount = await prisma.skillEndorsement.count({
      where: { userSkillId: id },
    });

    if (endorsementCount > 0) {
      throw new Error(`Cannot delete skill "${existingSkill.title}" as it has ${endorsementCount} endorsement${endorsementCount > 1 ? 's' : ''}`);
    }

    const skill = await prisma.userSkill.delete({
      where: { id, userId: session.user.id },
    });

    return skill;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
}
