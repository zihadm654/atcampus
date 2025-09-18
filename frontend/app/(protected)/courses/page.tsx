import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import CourseFeed from "@/components/feed/CourseFeed";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { cache } from "react";

export const metadata: Metadata = constructMetadata({
  title: "Courses - AtCampus",
  description: "Browse and enroll in courses to enhance your skills.",
});

const getInitialCourses = cache(async () => {
  const courses = await prisma.course.findMany({
    where: {
      isDeleted: false,
      isActive: true,
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      faculty: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  return {
    courses,
    nextCursor: courses.length === 12 ? courses[11].id : null,
  };
});

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  // Check if user is a professor
  const professorMember = await prisma.member.findFirst({
    where: {
      userId: user.id,
      role: "PROFESSOR",
      isActive: true,
    },
  });

  // Check if user has approval permissions
  const hasApprovalPermissions =
    (await prisma.member.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        role: {
          in: ["FACULTY_ADMIN", "SCHOOL_ADMIN", "owner", "admin"],
        },
      },
    })) || user.role === "INSTITUTION";

  const canCreateCourses = professorMember !== null;

  const initialCoursesData = await getInitialCourses();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="">
          <h1 className="text-3xl max-md:text-xl font-bold">Courses</h1>
          <p className="text-muted-foreground max-md:text-sm">
            Browse and enroll in courses to enhance your skills
          </p>
        </div>
        <div className="flex gap-2">
          {canCreateCourses && (
            <>
              <Button className="rounded-xl" size="sm" variant="outline">
                <Link href="/courses/my-courses">My Courses</Link>
              </Button>
              <Button className="rounded-xl" size="sm" variant="outline">
                <Link href="/courses/createCourse">Create Course</Link>
              </Button>
            </>
          )}
          {hasApprovalPermissions && (
            <Button className="rounded-xl" size="sm" variant="secondary">
              <Link href="/courses/approvals">Course Approvals</Link>
            </Button>
          )}
        </div>
      </div>
      <CourseFeed user={user} initialData={initialCoursesData} />
    </div>
  );
}
