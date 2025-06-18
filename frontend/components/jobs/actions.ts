"use server";

import { getJobDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

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
