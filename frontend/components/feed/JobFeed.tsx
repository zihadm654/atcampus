"use client";

import { useState, useTransition, useOptimistic, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Briefcase } from "lucide-react";

import { JobsPage, JobData } from "@/types/types";
import kyInstance from "@/lib/ky";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import Job from "../jobs/Job";
import JobsLoadingSkeleton from "../jobs/JobsLoadingSkeleton";
import { Button } from "../ui/button";
import { JobType } from "@prisma/client";

import Link from "next/link";

interface Props {
  user: any;
  initialData?: JobsPage;
}

export default function JobFeed({ user, initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["job-feed", "for-you", debouncedSearchQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/jobs", {
          searchParams: {
            q: debouncedSearchQuery,
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
            ...(jobTypes.length ? { type: jobTypes.join(",") } : {}),
          },
        })
        .json<JobsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // initialData: initialData
    //   ? { pages: [initialData], pageParams: [null] }
    //   : undefined,
  });

  const jobs = useMemo(
    () => data?.pages.flatMap((page) => page.jobs) || [],
    [data]
  );
  const handleJobTypeFilter = (type: JobType) => {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  if (status === "pending") {
    return <JobsLoadingSkeleton />;
  }
  if (status === "success" && !jobs.length && !hasNextPage) {
    return (
      <>
        <h2 className="text-2xl">Jobs</h2>
        <p className="text-muted-foreground text-center">
          No one has posted anything yet.
        </p>
      </>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="rounded-xl bg-gradient-to-r  p-3 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8" />
            <h1 className="font-bold text-3xl">Find Your Dream Job</h1>
          </div>
          <p className="max-w-2xl">
            Discover exciting opportunities to gain practical experience and
            advance your career
          </p>
        </div>
        <div>
          {/* Results Section */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
            </h2>
            {user.role === "ORGANIZATION" && (
              <Button className="rounded-xl" size="sm" variant="outline">
                <Link href="/jobs/createJob">Create Job</Link>
              </Button>
            )}
          </div>

          <InfiniteScrollContainer
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
            onBottomReached={() =>
              hasNextPage && !isFetching && fetchNextPage()
            }
          >
            {jobs.map((job) => (
              <Job key={job.id} job={job} />
            ))}
            {isFetchingNextPage && (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </InfiniteScrollContainer>
        </div>
      </div>
    </div>
  );
}
