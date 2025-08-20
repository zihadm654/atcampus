import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Book,
  Briefcase,
  Clock,
  GraduationCap,
  ShieldCheck,
  User,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getCourseDataInclude, getUserDataSelect } from "@/types/types";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserTooltip from "@/components/UserTooltip";
import CourseMoreButton from "@/components/courses/CourseMoreButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";
import EnrollButton from "@/components/courses/EnrollButton";
import { UserAvatar } from "@/components/shared/user-avatar";

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
    title: `Course Details - AtCampus`,
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
  // const course = {
  //   id: courseId,
  //   title: "Introduction to Data Science",
  //   department: "Department of Computer Science",
  //   description:
  //     "This course provides a comprehensive introduction to data science concepts, tools, and methodologies. Students will learn the fundamentals of data collection, cleaning, analysis, and visualization. The course covers statistical methods, machine learning algorithms, and programming tools commonly used in the field.",
  //   topics: [
  //     "Data collection and preprocessing",
  //     "Exploratory data analysis",
  //     "Statistical inference",
  //     "Machine learning fundamentals",
  //     "Data visualization techniques",
  //     "Ethical considerations in data science",
  //   ],
  //   prerequisites: [
  //     "Basic programming knowledge (Python preferred)",
  //     "Introductory statistics",
  //     "College algebra",
  //   ],
  //   learningOutcomes: [
  //     "Apply data science methodologies to real-world problems",
  //     "Implement basic machine learning algorithms",
  //     "Create effective data visualizations",
  //     "Perform statistical analysis on datasets",
  //     "Communicate findings to technical and non-technical audiences",
  //   ],
  //   location: "Science Building, Room 305",
  //   schedule: "Tuesdays and Thursdays, 2:00 PM - 3:30 PM",
  //   credits: "3 credits",
  //   instructor: "Dr. Sarah Johnson",
  //   startDate: "September 5, 2023",
  //   endDate: "December 15, 2023",
  //   enrollmentDeadline: "August 25, 2023",
  //   maxEnrollment: 30,
  //   currentEnrollment: 18,
  // };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
        <Card className="flex flex-col gap-3">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserTooltip user={course?.instructor}>
                <Link href={`/${course.instructor.username}`}>
                  <UserAvatar user={course.instructor} className="size-10" />
                </Link>
              </UserTooltip>
              <UserTooltip user={course?.instructor}>
                <Link
                  className="flex items-center gap-1 font-medium text-md hover:underline"
                  href={`/${course.instructor.username}`}
                >
                  {course.instructor.name}
                  <ShieldCheck className="size-5 text-blue-700" />
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
            {course.instructor.id === user.id && (
              <CourseMoreButton course={course} />
            )}
          </CardHeader>

          <CardContent className="mt-2 gap-4 text-md">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <h5 className="text-muted-foreground mb-4">{course.department}</h5>
            <Badge variant="secondary" className="w-fit">
              Credits: {course.credits}
            </Badge>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Icons.bookOpen className="size-5" />
              Course Code: <span>{course.code}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Clock className="size-5" />
              Duration: <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Icons.edu className="text-primary mt-0.5 h-5 w-5" />
              Enrollment:{" "}
              <span className="text-muted-foreground">
                {course.enrollments.length} students
              </span>
              {/* <p className="text-muted-foreground">
                  Deadline: {course.enrollmentDeadline}
                </p> */}
            </div>

            {/* 
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Calendar className="size-5" />
              Deadline: <span>{formatDate(job.endDate, "MM/dd/yyyy")}</span>
            </div> */}
          </CardContent>
          <CardFooter className="flex justify-between gap-5">
            <EnrollButton courseId={course.id} />
            {/* <Client user={user} job={job} /> */}
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
                  <ShieldCheck className="size-5 text-blue-700" />
                </Link>
              </UserTooltip>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="overflow-hidden mt-3 rounded-2xl bg-card shadow-sm">
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
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Learning Materials</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="skill"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Skill Overview</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="projects"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Project & Research</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="members"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">People</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="p-3 space-y-3" value="outline">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                  <Icons.post className="size-8" />
                </span>
                Description
              </h2>
              <JsonToHtml json={JSON.parse(course.description)} />
            </div>
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Prerequisites
              </h2>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {course.prerequisites.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent className="p-3 space-y-2" value="assets">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Topics Covered
              </h2>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {/* {course.topics.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))} */}
              </ul>
            </div>
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Learning Outcomes
              </h2>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {/* {course.learningOutcomes.map((item, index) => (
                   <li key={index} className="text-muted-foreground">
                     {item}
                   </li>
                 ))} */}
              </ul>
            </div>
          </TabsContent>
          <TabsContent className="p-3" value="skill">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              {/* 
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              Qualifications
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            */}
            </div>
          </TabsContent>
          <TabsContent className="p-3" value="projects">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              {/* 
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              Qualifications
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            */}
            </div>
          </TabsContent>
          <TabsContent className="p-3" value="members">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Members
              </h2>
              {/* <ul className="mb-6 list-inside list-disc space-y-1">
                {course.topics.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
