"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { researchSchema, type TResearch } from "@/lib/validations/research";
import { getResearchDataInclude } from "@/types/types";

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
export async function createResearch(values: TResearch) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = researchSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Create research.",
      };
    }

    const { title, description, mediaIds } = validatedFields.data;

    const research = await prisma.research.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    if (mediaIds && mediaIds.length > 0) {
      await prisma.media.updateMany({
        where: {
          id: {
            in: mediaIds,
          },
        },
        data: {
          researchId: research.id,
        },
      });
    }

    revalidatePath("/researches");

    return research;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create research");
  }
}
