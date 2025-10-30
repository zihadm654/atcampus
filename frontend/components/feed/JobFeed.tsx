"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import type { JobsPage } from "@/types/types";
import Job from "../jobs/Job";
import JobsLoadingSkeleton from "../jobs/JobsLoadingSkeleton";
import { Button } from "../ui/button";

interface Props {
  user: any;
  initialData?: JobsPage;
}

export default function JobFeed({ user, initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
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

  if (status === "pending") {
    return <JobsLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  // Show "no jobs found" message only when search has been performed and no results
  const showNoResults =
    debouncedSearchQuery &&
    status === "success" &&
    !jobs.length &&
    !hasNextPage;
  // Show "no jobs posted" message only when no search and no jobs
  const showNoJobs =
    !debouncedSearchQuery &&
    status === "success" &&
    !jobs.length &&
    !hasNextPage;

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="rounded-xl bg-gradient-to-r p-3 shadow-lg max-md:p-2">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-input bg-background py-3 pr-10 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or location..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-1 hover:bg-muted"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {isSearching && (
              <div className="-translate-y-1/2 absolute top-1/2 right-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {debouncedSearchQuery && (
              <p className="mt-2 text-muted-foreground text-sm">
                Showing results for "{debouncedSearchQuery}"
              </p>
            )}
          </div>
        </div>
        <div>
          {/* Results Section */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-lg">
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
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No jobs found matching "{debouncedSearchQuery}". Try a different
                search term.
              </p>
            </div>
          )}

          {/* No jobs message when no jobs exist at all */}
          {showNoJobs && (
            <div className="py-8 text-center">
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
                <div key={job.id}>
                  {job ? (
                    <Job job={job} />
                  ) : (
                    <div className="rounded-lg border p-4 text-muted-foreground text-sm">
                      Job data not available
                    </div>
                  )}
                </div>
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
