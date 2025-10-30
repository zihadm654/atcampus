"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { jobSchema, type TJob } from "@/lib/validations/job";
import { getJobDataInclude } from "@/types/types";

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

    if (user?.role !== "ORGANIZATION" && !user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = jobSchema.safeParse(values);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      console.log("Validation errors:", errors);
      return {
        error: "Invalid fields",
        details: errors,
      };
    }

    const {
      title,
      description,
      summary,
      weeklyHours,
      location,
      type,
      experienceLevel,
      duration,
      salary,
      endDate,
      courseId,
      skills,
    } = validatedFields.data;

    // Create the job with skills stored directly
    const job = await prisma.job.create({
      data: {
        title,
        description,
        summary,
        weeklyHours,
        location,
        type,
        experienceLevel,
        duration,
        salary,
        endDate,
        skills: skills || [],
        userId: user.id,
      },
    });

    // Associate course if provided
    if (courseId) {
      await prisma.jobCourse.create({
        data: {
          jobId: job.id,
          courseId,
        },
      });
    }

    revalidatePath("/jobs");
    revalidateTag("jobs","max");

    return { success: true, data: job };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateJob(values: TJob, jobId: string) {
  try {
    const user = await getCurrentUser();

    if (user?.role !== "ORGANIZATION" && !user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = jobSchema.safeParse(values);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      console.log("Validation errors:", errors);
      return {
        error: "Invalid fields",
        details: errors,
      };
    }

    const {
      title,
      description,
      summary,
      weeklyHours,
      location,
      type,
      experienceLevel,
      duration,
      salary,
      endDate,
      courseId,
      skills,
    } = validatedFields.data;

    // Update the job with skills stored directly
    const job = await prisma.job.update({
      where: {
        id: jobId,
        userId: user.id,
      },
      data: {
        title,
        description,
        summary,
        weeklyHours,
        location,
        type,
        experienceLevel,
        duration,
        salary,
        endDate,
        skills: skills || [],
      },
    });

    // Update course association if provided
    if (courseId) {
      // Delete existing job course associations
      await prisma.jobCourse.deleteMany({
        where: {
          jobId,
        },
      });

      // Create new job course association
      await prisma.jobCourse.create({
        data: {
          jobId,
          courseId,
        },
      });
    }

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs");
    revalidateTag("jobs","max");

    return { success: true, data: jobId };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
