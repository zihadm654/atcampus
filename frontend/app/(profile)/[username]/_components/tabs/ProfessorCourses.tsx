"use client";

import { useRouter } from "next/navigation";
import Course from "@/components/courses/Course";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfilePermissions } from "@/types/profile-types";
import type { CourseData } from "@/types/types";

interface ProfessorCoursesProps {
  courses: CourseData[];
  isCurrentUser: boolean;
  permissions?: ProfilePermissions;
}

export default function ProfessorCourses({
  courses,
  isCurrentUser,
  permissions,
}: ProfessorCoursesProps) {
  const router = useRouter();
  const canCreateCourses = permissions?.canCreateCourses || isCurrentUser;

  return (
    <Card className="border-none p-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Courses</CardTitle>
        {canCreateCourses && (
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/courses/createCourse")}
            variant="default"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        )}
      </CardHeader>
      <CardContent className="max-md:p-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses && courses.length > 0 ? (
            courses.map((course) => <Course course={course} key={course.id} />)
          ) : (
            <div className="col-span-full py-8 text-center">
              <Icons.bookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 font-medium text-gray-900 text-sm">
                No courses created
              </h3>
              <p className="mt-1 text-gray-500 text-sm">
                You haven't created any courses yet.
              </p>
              {isCurrentUser && (
                <div className="mt-6">
                  <Button
                    onClick={() => router.push("/courses/createCourse")}
                    variant="default"
                  >
                    <Icons.add className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
