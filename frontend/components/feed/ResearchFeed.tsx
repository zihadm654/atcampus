"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { ResearchesPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import ResearchesLoadingSkeleton from "../researches/ResearchesLoadingSkeleton";
import Research from "../researches/Research";

export default function ResearchFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["research-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/researches",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<ResearchesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const researches = data?.pages.flatMap((page) => page.researches) || [];
  if (status === "pending") {
    return <ResearchesLoadingSkeleton />;
  }

  if (status === "success" && !researches.length && !hasNextPage) {
    return (
      <p className="text-muted-foreground text-center">
        No one has posted anything yet.
      </p>
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
