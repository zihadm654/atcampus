"use client";

import Link from "next/link";
import { BookOpen, Clock, CreditCard, Users } from "lucide-react";

import { Course as CourseType, Enrollment } from "@prisma/client";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";

import CourseMoreButton from "./CourseMoreButton";
import UserTooltip from "../UserTooltip";
import { UserAvatar } from "../shared/user-avatar";
import { toast } from "sonner";
import { enrollCourse } from "@/actions/enrollment";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface CourseProps {
  course: CourseType & {
    instructor: { username: string; image?: string };
    faculty?: { name: string };
    enrollments: Enrollment[];
  };
}

export default function Course({ course }: any) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return null;
  }

  const handleEnroll = () => {
    startTransition(async () => {
      const res = await enrollCourse(course.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };
  return (
    <article className="group/post bg-card relative space-y-3 rounded-2xl p-5 shadow-sm">
      {/* Department badge */}
      <div className="absolute top-0 right-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Profile match
      </div>
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={course.instructor}>
            <Link href={`/${course.instructor.username}`}>
              <UserAvatar user={course.instructor} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={course.instructor}>
              <Link
                href={`/${course.instructor.username}`}
                className="block font-medium hover:underline"
              >
                {course.instructor.username}
              </Link>
            </UserTooltip>
            <Link
              href={`/courses/${course.id}`}
              className="text-muted-foreground block text-sm hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(course.createdAt)}
            </Link>
          </div>
        </div>
        {course.instructorId === user.id && (
          <CourseMoreButton course={course} />
        )}
      </div>
      <Link href={`/courses/${course.id}`}>
        <div className="mb-3">
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            {course.code}
          </span>
          <h4>{course.department}</h4>
        </div>
        <div className="mt-auto grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <CreditCard className="size-5 text-gray-500" />
            <span>{course.credits} credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-5 text-gray-500" />
            <span>{course.duration} weeks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-5 text-gray-500" />
            <span>{course.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-1 py-1">
          <BookOpen className="size-5" />
          <span className="text-sm">
            Prerequisites: {course.prerequisites.join(", ") || "None"}
          </span>
        </div>
      </Link>
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        {/* {user.role === "STUDENT" && ( */}
        <Button
          onClick={handleEnroll}
          variant="default"
          disabled={
            course.enrollments.some((enroll) => enroll.studentId === user.id) ||
            isPending
          }
        >
          {course.enrollments.some((enroll) => enroll.studentId === user.id)
            ? "Already Enrolled"
            : "Enroll Now"}
        </Button>
        {/* )} */}
      </div>
    </article>
  );
}
