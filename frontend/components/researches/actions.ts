"use server";

import { getResearchDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function deleteResearch(id: string) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const research = await prisma.research.findUnique({
    where: { id },
  });

  if (!research) throw new Error("Research not found");

  if (research.userId !== user.id) throw new Error("Unauthorized");

  const deletedResearch = await prisma.research.delete({
    where: { id },
    include: getResearchDataInclude(user.id),
  });

  return deletedResearch;
}

export async function getResearches() {
  const researches = await prisma.research.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  if (researches.length === 0) {
    return [];
  }
  return researches;
}
