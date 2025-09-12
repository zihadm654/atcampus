import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface CoursesTabProps {
  courses: any[];
  userRole: string;
  loggedInUserId: string;
  permissions: any;
}

export default function CoursesTab({ courses, userRole, loggedInUserId }: CoursesTabProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
        <CardHeader className="flex items-center justify-between pb-4">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.bookOpen className="mr-3 size-5" />
            <span>Enrolled Courses</span>
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
            >
              <span>View All</span>
              <Icons.chevronRight className="size-5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {courses.length > 0 ? (
            courses.map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {enrollment.course.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {enrollment.course.code} • {enrollment.course.faculty.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {enrollment.course.credits ? `${enrollment.course.credits} credits` : 'Credits not specified'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${enrollment.status === 'ENROLLED' ? 'bg-green-100 text-green-700' :
                        enrollment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {enrollment.status.toLowerCase()}
                      </span>
                      {enrollment.grade && (
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          Grade: {enrollment.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center py-8">
              <Icons.bookOpen className="size-12 text-gray-400" />
              <p className="text-gray-500 mt-2">No courses enrolled yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
              >
                <Icons.add className="size-4 mr-2" />
                Browse Courses
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}