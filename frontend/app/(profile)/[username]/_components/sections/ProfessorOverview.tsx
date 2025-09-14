import React from "react";
import { Fragment } from "react";
import { BookOpen, Users, FlaskConical } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ProfileUserData,
  ProfilePermissions,
  Course,
  Research,
} from "@/types/profile-types";
import { UserData } from "@/types/types";

interface ProfessorOverviewProps {
  user: UserData;
  courses: Course[];
  research: any[];
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}

export default function ProfessorOverview({
  user,
  courses,
  research,
  permissions,
  isOwnProfile,
}: ProfessorOverviewProps) {
  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-4">
        {/* Professor Info */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center text-lg font-medium">
              <BookOpen className="size-5 mr-2" />
              Professor Overview
            </CardTitle>
            {permissions.canEdit && (
              <Badge variant="secondary">Professor</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                {user.members && user.members.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {user.members[0].academicTitle} •{" "}
                    {user.members[0].department}
                  </p>
                )}
              </div>

              {courses && courses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <BookOpen className="size-4 mr-2" />
                    Courses Teaching
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {courses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">
                            {course.code} • {course.faculty.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {course._count.enrollments} students
                        </Badge>
                      </div>
                    ))}
                    {courses.length > 3 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        + {courses.length - 3} more courses
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Research Overview */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center text-lg font-medium">
              <FlaskConical className="size-5 mr-2" />
              Research Work
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <FlaskConical className="size-12 mx-auto mb-3" />
              <p>Research projects and publications will be displayed here</p>
              {permissions.canEdit && isOwnProfile && (
                <p className="text-sm mt-2">
                  Add research to showcase your work
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
