"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, Plus } from "lucide-react";

import { ResearchesPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import Research from "../researches/Research";
import ResearchesLoadingSkeleton from "../researches/ResearchesLoadingSkeleton";
import { Button } from "../ui/button";
import { useTransition, useMemo, useOptimistic } from "react";
import type { ResearchData } from "@/types/types";

// Import new filter components
import {
  FilterContainer,
  FilterSearchInput,
  FilterSection,
} from "@/components/shared/FilterComponents";

export default function ResearchFeed({ initialData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(
    { category, status, sortBy },
    (
      _,
      newFilters: { category?: string; status?: string; sortBy?: string }
    ) => ({
      category: newFilters.category ?? category,
      status: newFilters.status ?? status,
      sortBy: newFilters.sortBy ?? sortBy,
    })
  );

  const debouncedSearchQuery = useDebounce(searchQuery);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: queryStatus,
  } = useInfiniteQuery({
    queryKey: [
      "researches",
      debouncedSearchQuery,
      optimisticFilters.category,
      optimisticFilters.status,
      optimisticFilters.sortBy,
    ],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/researches", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
            ...(optimisticFilters.category
              ? { category: optimisticFilters.category }
              : {}),
            ...(optimisticFilters.status
              ? { status: optimisticFilters.status }
              : {}),
            ...(optimisticFilters.sortBy
              ? { sortBy: optimisticFilters.sortBy }
              : {}),
          },
        })
        .json<ResearchesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const researches = useMemo(
    () => data?.pages.flatMap((page) => page.researches) ?? [],
    [data]
  );

  const handleSearch = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleCategory = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, category: value });
      setCategory(value);
    });
  };

  const handleStatus = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, status: value });
      setStatus(value);
    });
  };

  const handleSortBy = (value: string) => {
    startTransition(() => {
      setOptimisticFilters({ ...optimisticFilters, sortBy: value });
      setSortBy(value);
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    startTransition(() => {
      setOptimisticFilters(newFilters);
      setCategory(newFilters.category || "");
      setStatus(newFilters.status || "");
      setSortBy(newFilters.sortBy || "");
    });
  };

  const categories = [
    "Computer Science",
    "Biology",
    "Physics",
    "Chemistry",
    "Engineering",
    "Mathematics",
    "Social Sciences",
    "Medicine",
  ];
  const statuses = ["ONGOING", "COMPLETED", "PUBLISHED", "DRAFT"];
  const sortOptions = [
    { value: "", label: "Most Recent" },
    { value: "popular", label: "Most Popular" },
    { value: "oldest", label: "Oldest First" },
    { value: "alphabetical", label: "Alphabetical" },
  ];
  if (queryStatus === "pending") {
    return <ResearchesLoadingSkeleton />;
  }

  if (queryStatus === "success" && !researches.length && !hasNextPage) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-2">No research found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  if (queryStatus === "error") {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading research</div>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }
  return (
    <Fragment>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Research Feed</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover cutting-edge research from across the academic community
          </p>
        </div>
        <Button asChild>
          <Link
            href="/researches/createResearch"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Research
          </Link>
        </Button>
      </div>

      {/* Search */}
      <FilterSearchInput
        placeholder="Search research by title, abstract, or keywords..."
        value={searchQuery}
        onChange={handleSearch}
        isPending={isPending}
      />

      {/* Filters */}
      <FilterContainer
        filters={{ category, status, sortBy }}
        onFiltersChange={handleFiltersChange}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FilterSection
            title="Category"
            options={categories.map((c) => ({ value: c, label: c }))}
            selected={category ? [category] : []}
            onToggle={(value) =>
              handleCategory(value === category ? "" : value)
            }
            type="single"
          />
          <FilterSection
            title="Status"
            options={statuses.map((s) => ({ value: s, label: s }))}
            selected={status ? [status] : []}
            onToggle={(value) => handleStatus(value === status ? "" : value)}
            type="single"
          />
          <FilterSection
            title="Sort By"
            options={sortOptions}
            selected={sortBy ? [sortBy] : []}
            onToggle={(value) => handleSortBy(value === sortBy ? "" : value)}
            type="single"
          />
        </div>
      </FilterContainer>
      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {isPending
            ? "Filtering..."
            : `${researches.length} research items found`}
        </div>
        <InfiniteScrollContainer
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
        >
          {researches.map((research) => (
            <Research key={research.id} research={research} />
          ))}
          {isFetchingNextPage && <ResearchesLoadingSkeleton />}
        </InfiniteScrollContainer>
      </div>
    </Fragment>
  );
}
