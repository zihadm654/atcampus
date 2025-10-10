"use client";

import React from "react";
import { UserData, CourseData } from "@/types/types";
import { UserRole } from "@/lib/validations/auth";
import type { ProfilePermissions } from "@/types/profile-types";
import StudentCourses from "./StudentCourses";
import ProfessorCourses from "./ProfessorCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoursesTabProps {
  user: UserData;
  courses: CourseData[];
  isCurrentUser: boolean;
  permissions?: ProfilePermissions;
}

export default function CoursesTab({ user, courses, isCurrentUser, permissions }: CoursesTabProps) {
  const renderContent = () => {
    switch (user.role) {
      case UserRole.STUDENT:
        // For students, show enrolled courses
        return <StudentCourses courses={courses} />;

      case UserRole.PROFESSOR:
        // For professors, show created courses
        return <ProfessorCourses courses={courses} isCurrentUser={isCurrentUser} permissions={permissions} />;

      case UserRole.INSTITUTION:
        // For institutions, show created courses with more detailed information
        return (
          <Card>
            <CardHeader>
              <CardTitle>Institution Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border p-4 rounded-lg">
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.code}</p>
                      {course.faculty && (
                        <p className="text-xs text-gray-400 mt-1">{course.faculty.name}</p>
                      )}
                      {course.instructor && (
                        <p className="text-xs text-gray-400 mt-1">
                          Instructor: {course.instructor.name}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {course.enrollments?.length || 0} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No courses created by this institution.</p>
              )}
            </CardContent>
          </Card>
        );

      case UserRole.ADMIN:
        // For admins, show all courses with administrative information
        return (
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border p-4 rounded-lg">
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.code}</p>
                      {course.faculty && (
                        <p className="text-xs text-gray-400 mt-1">{course.faculty.name}</p>
                      )}
                      {course.instructor && (
                        <p className="text-xs text-gray-400 mt-1">
                          Instructor: {course.instructor.name}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {course.enrollments?.length || 0} students
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No courses in the system.</p>
              )}
            </CardContent>
          </Card>
        );

      default:
        // For other roles, show a generic message
        return (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              Course information is not applicable for this user role.
            </CardContent>
          </Card>
        );
    }
  };

  return <div>{renderContent()}</div>;
}