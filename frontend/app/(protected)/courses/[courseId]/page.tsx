import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Book,
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  User,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getCourseDataInclude, getUserDataSelect } from "@/types/types";
import { JsonToHtml } from "@/components/editor/JsonToHtml";

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

  // If job not found, return 404
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
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="border-b p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <h5 className="text-muted-foreground">{course.department}</h5>
                  <p className="text-muted-foreground">
                    Course code: {course.code}
                  </p>
                  <p className="text-muted-foreground">Level: {course.level}</p>
                </div>
                <Badge variant="secondary" className="w-fit">
                  Credits: {course.credits}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-3 text-lg font-medium">Course Description</h3>
              <JsonToHtml json={JSON.parse(course.description)} />

              {/* <h3 className="mt-6 mb-3 text-lg font-medium">Topics Covered</h3> */}
              {/* <ul className="mb-6 list-inside list-disc space-y-1">
                {course.topics.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul> */}

              <h3 className="mb-3 mt-4 text-lg font-medium">Prerequisites</h3>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {course.prerequisites.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>

              {/* <h3 className="mb-3 text-lg font-medium">Learning Outcomes</h3>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {course.learningOutcomes.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul> */}

              <Button className="w-full">Enroll Now</Button>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Course Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Instructor</p>
                  <p className="text-muted-foreground">
                    {course.instructor.name}
                  </p>
                </div>
              </div>

              {/* <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-muted-foreground">{course.location}</p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-muted-foreground">{course.duration}</p>
                </div>
              </div>

              {/* <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Dates</p>
                  <p className="text-muted-foreground">
                    {course.startDate} - {course.endDate}
                  </p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <GraduationCap className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Enrollment</p>
                  <p className="text-muted-foreground">
                    {course.enrollments.length} students
                  </p>
                  <p className="text-muted-foreground">
                    {/* Deadline: {course.enrollmentDeadline} */}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Book className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-muted-foreground">{course.credits}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
