"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Endorses a user's skill
 * @param userSkillId The ID of the user skill to endorse
 * @param skillId The ID of the skill being endorsed
 */
export async function endorseSkill(userSkillId: string, skillId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be logged in to endorse a skill");
  }

  // Check if the user is trying to endorse their own skill
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
    select: { userId: true },
  });

  if (!userSkill) {
    throw new Error("Skill not found");
  }

  if (userSkill.userId === currentUser.id) {
    throw new Error("You cannot endorse your own skill");
  }

  // Create the endorsement
  const endorsement = await prisma.skillEndorsement.upsert({
    where: {
      userSkillId_endorserId: {
        userSkillId,
        endorserId: currentUser.id,
      },
    },
    update: {},
    create: {
      userSkillId,
      endorserId: currentUser.id,
      skillId,
    },
  });

  return endorsement;
}

/**
 * Removes an endorsement from a user's skill
 * @param userSkillId The ID of the user skill to remove the endorsement from
 */
export async function removeEndorsement(userSkillId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be logged in to remove an endorsement");
  }

  // Remove the endorsement
  const endorsement = await prisma.skillEndorsement.delete({
    where: {
      userSkillId_endorserId: {
        userSkillId,
        endorserId: currentUser.id,
      },
    },
  });

  return endorsement;
}

/**
 * Gets the endorsements for a user skill
 * @param userSkillId The ID of the user skill to get endorsements for
 */
export async function getSkillEndorsements(userSkillId: string) {
  const endorsements = await prisma.skillEndorsement.findMany({
    where: { userSkillId },
    include: {
      endorser: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return endorsements;
}
