"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { JobsPage } from "@/types/types";
import Job from "./Job";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JobsSectionGridProps {
  title: string;
  endpoint: string;
  userRole?: string;
  filter?: (jobs: JobsPage["jobs"]) => JobsPage["jobs"];
}

export default function JobsSectionGrid({
  title,
  endpoint,
  userRole,
  filter,
}: JobsSectionGridProps) {
  const { data, isLoading, isError, refetch } = useQuery<JobsPage>({
    queryKey: ["jobs-section", title, endpoint],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const jobs = filter ? filter(data?.jobs ?? []) : data?.jobs ?? [];
  const displayJobs = jobs.slice(0, 4);

  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">{title} ({jobs.length})</h2>
        <div className="flex items-center gap-2">
          <Button
            aria-label={`Refresh ${title}`}
            onClick={() => refetch()}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Unable to load {title.toLowerCase()}. Please try again.
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              className="flex h-64 items-center justify-center"
              key={i}
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </Card>
          ))}
        </div>
      ) : displayJobs.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayJobs.map((job) => (
            <Job job={job} key={job.id} />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No items to display.</p>
        </Card>
      )}
    </section>
  );
}