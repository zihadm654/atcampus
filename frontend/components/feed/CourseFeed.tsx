"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { CoursesPage } from "@/types/types";
import kyInstance from "@/lib/ky";
import useDebounce from "@/hooks/useDebounce";
import InfiniteScrollContainer from "@/components/feed/InfiniteScrollContainer";

import { Button } from "../ui/button";
import CourseLoadingSkeleton from "../courses/CourseLoadingSkeleton";
import Course from "../courses/Course";

interface Props {
  user: any;
}

export default function CourseFeed({ user }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  // const [jobTypes, setJobTypes] = useState<JobType[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery);

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

  const courses = data?.pages.flatMap((page) => page.courses) || [];

  // const handleJobTypeFilter = (type: JobType) => {
  //   setJobTypes((prev) =>
  //     prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
  //   );
  // };
  if (status === "pending") {
    return <CourseLoadingSkeleton />;
  }

  if (status === "success" && !courses.length && !hasNextPage) {
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
    <div>
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="">
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">
            Browse and enroll in courses to enhance your skills
          </p>
        </div>
        {/* {user.role === "PROFESSOR" && ( */}
        <Button className="rounded-xl" size="sm" variant="outline">
          <Link href="/courses/createCourse">Create Course</Link>
        </Button>
        {/* )} */}
      </div>

      <InfiniteScrollContainer
        className="grid grid-cols-3 gap-4 space-y-5 max-md:grid-cols-1"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {courses.map((course) => (
          <Course key={course.id} course={course} />
        ))}
        {isFetchingNextPage && (
          <Loader2 className="mx-auto my-3 animate-spin" />
        )}
      </InfiniteScrollContainer>
    </div>
  );
}
