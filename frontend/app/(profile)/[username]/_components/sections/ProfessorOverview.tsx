import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfilePermissions } from "@/types/profile-types";
import type { CourseData, UserData } from "@/types/types";
import Course from "@/components/courses/Course";
import { Icons } from "@/components/shared/icons";
import BlurImage from "@/components/shared/blur-image";

interface ProfessorOverviewProps {
  user: UserData;
  courses: any;
  researches: any;
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}

export default function ProfessorOverview({
  courses,
  researches,
  permissions,
  user,
}: ProfessorOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-3 w-full">
        <Card className="rounded-xl shadow-sm flex-1">
          <CardHeader className="py-0">
            <CardTitle className="flex items-center text-xl font-semibold">
              Features
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            {researches.slice(0, 3).map((research: any) => (
              <div key={research.id}>
                <BlurImage
                  src={research.user.image || "/_static/avatars/shadcn.jpeg"}
                  alt={research.title}
                  width={150}
                  height={150}
                />
                <h2 className="text-md font-semibold">{research.title}</h2>
              </div>
            ))}
            <div></div>
          </CardContent>
        </Card>
        <Card className=" rounded-xl shadow-sm flex-1">
          <CardHeader className="py-0">
            <CardTitle className="flex items-center text-xl font-semibold">
              Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h1 className="text-md font-semibold">Professor at:</h1>
            <p className="flex items-center gap-2">
              <Icons.email className="size-6" />
              {user.email}
            </p>
            <p className="flex items-center gap-2">
              <Icons.link className="size-6" />
              {user.website}
            </p>
            <p className="flex items-center gap-2">
              <Icons.location className="size-6" />
              {user.location}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-none p-0 rounded-xl shadow-sm">
        <CardHeader className="py-0">
          <CardTitle className="flex items-center text-xl font-semibold">
            Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
              {courses.slice(0, 3)?.map((course: CourseData) => (
                <Course course={course} key={course.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
