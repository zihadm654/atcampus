"use client";
import React from 'react';

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PostsPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";

interface UserPostsProps {
  userId: string;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-muted-foreground text-center">
        This user hasn&apos;t posted anything yet.
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
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
