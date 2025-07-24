"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { ResearchesPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import Research from "@/components/researches/Research";
import ResearchLoadingSkeleton from "@/components/researches/ResearchesLoadingSkeleton";

export default function Bookmarks() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["research-feed", "savedResearches"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/researches/savedResearches",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<ResearchesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const researches = data?.pages.flatMap((page) => page.researches) || [];

  if (status === "pending") {
    return <ResearchLoadingSkeleton />;
  }

  if (status === "success" && !researches.length && !hasNextPage) {
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
      {researches.map((research) => (
        <Research key={research.id} research={research} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
