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
export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobs = await getAppliedJobs(user.id);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Job listings */}
      <JobFeed user={user} />
      {user.role === "STUDENT" && (
        <>
          <h3 className="text-xl">Jobs you have applied</h3>
          {jobs.length > 0 ? (
            jobs.map((item) => <Job key={item.job.id} job={item.job} />)
          ) : (
            <div className="flex flex-col items-center">
              <Icons.job className="size-10" />
              <p>No job or activities added yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
