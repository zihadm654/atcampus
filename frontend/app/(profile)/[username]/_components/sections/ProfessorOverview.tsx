import { IconFolderCode } from "@tabler/icons-react";
import { BookOpen, FlaskConical } from "lucide-react";
import Research from "@/components/researches/Research";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  ProfilePermissions,
  // Course,
} from "@/types/profile-types";
import type { UserData } from "@/types/types";

interface ProfessorOverviewProps {
  user: UserData;
  courses: any;
  researches: any;
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}

export default function ProfessorOverview({
  user,
  courses,
  researches,
  permissions,
  isOwnProfile,
}: ProfessorOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Professor Info */}
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <BookOpen className="mr-2 size-5" />
            Professor Overview
          </CardTitle>
          {permissions.canEdit && <Badge variant="secondary">Professor</Badge>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses && courses.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center font-medium">
                  <BookOpen className="mr-2 size-4" />
                  Courses Teaching
                </h4>
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                  {courses.slice(0, 3).map((course) => (
                    // <Course course={course} key={course.id} />
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={course.id}
                    >
                      <div className="flex flex-col justify-center space-y-2">
                        <h3 className="font-medium text-xl">{course.title}</h3>
                        <h5>{course.faculty.name}</h5>
                        <Badge className="text-sm" variant="outline">
                          {course.code}
                        </Badge>
                        <p className="text-sm">
                          Enrollments: {course._count.enrollments} students
                        </p>
                      </div>
                    </div>
                  ))}
                  {courses.length > 3 && (
                    <p className="pt-2 text-center text-gray-500 text-sm">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center font-medium text-lg">
            <FlaskConical className="mr-2 size-5" />
            Research Work
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {researches.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {researches.map((research) => (
                <Research key={research.id} research={research} />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconFolderCode />
                </EmptyMedia>
                <EmptyTitle>No Research Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any research yet. Get started by
                  creating your first research.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button>Create Research</Button>
                </div>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
