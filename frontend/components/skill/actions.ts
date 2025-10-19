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
    where: { name: validatedValues.title },
    update: {
      category: validatedValues.category || null,
    },
    create: {
      name: validatedValues.title,
      category: validatedValues.category || null,
    },
  });

  // Check if a user skill with the exact same details already exists
  const existingUserSkill = await prisma.userSkill.findFirst({
    where: {
      userId: user.id,
      skillId: skill.id,
      level: validatedValues.level,
      yearsOfExperience: validatedValues.yearsOfExperience,
    },
  });

  if (existingUserSkill) {
    throw new Error(
      "User already has this skill with the same level and years of experience."
    );
  }

  // Create a new user skill
  const newUserSkill = await prisma.userSkill.create({
    data: {
      userId: user.id,
      skillId: skill.id,
      title: validatedValues.title,
      level: validatedValues.level,
      yearsOfExperience: validatedValues.yearsOfExperience,
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
    where: { name: validatedValues.title },
    update: {
      category: validatedValues.category || null,
    },
    create: {
      name: validatedValues.title,
      category: validatedValues.category || null,
    },
  });

  // Update the user skill
  const updatedUserSkill = await prisma.userSkill.update({
    where: { id },
    data: {
      skillId: skill.id,
      title: validatedValues.title,
      level: validatedValues.level,
      yearsOfExperience: validatedValues.yearsOfExperience,
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
    where: { id },
    select: { userId: true, title: true },
  });

  if (!userSkill) {
    throw new Error("Skill not found");
  }

  if (userSkill.userId !== user.id) {
    throw new Error("Unauthorized to delete this skill");
  }

  await prisma.userSkill.delete({
    where: { id },
  });

  return { id, title: userSkill.title };
}
