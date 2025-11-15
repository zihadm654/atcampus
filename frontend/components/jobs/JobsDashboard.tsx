"use client";

import JobsSectionGrid from "./JobsSectionGrid";
import type { JobsPage } from "@/types/types";

interface Props {
  user: { role: string };
}

export default function JobsDashboard({ user }: Props) {
  const now = Date.now();
  const filterHistory = (jobs: JobsPage["jobs"]) =>
    jobs.filter((j) => new Date(j.endDate).getTime() < now);

  return (
    <div className="space-y-8">
      <JobsSectionGrid endpoint="/api/jobs/appliedJobs" title="Job You Applied" />

      <JobsSectionGrid endpoint="/api/jobs" title="Recommended" />

      <JobsSectionGrid
        endpoint="/api/jobs/appliedJobs"
        filter={filterHistory}
        title="History"
      />
    </div>
  );
}