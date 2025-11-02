import Course from "@/components/courses/Course";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CourseData } from "@/types/types";

interface CourseEnrollment {
  id: string;
  status: string;
  grade?: string;
  course: CourseData;
}

interface CoursesSectionProps {
  // enrollments can be either CourseEnrollment[] or DirectCourseData[]
  enrollments: CourseEnrollment[] | CourseData[];
  userRole: string;
  canEdit: boolean;
  limit?: number;
  showHeader?: boolean;
  className?: string;
  onViewAll?: () => void;
}

export default function CoursesSection({
  enrollments,
  userRole,
  canEdit,
  limit = 3,
  showHeader = true,
  className = "",
  onViewAll,
}: CoursesSectionProps) {
  // Check if we have CourseEnrollment objects or direct CourseData objects
  const isEnrollmentFormat =
    enrollments.length > 0 && "course" in (enrollments[0] as any);

  // Extract courses from either format
  const coursesToDisplay = isEnrollmentFormat
    ? (enrollments as CourseEnrollment[]).map((enrollment) => enrollment.course)
    : (enrollments as CourseData[]);

  const displayCourses = limit
    ? coursesToDisplay.slice(0, limit)
    : coursesToDisplay;
  const hasMoreCourses = limit && coursesToDisplay.length > limit;

  // Check if enrollments is null or undefined
  if (!enrollments) return null;

  return (
    <Card
      className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow ${className}`}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center font-medium text-lg">
            <Icons.bookOpen className="size-7 pr-2" />
            {userRole === "PROFESSOR" ? "Teaching" : "Courses"}
            {hasMoreCourses && (
              <span className="ml-2 text-gray-500 text-sm">
                (+{coursesToDisplay.length - limit} more)
              </span>
            )}
          </CardTitle>
          <CardAction>
            <Button
              className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
              onClick={onViewAll}
              size="sm"
              variant="ghost"
            >
              <span>See More</span>
              <Icons.chevronRight className="size-5" />
            </Button>
          </CardAction>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        {displayCourses.length > 0 ? (
          <div className="grid max-h-48 grid-cols-1 gap-4 overflow-y-auto">
            {displayCourses.map((course) => (
              <Course course={course} key={course?.id} />
            ))}
          </div>
        ) : (
          <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
            <div className="flex flex-col items-center">
              <Icons.bookOpen className="size-10" />
              <p className="mt-2 text-sm">
                {userRole === "PROFESSOR"
                  ? "No courses assigned"
                  : "No courses enrolled"}
              </p>
              {canEdit && (
                <Button
                  className="mt-3 rounded-full"
                  size="sm"
                  variant="outline"
                >
                  <Icons.add className="mr-1 size-4" />
                  {userRole === "PROFESSOR"
                    ? "Create Course"
                    : "Browse Courses"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
