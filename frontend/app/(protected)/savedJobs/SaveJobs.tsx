"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { JobsPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import Job from "@/components/jobs/Job";
import JobsLoadingSkeleton from "@/components/jobs/JobsLoadingSkeleton";

export default function SaveJobs() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["job-feed", "saved-jobs"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/jobs/savedJobs",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<JobsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const jobs = data?.pages.flatMap((page) => page.jobs) || [];

  if (status === "pending") {
    return <JobsLoadingSkeleton />;
  }

  if (status === "success" && !jobs.length && !hasNextPage) {
    return (
      <p className="text-muted-foreground text-center">
        You don&apos;t have any bookmarks yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occurred while loading bookmarks.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {jobs.map((job) => (
        <Job key={job.id} job={job} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
