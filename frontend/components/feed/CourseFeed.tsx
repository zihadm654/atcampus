"use client";

import { useState, useTransition, useMemo, useOptimistic } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter } from "lucide-react";
import kyInstance from "@/lib/ky";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import { CoursesPage } from "@/types/types";
import CourseLoadingSkeleton from "../courses/CourseLoadingSkeleton";

// Import new filter components
import {
  FilterContainer,
  FilterSearchInput,
  FilterSection,
} from "@/components/shared/FilterComponents";
import Course from "../courses/Course";

interface Props {
  user?: any;
  initialData: any;
}

export default function CourseFeed({ user }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [level, setLevel] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [credits, setCredits] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(
    { level, department, credits },
    (
      _,
      newFilters: { level?: string; department?: string; credits?: string }
    ) => ({
      level: newFilters.level ?? level,
      department: newFilters.department ?? department,
      credits: newFilters.credits ?? credits,
    })
  );

  const debouncedSearchQuery = useDebounce(searchQuery);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [
      "courses",
      debouncedSearchQuery,
      optimisticFilters.level,
      optimisticFilters.department,
      optimisticFilters.credits,
    ],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/courses", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
            ...(optimisticFilters.level
              ? { level: optimisticFilters.level }
              : {}),
            ...(optimisticFilters.department
              ? { department: optimisticFilters.department }
              : {}),
            ...(optimisticFilters.credits
              ? { credits: optimisticFilters.credits }
              : {}),
          },
        })
        .json<CoursesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const courses = useMemo(
    () => data?.pages.flatMap((page) => page.courses) ?? [],
    [data]
  );

  const handleSearch = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleLevel = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, level: value });
      setLevel(value);
    });
  };

  const handleDepartment = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, department: value });
      setDepartment(value);
    });
  };

  const handleCredits = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, credits: value });
      setCredits(value);
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    startTransition(() => {
      setOptimisticFilters(newFilters);
      setLevel(newFilters.level || "");
      setDepartment(newFilters.department || "");
      setCredits(newFilters.credits || "");
    });
  };

  const levels = ["UNDERGRADUATE", "GRADUATE", "PHD"];
  const departments = [
    "Computer Science",
    "Mathematics",
    "Engineering",
    "Business",
    "Arts",
    "Science",
  ];
  const creditOptions = ["1", "2", "3", "4", "5", "6+"];

  return (
    <div className="space-y-6">
      {/* Search */}
      <FilterSearchInput
        placeholder="Search courses by title, code, or description..."
        value={searchQuery}
        onChange={handleSearch}
        isPending={isPending}
      />

      {/* Filters */}
      <FilterContainer
        filters={{ level, department, credits }}
        onFiltersChange={handleFiltersChange}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FilterSection
            title="Level"
            options={levels.map((l) => ({ value: l, label: l }))}
            selected={level ? [level] : []}
            onToggle={(value) => handleLevel(value === level ? "" : value)}
            type="single"
          />
          <FilterSection
            title="Department"
            options={departments.map((d) => ({ value: d, label: d }))}
            selected={department ? [department] : []}
            onToggle={(value) =>
              handleDepartment(value === department ? "" : value)
            }
            type="single"
          />
          <FilterSection
            title="Credits"
            options={creditOptions.map((c) => ({ value: c, label: c }))}
            selected={credits ? [credits] : []}
            onToggle={(value) => handleCredits(value === credits ? "" : value)}
            type="single"
          />
        </div>
      </FilterContainer>

      {/* Results */}
      <div className="space-y-4">
        {status === "pending" ? (
          <CourseLoadingSkeleton />
        ) : status === "success" && !courses.length && !isFetching ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No courses found</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : status === "error" ? (
          <div className="text-center py-8">
            <div className="text-destructive mb-2">Error loading courses</div>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {isPending ? "Filtering..." : `${courses.length} courses found`}
            </div>
            <InfiniteScrollContainer
              onBottomReached={() =>
                hasNextPage && !isFetching && fetchNextPage()
              }
              className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            >
              {courses.map((course) => (
                <Course key={course.id} course={course} />
              ))}
              {isFetchingNextPage && <CourseLoadingSkeleton />}
            </InfiniteScrollContainer>
          </>
        )}
      </div>
    </div>
  );
}
