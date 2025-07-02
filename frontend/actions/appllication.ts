"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const applyJob = async (jobId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const existingApplication = await prisma.application.findFirst({
      where: {
        applicantId: user.id,
        jobId: jobId,
      },
    });

    if (existingApplication) {
      // Optionally, handle the case where the user has already applied
      // For now, we'll just return and not create a duplicate application
      return { success: false, message: "Already applied to this job." };
    }

    await prisma.application.create({
      data: {
        applicantId: user.id,
        jobId: jobId,
        status: "pending", // Default status
      },
    });

    revalidatePath("/jobs");
    return {
      success: true,
      message: "Job application submitted successfully.",
    };
  } catch (error) {
    console.error("Error applying for job:", error);
    throw new Error("Failed to apply for job.");
  }
};
