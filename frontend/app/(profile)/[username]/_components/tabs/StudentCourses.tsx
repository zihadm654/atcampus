"use client";

import { useRouter } from "next/navigation";
import Course from "@/components/courses/Course";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseData } from "@/types/types";

interface StudentCoursesProps {
  courses: CourseData[];
}

export default function StudentCourses({ courses }: StudentCoursesProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrolled Courses</CardTitle>
        <Button onClick={() => router.push("/courses")} variant="link">
          View All
        </Button>
      </CardHeader>
      <CardContent className="max-md:p-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses && courses.length > 0 ? (
            courses.map((course) => <Course course={course} key={course.id} />)
          ) : (
            <div className="col-span-full py-8 text-center">
              <Icons.bookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 font-medium text-gray-900 text-sm">
                No enrolled courses
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                You haven't enrolled in any courses yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
