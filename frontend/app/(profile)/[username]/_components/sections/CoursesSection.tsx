import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface CourseEnrollment {
  id: string;
  status: string;
  grade?: string;
  course: {
    id: string;
    title: string;
    code: string;
    credits: number | null;
    faculty: {
      name: string;
    };
    instructor: {
      name: string;
    };
  };
}

interface CoursesSectionProps {
  enrollments: CourseEnrollment[];
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
  const displayCourses = limit ? enrollments.slice(0, limit) : enrollments;
  const hasMoreCourses = limit && enrollments.length > limit;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow ${className}`}>
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.bookOpen className="size-7 pr-2" />
            {userRole === 'PROFESSOR' ? 'Teaching' : 'Courses'}
            {hasMoreCourses && (
              <span className="ml-2 text-sm text-gray-500">
                (+{enrollments.length - limit} more)
              </span>
            )}
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
              onClick={onViewAll}
            >
              <span>See More</span>
              <Icons.chevronRight className="size-5" />
            </Button>
          </CardAction>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        {displayCourses.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {displayCourses.map((enrollment) => (
                <div key={enrollment.id} className="border p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-sm">
                    {enrollment.course.title} ({enrollment.course.code})
                  </div>
                  <div className="text-xs text-gray-500">
                    {enrollment.course.faculty.name} • {enrollment.course.credits || 0} credits
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status.toLowerCase()}
                    </span>
                    {enrollment.grade && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                        Grade: {enrollment.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
            <div className="flex flex-col items-center">
              <Icons.bookOpen className="size-10" />
              <p className="text-sm mt-2">
                {userRole === 'PROFESSOR' ? 'No courses assigned' : 'No courses enrolled'}
              </p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-full"
                >
                  <Icons.add className="size-4 mr-1" />
                  {userRole === 'PROFESSOR' ? 'Create Course' : 'Browse Courses'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}