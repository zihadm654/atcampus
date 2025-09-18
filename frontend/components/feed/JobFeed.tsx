"use client";

import { useState, useTransition, useOptimistic, useMemo } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";

import { JobsPage, JobData } from "@/types/types";
import kyInstance from "@/lib/ky";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import Job from "../jobs/Job";
import JobsLoadingSkeleton from "../jobs/JobsLoadingSkeleton";
import { Button } from "../ui/button";
import { JobType } from "@prisma/client";

import {
  FilterContainer,
  FilterSearchInput,
  FilterSection,
} from "@/components/shared/FilterComponents";

interface Props {
  user: any;
  initialData?: JobsPage;
}

export default function JobFeed({ user, initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100000]);
  const [isPending, startTransition] = useTransition();

  const debouncedSearchQuery = useDebounce(searchQuery);
  const debouncedLocation = useDebounce(location);

  // Optimistic state for filters
  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    searchQuery: debouncedSearchQuery,
    jobTypes,
    location: debouncedLocation,
    salaryRange,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["job-feed", "for-you", optimisticFilters],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/jobs", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(optimisticFilters.searchQuery
              ? { q: optimisticFilters.searchQuery }
              : {}),
            ...(optimisticFilters.jobTypes.length
              ? { type: optimisticFilters.jobTypes.join(",") }
              : {}),
            ...(optimisticFilters.location
              ? { location: optimisticFilters.location }
              : {}),
            ...(optimisticFilters.salaryRange[0] > 0
              ? { minSalary: optimisticFilters.salaryRange[0] }
              : {}),
            ...(optimisticFilters.salaryRange[1] < 100000
              ? { maxSalary: optimisticFilters.salaryRange[1] }
              : {}),
          },
        })
        .json<JobsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? { pages: [initialData], pageParams: [null] }
      : undefined,
  });

  const jobs = useMemo(
    () => data?.pages.flatMap((page) => page.jobs) || [],
    [data]
  );

  const handleJobTypeFilter = (type: JobType) => {
    startTransition(() => {
      setOptimisticFilters((prev) => ({
        ...prev,
        jobTypes: prev.jobTypes.includes(type)
          ? prev.jobTypes.filter((t) => t !== type)
          : [...prev.jobTypes, type],
      }));
      setJobTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    });
  };

  const handleSearch = (query: string) => {
    startTransition(() => {
      setOptimisticFilters((prev) => ({ ...prev, searchQuery: query }));
      setSearchQuery(query);
    });
  };

  const handleLocation = (loc: string) => {
    startTransition(() => {
      setOptimisticFilters((prev) => ({ ...prev, location: loc }));
      setLocation(loc);
    });
  };

  const handleSalaryRange = (range: [number, number]) => {
    startTransition(() => {
      setOptimisticFilters((prev) => ({ ...prev, salaryRange: range }));
      setSalaryRange(range);
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    startTransition(() => {
      setOptimisticFilters({
        searchQuery: newFilters.searchQuery || "",
        jobTypes: newFilters.jobTypes || [],
        location: newFilters.location || "",
        salaryRange: newFilters.salaryRange || [0, 100000],
      });
      setSearchQuery(newFilters.searchQuery || "");
      setJobTypes(newFilters.jobTypes || []);
      setLocation(newFilters.location || "");
      setSalaryRange(newFilters.salaryRange || [0, 100000]);
    });
  };
  // if (status !== "success") {
  //   return <JobsLoadingSkeleton />;
  // }

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

          {/* Search Bar */}
          <FilterSearchInput
            placeholder="Search job titles, companies, or keywords..."
            value={searchQuery}
            onChange={handleSearch}
            isPending={isPending}
          />

          {/* Filters Section */}
          <FilterContainer
            filters={{
              searchQuery,
              jobTypes,
              location,
              salaryRange,
            }}
            onFiltersChange={handleFiltersChange}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-2">
              <FilterSection
                title="Job Type"
                options={Object.values(JobType).map((type) => ({
                  value: type,
                  label: type.replace("_", " "),
                }))}
                selected={jobTypes}
                onToggle={(value) => handleJobTypeFilter(value as JobType)}
                type="multiple"
              />
              <FilterSection
                title="Location"
                options={[
                  { value: "remote", label: "Remote" },
                  { value: "onsite", label: "On-site" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                selected={location ? [location] : []}
                onToggle={(value) =>
                  handleLocation(location === value ? "" : value)
                }
                type="single"
              />
              <FilterSection
                title="Salary Range"
                options={[
                  { value: "0-50000", label: "< $50k" },
                  { value: "50000-80000", label: "$50k-$80k" },
                  { value: "80000-120000", label: "$80k-$120k" },
                  { value: "120000+", label: "$120k+" },
                ]}
                selected={[]}
                onToggle={() => {}} // Handle salary range separately
                type="single"
              />
            </div>
          </FilterContainer>
        </div>
        {/* Results Section */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            {/* <h2 className="text-2xl font-semibold">
              {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
            </h2> */}
            {isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating results...
              </div>
            )}
          </div>

          {status !== "success" ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
              <p className="text-destructive">
                Failed to load jobs. Please try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                // onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : status === "success" && jobs.length === 0 ? (
            <div className="rounded-lg border bg-muted/50 p-6 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
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
