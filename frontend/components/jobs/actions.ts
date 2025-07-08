"use server";

import { revalidatePath } from "next/cache";

import { getJobDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { jobSchema, TJob } from "@/lib/validations/job";

export async function deleteJob(id: string) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) throw new Error("Job not found");

  if (job.userId !== user.id) throw new Error("Unauthorized");

  const deletedJob = await prisma.job.delete({
    where: { id },
    include: getJobDataInclude(user.id),
  });

  return deletedJob;
}

export async function getJobs() {
  const jobs = await prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  if (jobs.length === 0) {
    return [];
  }
  return jobs;
}

export async function createJob(values: TJob) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = jobSchema.safeParse(values);

    if (!validatedFields.success) {
      throw new Error(validatedFields.error.message);
    }

    const { startDate, endDate, ...rest } = validatedFields.data;
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        ...rest,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });

    revalidatePath("/jobs");

    return { success: true, data: job };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
