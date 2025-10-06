"use client";

import React from "react";
import { CourseData } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface ProfessorCoursesProps {
  courses: CourseData[];
  isCurrentUser: boolean;
}

export default function ProfessorCourses({
  courses,
  isCurrentUser,
}: ProfessorCoursesProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Courses</CardTitle>
        {isCurrentUser && (
          <Button
            onClick={() => router.push("/courses/createCourse")}
            className="cursor-pointer"
            variant="default"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="border p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.code}</p>
                    {course.faculty && (
                      <p className="text-xs text-gray-400 mt-1">{course.faculty.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : course.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                      {course.status?.replace('_', ' ') || 'UNKNOWN'}
                    </span>
                  </div>
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
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icons.bookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses created</h3>
              <p className="mt-1 text-sm text-gray-500">
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