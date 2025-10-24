import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import CourseFeed from "@/components/feed/CourseFeed";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Courses - AtCampus",
  description: "Browse and enroll in courses to enhance your skills.",
});

const getInitialCourses = cache(async () => {
  const courses = await prisma.course.findMany({
    where: {
      isDeleted: false,
      status: "PUBLISHED",
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
      role: "member",
    },
  });

  // Check if user has approval permissions
  const hasApprovalPermissions =
    (await prisma.member.findFirst({
      where: {
        userId: user.id,
        role: {
          in: ["admin", "owner"],
        },
      },
    })) || user.role === "INSTITUTION";

  const canCreateCourses = professorMember !== null;

  const initialCoursesData = await getInitialCourses();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="">
          <h1 className="font-bold text-3xl max-md:text-xl">Courses</h1>
          <p className="hidden text-muted-foreground max-md:text-sm lg:block">
            Browse and enroll in courses to enhance your skills
          </p>
        </div>
        <div className="flex gap-2">
          {canCreateCourses && (
            <>
              <Button
                className="rounded-xl max-sm:text-sm"
                size="sm"
                variant="outline"
              >
                <Link
                  className="flex items-center justify-center gap-2"
                  href="/courses/my-courses"
                >
                  <span className="hidden lg:block">My Courses</span>
                  <Icons.home className="hidden size-5 max-md:block" />
                </Link>
              </Button>
              <Button
                className="rounded-xl max-sm:text-sm"
                size="sm"
                variant="outline"
              >
                <Link href="/courses/createCourse">
                  <span className="hidden lg:block">Add Course</span>
                  <Icons.add className="hidden size-5 max-md:block" />
                </Link>
              </Button>
            </>
          )}
          {hasApprovalPermissions && (
            <Button
              className="rounded-xl max-sm:text-sm"
              size="sm"
              variant="secondary"
            >
              <Link href="/courses/approvals">
                <span className="hidden lg:block">Approvals</span>
                <Icons.home className="hidden size-5 max-md:block" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <CourseFeed initialData={initialCoursesData} user={user} />
    </div>
  );
}
