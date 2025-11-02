import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { cache } from "react";
import JobFeed from "@/components/feed/JobFeed";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getJobDataInclude } from "@/types/types";

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

  const [_appliedJobs, initialJobsData] = await Promise.all([
    getAppliedJobs(user.id),
    getInitialJobs(user.id),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8" />
          <h1 className="font-bold text-3xl">Find Your Dream Job</h1>
        </div>
        <p className="max-w-2xl">
          Discover exciting opportunities to gain practical experience and
          advance your career
        </p>
      </div>
      <JobFeed initialData={initialJobsData} user={user} />
    </div>
  );
}
