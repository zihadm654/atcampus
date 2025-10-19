"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import type { ResearchesPage } from "@/types/types";

import Research from "../researches/Research";
import ResearchesLoadingSkeleton from "../researches/ResearchesLoadingSkeleton";
import { Button } from "../ui/button";

export default function ResearchFeed({ initialData }: any) {
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
    queryKey: ["research-feed", "for-you", debouncedSearchQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/researches", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
          },
        })
        .json<ResearchesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Update searching state when debounced query changes
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const researches = useMemo(
    () => data?.pages.flatMap((page) => page.researches) || [],
    [data]
  );
  if (status === "pending") {
    return <ResearchesLoadingSkeleton />;
  }

  // Show "no courses found" message only when search has been performed and no results
  const showNoResults =
    debouncedSearchQuery &&
    status === "success" &&
    !researches.length &&
    !hasNextPage;
  // Show "no courses posted" message only when no search and no courses
  const showNoJobs =
    !debouncedSearchQuery &&
    status === "success" &&
    !researches.length &&
    !hasNextPage;

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <>
      {/* Search and Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-bold text-2xl">Research</h1>
          <Button className="rounded-xl" size="sm" variant="outline">
            <Link href="/researches/createResearch">Create Research</Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-input bg-background py-3 pr-10 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research projects, titles, or descriptions..."
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
      {/* No results message when search returns nothing */}
      {showNoResults && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            No courses found matching "{debouncedSearchQuery}". Try a different
            search term.
          </p>
        </div>
      )}

      {/* No courses message when no jobs exist at all */}
      {showNoJobs && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            No courses have been posted yet.
          </p>
        </div>
      )}
      {(researches.length > 0 || isFetchingNextPage) && (
        <InfiniteScrollContainer
          className="grid grid-cols-3 gap-4 space-y-5 max-md:grid-cols-1"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {researches.map((research) => (
            <Research key={research.id} research={research} />
          ))}
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </>
  );
}
