"use client";

import React from "react";
import { CourseData } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface StudentCoursesProps {
  courses: CourseData[];
}

export default function StudentCourses({ courses }: StudentCoursesProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrolled Courses</CardTitle>
        <Button onClick={() => router.push("/courses")} variant="link">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.code}</p>
                    {course.faculty && (
                      <p className="text-xs text-gray-400 mt-1">{course.faculty.name}</p>
                    )}
                  </div>
                  {course.instructor && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.instructor.name}</p>
                      <p className="text-xs text-gray-500">Instructor</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Icons.users className="mr-1 h-4 w-4" />
                    <span>{course.enrollments?.length || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Icons.calendar className="mr-1 h-4 w-4" />
                    {course.startDate && (
                      <span>Starts {formatDate(new Date(course.startDate), "MMM d, yyyy")}</span>
                    )}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {course.credits} credits
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icons.bookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrolled courses</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't enrolled in any courses yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

  );
}