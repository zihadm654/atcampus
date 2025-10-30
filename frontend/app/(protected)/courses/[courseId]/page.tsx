import { BadgeCheckIcon, Clock, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import CourseMoreButton from "@/components/courses/CourseMoreButton";
import CourseSkills from "@/components/courses/CourseSkills";
import EnrollButton from "@/components/courses/EnrollButton";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import UserTooltip from "@/components/UserTooltip";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata, formatRelativeDate } from "@/lib/utils";
import { getCourseDataInclude, getUserDataSelect } from "@/types/types";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  // In a real implementation, fetch course data from API/database
  return constructMetadata({
    title: "Course Details - AtCampus",
    description: "View detailed information about this course.",
  });
}
const getCourse = cache(async (courseId: string, loggedInUserId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: getCourseDataInclude(loggedInUserId),
  });

  if (!course) notFound();

  return course;
});
const getUser = cache(async (loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: loggedInUserId,
    },
    select: {
      ...getUserDataSelect(loggedInUserId),
    },
  });

  if (!user) notFound();

  return user;
});
export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const currentUser = await getUser(user.id);
  const course = await getCourse(courseId, user.id);

  if (!course) {
    notFound();
  }

  // Parse objectives from string to array
  let objectives: string[] = [];
  if (typeof course.objectives === "string") {
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(course.objectives);
      if (Array.isArray(parsed)) {
        objectives = parsed.filter(
          (item): item is string => typeof item === "string"
        );
      } else {
        // If it's not an array, treat as comma-separated string
        objectives = course.objectives
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    } catch (e) {
      // If parsing fails, treat as comma-separated string
      objectives = course.objectives
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
        <Card className="flex flex-col gap-3">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserTooltip user={course.instructor}>
                <Link href={`/${course.instructor.username}`}>
                  <UserAvatar className="size-10" user={course.instructor} />
                </Link>
              </UserTooltip>
              <UserTooltip user={course?.instructor}>
                <Link
                  className="flex items-center gap-1 font-medium text-md hover:underline"
                  href={`/${course.instructor?.username}`}
                >
                  {course.instructor.name}
                  {user.emailVerified ?? (
                    <Badge
                      className="bg-blue-500 text-white dark:bg-blue-600"
                      variant="secondary"
                    >
                      <BadgeCheckIcon className="size-4" />
                      Verified
                    </Badge>
                  )}
                </Link>
              </UserTooltip>
              <Link
                className="block text-muted-foreground text-sm hover:underline"
                href={`/courses/${course.id}`}
                suppressHydrationWarning
              >
                {formatRelativeDate(course.createdAt)}
              </Link>
            </div>
            {course.instructor?.id === user.id && (
              <CourseMoreButton course={course} />
            )}
          </CardHeader>

          <CardContent className="mt-2 gap-4 text-md">
            <h1 className="font-bold text-2xl">{course.title}</h1>
            <h5 className="mb-2 text-muted-foreground">
              {course.faculty.name}
            </h5>

            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Icons.bookOpen className="size-5" />
              Code: <span>{course.code}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Clock className="size-5" />
              Duration: <span>{course.estimatedHours}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Icons.edu className="mt-0.5 h-5 w-5 text-primary" />
              Enrollments:{" "}
              <span className="text-muted-foreground">
                {course.enrollments.length} students
              </span>
            </div>
            <Badge className="w-fit" variant="secondary">
              Credits: {course.credits}
            </Badge>
          </CardContent>
          <CardFooter className="flex justify-between gap-5">
            <EnrollButton courseId={course.id} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserTooltip user={currentUser}>
                <Link href={`/${currentUser.username}`}>
                  <UserAvatar user={currentUser} />
                </Link>
              </UserTooltip>
              <UserTooltip user={currentUser}>
                <Link
                  className="flex items-center gap-1 font-medium text-md hover:underline"
                  href={`/${user.username}`}
                >
                  {user.name}
                  {user.emailVerified ?? (
                    <Badge
                      className="bg-blue-500 text-white dark:bg-blue-600"
                      variant="secondary"
                    >
                      <BadgeCheckIcon className="size-4" />
                      Verified
                    </Badge>
                  )}
                </Link>
              </UserTooltip>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl bg-card shadow-sm">
        <Tabs defaultValue="outline">
          <div className="border-b">
            <TabsList className="flex w-full justify-between p-0">
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="outline"
              >
                <Icons.home className="size-5" />
                <span className="hidden lg:block">Course Outline</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="assets"
              >
                <Icons.bookOpen className="size-5" />
                <span className="hidden lg:block">Learning Materials</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="skill"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Skill Overview</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="space-y-3 p-3" value="outline">
            <div className="rounded-xl border bg-card p-3 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                  <Icons.post className="size-6" />
                </span>
                Description
              </h2>
              <JsonToHtml json={JSON.parse(course.description)} />
            </div>
          </TabsContent>
          <TabsContent className="space-y-2 p-3" value="assets">
            <div className="rounded-xl border bg-card p-3 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Topics Covered
              </h2>
              <p>{course.objectives}</p>
            </div>
          </TabsContent>
          <TabsContent className="space-y-3 p-3" value="skill">
            <CourseSkills courseId={course.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
