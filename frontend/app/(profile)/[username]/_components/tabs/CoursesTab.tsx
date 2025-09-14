"use client";

import React from "react";
import { UserData, CourseData } from "@/types/types";
import { UserRole } from "@/lib/validations/auth";
import StudentCourses from "./StudentCourses";
import ProfessorCourses from "./ProfessorCourses";

interface CoursesTabProps {
  user: UserData;
  courses: CourseData[];
  isCurrentUser: boolean;
}

export default function CoursesTab({ user, courses, isCurrentUser }: CoursesTabProps) {
  const renderContent = () => {
    switch (user.role) {
      case UserRole.STUDENT:
        return <StudentCourses courses={courses} />;
      case UserRole.PROFESSOR:
        return <ProfessorCourses courses={courses} isCurrentUser={isCurrentUser} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Course information is not applicable for this user role.
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
}
