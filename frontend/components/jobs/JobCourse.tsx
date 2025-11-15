"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseData } from "@/types";
import Course from "../courses/Course";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface JobCourseProps {
  courseId: string;
}

export default function JobCourse({ courseId }: JobCourseProps) {
  const {
    data: course,
    isLoading,
    error,
  } = useQuery<CourseData>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Associated Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !course) {
    return null;
  }
  return (
    <Card key={course.id} className="group transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">{course.title}</CardTitle>
        <p>{formatRelativeDate(course.updatedAt)}  | <Badge>{course.code}</Badge></p>
      </CardHeader>
    </Card>
  );
}
