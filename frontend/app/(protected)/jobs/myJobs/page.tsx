import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getJobDataInclude } from "@/types/types";
import MyJobs from "./myJobs";

export const metadata: Metadata = constructMetadata({
  title: "My-Jobs - AtCampus",
  description:
    "Find and apply for jobs to gain practical experience.",
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
   <div className="w-full min-w-0 space-y-5">
         <div className="rounded-2xl bg-card p-5 shadow-sm">
           <h1 className="text-center font-bold text-2xl">My Jobs</h1>
         </div>
         <MyJobs />
       </div>
  );
}
