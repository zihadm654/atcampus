"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import type { CoursesPage } from "@/types/types";
import Course from "../courses/Course";
import CourseLoadingSkeleton from "../courses/CourseLoadingSkeleton";

interface Props {
  user: any;
  initialData: any;
}

export default function CourseFeed({ user }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // const [jobTypes, setJobTypes] = useState<JobType[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["course-feed", "for-you", debouncedSearchQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/courses", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
            // ...(jobTypes.length ? { type: jobTypes.join(",") } : {}),
          },
        })
        .json<CoursesPage>(),
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

  const courses = useMemo(
    () => data?.pages.flatMap((page) => page.courses) || [],
    [data],
  );

  if (status === "pending") {
    return <CourseLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  // Show "no courses found" message only when search has been performed and no results
  const showNoResults =
    debouncedSearchQuery &&
    status === "success" &&
    !courses.length &&
    !hasNextPage;
  // Show "no courses posted" message only when no search and no courses
  const showNoJobs =
    !debouncedSearchQuery &&
    status === "success" &&
    !courses.length &&
    !hasNextPage;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-background py-3 pr-10 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, code, or description..."
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

      {/* Only show course grid when we have courses or are loading more */}
      {(courses.length > 0 || isFetchingNextPage) && (
        <InfiniteScrollContainer
          className="grid grid-cols-3 xl:grid-cols-4 gap-3 space-y-5 max-md:grid-cols-1"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {courses.map((course) => (
            <Course course={course} key={course.id} />
          ))}
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}
