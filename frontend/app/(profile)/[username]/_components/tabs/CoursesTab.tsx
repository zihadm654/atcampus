"use client";

import React from "react";
import { UserData, CourseData } from "@/types/types";
import { UserRole } from "@/lib/validations/auth";
import type { ProfilePermissions } from "@/types/profile-types";
import StudentCourses from "./StudentCourses";
import ProfessorCourses from "./ProfessorCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { EnrollmentStatus } from "@prisma/client";

interface CoursesTabProps {
  user: UserData;
  courses: CourseData[];
  isCurrentUser: boolean;
  permissions?: ProfilePermissions;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

// Helper function to get enrollment status color
const getEnrollmentStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case EnrollmentStatus.ENROLLED:
      return 'bg-green-100 text-green-800';
    case EnrollmentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case EnrollmentStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800';
    case EnrollmentStatus.DROPPED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Component to display detailed enrollment information
const EnrollmentDetails = ({ course }: { course: CourseData }) => {
  if (!course.enrollments || course.enrollments.length === 0) {
    return (
      <div className="text-sm text-gray-500 mt-2">
        No enrollments yet
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <Icons.users className="mr-1 h-4 w-4" />
        <span>{course.enrollments.length} enrolled students</span>
      </div>

      {/* Show first 3 enrollments with details */}
      <div className="space-y-2">
        {course.enrollments.slice(0, 3).map((enrollment) => (
          <div key={enrollment.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
            <div>
              <div className="font-medium">
                {enrollment.studentId || 'Unknown Student'}
              </div>
              {/* {enrollment.student?.username && (
                <div className="text-gray-500">@{enrollment.student.username}</div>
              )} */}
            </div>
            <div className="flex flex-col items-end">
              <Badge className={getEnrollmentStatusColor(enrollment.status)}>
                {enrollment.status}
              </Badge>
              {enrollment.enrolledAt && (
                <span className="text-gray-500 mt-1">
                  {formatDate(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
        ))}

        {course.enrollments.length > 3 && (
          <div className="text-xs text-gray-500 text-center py-1">
            + {course.enrollments.length - 3} more enrollments
          </div>
        )}
      </div>
    </div>
  );
};

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
            <CardContent className="max-md:p-2">
              {courses && courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
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
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(course.status)}`}>
                          {course.status?.replace('_', ' ') || 'UNKNOWN'}
                        </span>
                      </div>

                      {/* Detailed enrollment information */}
                      <EnrollmentDetails course={course} />
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
                    <div key={course.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
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
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>

                      {/* Detailed enrollment information */}
                      <EnrollmentDetails course={course} />
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
            <CardContent className="p-4 max-md:p-2 text-center text-gray-500">
              Course information is not applicable for this user role.
            </CardContent>
          </Card>
        );
    }
  };

  return <div>{renderContent()}</div>;
}