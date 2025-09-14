"use client";

import React from "react";
import { CourseData } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface StudentCoursesProps {
  courses: CourseData[];
}

export default function StudentCourses({ courses }: StudentCoursesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrolled Courses</CardTitle>
        <Button variant="link">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="border p-4 rounded-lg">
                <h4 className="font-semibold">{course.title}</h4>
                <p className="text-sm text-gray-500">{course.code}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No courses to display.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}