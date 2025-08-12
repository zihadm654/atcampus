import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import Course from "@/components/courses/Course";

import { prisma } from "@/lib/db";
import CourseFeed from "@/components/feed/CourseFeed";

export const metadata: Metadata = constructMetadata({
  title: "Courses - AtCampus",
  description: "Browse and enroll in courses to enhance your skills.",
});

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      faculty: true,
      enrollments: {
        where: {
          studentId: user.id,
        },
      },
    },
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <CourseFeed user={user} />
    </div>
  );
}
