import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import CourseFeed from "@/components/feed/CourseFeed";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = constructMetadata({
  title: "Courses - AtCampus",
  description: "Browse and enroll in courses to enhance your skills.",
});

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="">
          <h1 className="text-3xl max-md:text-xl font-bold">Courses</h1>
          <p className="text-muted-foreground max-md:text-sm">
            Browse and enroll in courses to enhance your skills
          </p>
        </div>
        {/* {user.role === "PROFESSOR" && ( */}
        <Button className="rounded-xl" size="sm" variant="outline">
          <Link href="/courses/createCourse">Create Course</Link>
        </Button>
        {/* )} */}
      </div>
      <CourseFeed user={user} />
    </div>
  );
}
