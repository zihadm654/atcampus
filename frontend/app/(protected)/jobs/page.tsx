import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import JobFeed from "@/components/feed/JobFeed";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getJobDataInclude } from "@/types/types";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import Job from "@/components/jobs/Job";

export const metadata: Metadata = constructMetadata({
  title: "Supplement Jobs - AtCampus",
  description:
    "Find and apply for supplement jobs to gain practical experience.",
});

const getAppliedJobs = cache(async (userId: string) => {
  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      job: {
        include: getJobDataInclude(userId),
      },
      id: true,
    },
  });
  return applications;
});

const getInitialJobs = cache(async (userId: string) => {
  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      endDate: {
        gte: new Date(),
      },
    },
    include: getJobDataInclude(userId),
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  return {
    jobs,
    nextCursor: jobs.length === 12 ? jobs[11].id : null,
  };
});

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [appliedJobs, initialJobsData] = await Promise.all([
    getAppliedJobs(user.id),
    getInitialJobs(user.id),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <JobFeed user={user} initialData={initialJobsData} />
    </div>
  );
}
