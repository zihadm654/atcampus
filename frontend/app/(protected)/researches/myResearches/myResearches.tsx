"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import Research from "@/components/researches/Research";
import ResearchLoadingSkeleton from "@/components/researches/ResearchesLoadingSkeleton";
import kyInstance from "@/lib/ky";
import type { MyResearchesPage } from "@/types/types";

export default function MyResearches() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["research-feed", "my-Researches"],
    queryFn: async ({ pageParam }) => {
      const response = await kyInstance.get(
        "/api/researches/myResearches",
        pageParam ? { searchParams: { cursor: pageParam } } : {}
      );
      return response.json<MyResearchesPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      // Return a value that indicates we have more data
      // For simplicity, we'll return the owned researches cursor
      // In a more complex implementation, we might need to handle both cursors
      return lastPage.ownedResearches.nextCursor || lastPage.collaborativeResearches.nextCursor || undefined;
    },
  });

  const ownedResearches = data?.pages.flatMap((page) => page.ownedResearches.researches) || [];
  const collaborativeResearches = data?.pages.flatMap((page) => page.collaborativeResearches.researches) || [];

  if (status === "pending") {
    return <ResearchLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading research projects.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Owned Research Projects Section */}
      <section>
        <h2 className="font-bold text-xl mb-4">My Research Projects</h2>
        {ownedResearches.length === 0 ? (
          <div className="min-h-30">
            <p className="text-center text-muted-foreground">
              You haven&apos;t created any research projects yet.
            </p>
          </div>
        ) : (
          <InfiniteScrollContainer
            className="space-y-5 grid grid-cols-3 gap-4 max-md:grid-cols-1"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            {ownedResearches.map((research) => (
              <Research key={research.id} research={research} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
          </InfiniteScrollContainer>
        )}
      </section>

      {/* Collaborative Research Projects Section */}
      <section>
        <h2 className="font-bold text-xl mb-4">Collaborative Research Projects</h2>
        {collaborativeResearches.length === 0 ? (
          <div className="min-h-30">
            <p className="text-center text-muted-foreground">
              You aren&apos;t collaborating on any research projects yet.
            </p>
          </div>
        ) : (
          <InfiniteScrollContainer
            className="space-y-5 grid grid-cols-3 gap-4 max-md:grid-cols-1"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            {collaborativeResearches.map((research) => (
              <Research key={research.id} research={research} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
          </InfiniteScrollContainer>
        )}
      </section>

      {/* History Research Projects Section */}
      <section>
        <h2 className="font-bold text-xl mb-4">History Research Projects</h2>
        {collaborativeResearches.length === 0 ? (
          <div className="min-h-30">
            <p className="text-center text-muted-foreground">
              You aren&apos;t collaborating on any research projects yet.
            </p>
          </div>
        ) : (
          <InfiniteScrollContainer
            className="space-y-5 grid grid-cols-3 gap-4 max-md:grid-cols-1"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            {collaborativeResearches.map((research) => (
              <Research key={research.id} research={research} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
          </InfiniteScrollContainer>
        )}
      </section>
    </div>
  );
}