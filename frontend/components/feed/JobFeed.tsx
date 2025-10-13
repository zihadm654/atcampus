"use client";

import { useState, useTransition, useOptimistic, useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Briefcase, Search, X } from "lucide-react";

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
  const [isSearching, setIsSearching] = useState(false);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
    // initialData: initialData
    //   ? { pages: [initialData], pageParams: [null] }
    //   : undefined,
  });

  // Update searching state when debounced query changes
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

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

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occurred while loading posts.
      </p>
    );
  }

  // Show "no jobs found" message only when search has been performed and no results
  const showNoResults = debouncedSearchQuery && status === "success" && !jobs.length && !hasNextPage;
  // Show "no jobs posted" message only when no search and no jobs
  const showNoJobs = !debouncedSearchQuery && status === "success" && !jobs.length && !hasNextPage;

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="rounded-xl bg-gradient-to-r max-md:p-2 p-3 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8" />
            <h1 className="font-bold text-3xl">Find Your Dream Job</h1>
          </div>
          <p className="max-w-2xl">
            Discover exciting opportunities to gain practical experience and
            advance your career
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {debouncedSearchQuery && (
              <p className="mt-2 text-sm text-muted-foreground">
                Showing results for "{debouncedSearchQuery}"
              </p>
            )}
          </div>
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

          {/* No results message when search returns nothing */}
          {showNoResults && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No jobs found matching "{debouncedSearchQuery}". Try a different search term.
              </p>
            </div>
          )}

          {/* No jobs message when no jobs exist at all */}
          {showNoJobs && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No jobs have been posted yet.
              </p>
            </div>
          )}

          {/* Only show job grid when we have jobs or are loading more */}
          {(jobs.length > 0 || isFetchingNextPage) && (
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
          )}
        </div>
      </div>
    </div>
  );
}