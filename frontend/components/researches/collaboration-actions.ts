"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function sendCollaborationRequest(researchId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const existingRequest = await prisma.collaborationRequest.findFirst({
    where: { researchId, requesterId: user.id, status: "PENDING" },
  });
  if (existingRequest) {
    return { success: false, message: "Already Requested collaboration." };
  }
  const research = await prisma.research.findFirst({
    where: {
      id: researchId,
    },
    include: {
      collaborationRequests: true,
      collaborators: true,
      user: true,
    },
  });
  if (!research) {
    return { success: false, message: "research not found." };
  }
  if (research.userId === user.id) {
    return {
      success: false,
      message: "You cannot request collaboration to your own research.",
    };
  }
  const request = await prisma.collaborationRequest.create({
    data: { researchId, requesterId: user.id },
  });

  revalidatePath(`/researches/${researchId}`);
  return { request, success: true, message: "request for collaboration sent" };
}

export async function acceptCollaborationRequest(requestId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const request = await prisma.collaborationRequest.findUnique({
    where: { id: requestId },
    include: { research: true },
  });
  if (!request || request.research.userId !== user.id)
    throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    await tx.research.update({
      where: { id: request.researchId },
      data: { collaborators: { connect: { id: request.requesterId } } },
    });
    await tx.collaborationRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });
  });

  revalidatePath(`/researches/${request.researchId}`);
  return { success: true };
}

export async function declineCollaborationRequest(requestId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const request = await prisma.collaborationRequest.findUnique({
    where: { id: requestId },
    include: { research: true },
  });
  if (!request || request.research.userId !== user.id)
    throw new Error("Unauthorized");

  await prisma.collaborationRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED" },
  });

  revalidatePath(`/researches/${request.researchId}`);
  return { success: true };
}
