"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Briefcase, Loader2, Search } from "lucide-react";

import { JobsPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import { JobType } from "@/lib/validations/job";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import Job from "../jobs/Job";
import JobsLoadingSkeleton from "../jobs/JobsLoadingSkeleton";
import { Button } from "../ui/button";

interface Props<T> {
  user: T;
}

export default function JobFeed<T>({ user }: Props<T>) {
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
    queryKey: ["job-feed", "for-you", debouncedSearchQuery, jobTypes],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/jobs", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
            ...(jobTypes.length ? { type: jobTypes.join(",") } : {}),
          },
        })
        .json<JobsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const jobs = data?.pages.flatMap((page) => page.jobs) || [];

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
      <p className="text-muted-foreground text-center">
        No one has posted anything yet.
      </p>
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
    <div>
      {/* Header with gradient background */}
      {/* <div className="rounded-xl bg-gradient-to-r from-blue-500/80 to-indigo-600/80 p-6 text-white shadow-md">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="font-bold text-3xl">Supplement Jobs</h1>
          </div>
          <p className="max-w-2xl text-white/90">
            Find and apply for supplement jobs to gain practical experience and
            enhance your skills while studying
          </p>

          <div className="mt-4 flex w-full max-w-md items-center gap-2 rounded-lg bg-white/10 p-1 backdrop-blur-sm">
            <div className="flex h-10 w-full items-center gap-2 rounded-md bg-white px-3 text-gray-800">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                className="h-full w-full border-0 bg-transparent outline-none placeholder:text-gray-400"
                placeholder="Search for jobs..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="h-10 rounded-md hover:bg-blue-800"
              size="sm"
              onClick={() => { }}
            >
              Search
            </Button>
          </div>
        </div>
      </div> */}

      {/* Filters */}
      {/* <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex flex-wrap items-center gap-2 group-hover:cursor-pointer">
          <Button
            className="rounded-full"
            size="sm"
            variant={jobTypes.length === 0 ? "default" : "outline"}
            onClick={() => setJobTypes([])}
          >
            All Jobs
          </Button>
          <Button
            className="rounded-full"
            size="sm"
          // variant={jobTypes.includes("PARTTIME") ? "default" : "outline"}
          // onClick={() => handleJobTypeFilter("REMOTE")}
          >
            Remote
          </Button>
          <Button
            className="rounded-full"
            size="sm"
          // variant={jobTypes.includes("PART_TIME") ? "default" : "outline"}
          // onClick={() => handleJobTypeFilter("PART_TIME")}
          >
            Part-time
          </Button>
          <Button
            className="rounded-full"
            size="sm"
          // variant={jobTypes.includes("FULL_TIME") ? "default" : "outline"}
          // onClick={() => handleJobTypeFilter("FULL_TIME")}
          >
            Full-time
          </Button>
        </div>
        {user.role === "ORGANIZATION" ? (
          <Button className="rounded-xl" size="sm" variant="outline">
            <Link href="/jobs/createJob">Create Job</Link>
          </Button>
        ) : null}
      </div> */}
      <h1 className="text-3xl font-bold pb-4">Jobs</h1>

      <InfiniteScrollContainer
        className="grid grid-cols-3 gap-4 space-y-5 max-md:grid-cols-1"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {jobs.map((job) => (
          <Job key={job.id} job={job} />
        ))}
        {isFetchingNextPage && (
          <Loader2 className="mx-auto my-3 animate-spin" />
        )}
      </InfiniteScrollContainer>
    </div>
  );
}
