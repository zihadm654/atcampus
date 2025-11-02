"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  type TUserSkillSchema,
  userSkillSchema,
} from "@/lib/validations/validation";

export async function addSkill(values: TUserSkillSchema) {
  const validatedValues = userSkillSchema.parse(values);

  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  // Find or create the skill
  const skill = await prisma.skill.upsert({
    where: { name: validatedValues.name },
    update: {
      category: validatedValues.category || null,
    },
    create: {
      name: validatedValues.name,
      category: validatedValues.category || null,
      difficulty: validatedValues.difficulty, // Use the skill level as difficulty
      yearsOfExperience: validatedValues.yearsOfExperience, // Store years of experience in the skill model
    },
  });

  // Check if a user skill with the exact same details already exists (excluding deleted skills)
  const existingUserSkill = await prisma.userSkill.findFirst({
    where: {
      userId: user.id,
      skillId: skill.id,
      isDeleted: false, // Only check non-deleted skills
    },
  });

  if (existingUserSkill) {
    throw new Error("User already has this skill.");
  }

  // Create a new user skill
  const newUserSkill = await prisma.userSkill.create({
    data: {
      userId: user.id,
      skillId: skill.id,
      // Note: yearsOfExperience is now stored in the Skill model, not UserSkill
    },
    include: {
      skill: true,
      _count: {
        select: {
          endorsements: true,
        },
      },
    },
  });

  return newUserSkill;
}

export async function updateSkill(id: string, values: TUserSkillSchema) {
  const validatedValues = userSkillSchema.parse(values);

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Find or create the skill
  const skill = await prisma.skill.upsert({
    where: { name: validatedValues.name },
    update: {
      category: validatedValues.category || null,
      yearsOfExperience: validatedValues.yearsOfExperience, // Update years of experience in the skill model
    },
    create: {
      name: validatedValues.name,
      category: validatedValues.category || null,
      difficulty: validatedValues.difficulty, // Use the skill level as difficulty
      yearsOfExperience: validatedValues.yearsOfExperience, // Store years of experience in the skill model
    },
  });

  // Update the user skill
  const updatedUserSkill = await prisma.userSkill.update({
    where: { id, isDeleted: false },
    data: {
      skillId: skill.id,
      // Note: yearsOfExperience is now stored in the Skill model, not UserSkill
    },
    include: {
      skill: true,
      _count: {
        select: {
          endorsements: true,
        },
      },
    },
  });

  return updatedUserSkill;
}

export async function deleteSkill(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Check if the skill belongs to the user
  const userSkill = await prisma.userSkill.findUnique({
    where: { id, isDeleted: false },
    include: {
      skill: true,
      endorsements: {
        where: {
          userSkill: {
            isDeleted: false,
          },
        },
      },
    },
  });

  if (!userSkill) {
    throw new Error("Skill not found");
  }

  if (userSkill.userId !== user.id) {
    throw new Error("Unauthorized to delete this skill");
  }

  // Check if there are endorsements - if so, we soft delete instead
  if (userSkill.endorsements.length > 0) {
    // Soft delete the user skill
    await prisma.userSkill.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  } else {
    // Hard delete if no endorsements
    await prisma.userSkill.delete({
      where: { id },
    });
  }

  return { id, title: userSkill.skill.name };
}
