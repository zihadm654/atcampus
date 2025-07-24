import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Courses - AtCampus",
  description: "Browse and enroll in courses to enhance your skills.",
});

export default async function CoursesPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">
          Browse and enroll in courses to enhance your skills
        </p>
      </div>

      {/* Course listings will be implemented here */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card flex flex-col rounded-lg border p-4 shadow-sm">
          <div className="mb-4 h-40 rounded-md bg-gray-200"></div>
          <h3 className="mb-2 text-xl font-semibold">
            Introduction to Programming
          </h3>
          <p className="text-muted-foreground mb-4">
            Learn the basics of programming with this comprehensive course.
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm font-medium">12 modules</span>
            <span className="text-primary font-semibold">Free</span>
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-lg border p-4 shadow-sm">
          <div className="mb-4 h-40 rounded-md bg-gray-200"></div>
          <h3 className="mb-2 text-xl font-semibold">
            Data Science Fundamentals
          </h3>
          <p className="text-muted-foreground mb-4">
            Master the core concepts of data science and analytics.
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm font-medium">8 modules</span>
            <span className="text-primary font-semibold">Premium</span>
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-lg border p-4 shadow-sm">
          <div className="mb-4 h-40 rounded-md bg-gray-200"></div>
          <h3 className="mb-2 text-xl font-semibold">
            Web Development Bootcamp
          </h3>
          <p className="text-muted-foreground mb-4">
            Build modern websites with HTML, CSS, and JavaScript.
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm font-medium">15 modules</span>
            <span className="text-primary font-semibold">Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
