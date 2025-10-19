"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import Job from "@/components/jobs/Job";
import JobsLoadingSkeleton from "@/components/jobs/JobsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import type { JobsPage } from "@/types/types";

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
          pageParam ? { searchParams: { cursor: pageParam } } : {}
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
      <p className="text-center text-muted-foreground">
        You don&apos;t have any bookmarks yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
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
        <Job job={job} key={job.id} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
