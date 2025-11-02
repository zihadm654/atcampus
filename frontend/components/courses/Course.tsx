"use client";

import type { Enrollment } from "@prisma/client";
import { BookOpen, Building, Clock, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { enrollCourse } from "@/actions/enrollment";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import type { CourseData } from "@/types";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import { Button } from "../ui/button";
import CourseMoreButton from "./CourseMoreButton";

export default function Course({ course }: { course: CourseData }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isPending, startTransition] = useTransition();

  // Safely check enrollment status
  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    if (!course?.enrollments) return false;
    return course.enrollments.some(
      (enroll: Enrollment) => enroll.studentId === user?.id
    );
  });

  const [optimisticEnrolled, setOptimisticEnrolled] = useOptimistic<
    boolean,
    boolean
  >(isEnrolled, (_, newState: boolean) => newState);

  if (!user) {
    return null;
  }
  if (!course) return null;

  const handleEnroll = () => {
    startTransition(async () => {
      setOptimisticEnrolled(true);
      try {
        const res = await enrollCourse(course.id);
        if (res.success) {
          toast.success(res.message);
          // Update the local state to persist the enrollment
          setIsEnrolled(true);
        } else {
          setOptimisticEnrolled(false);
          toast.error(res.message);
        }
      } catch (_error) {
        setOptimisticEnrolled(false);
        toast.error("Failed to enroll in course");
      }
    });
  };
  return (
    <Card className="group transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserTooltip user={course?.instructor}>
              <Link href={`/${course?.instructor?.username}`}>
                <UserAvatar user={course?.instructor} />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={course?.instructor}>
                <Link
                  className="font-semibold hover:underline"
                  href={`/${course?.instructor?.username}`}
                >
                  {course?.instructor?.name || course?.instructor?.username}
                </Link>
              </UserTooltip>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Link
                  className="hover:underline"
                  href={`/courses/${course.id}`}
                  suppressHydrationWarning
                >
                  {formatRelativeDate(course.createdAt)}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {course.instructorId === user.id && (
              <CourseMoreButton course={course} />
            )}
          </div>
        </div>
      </CardHeader>

      <Link href={`/courses/${course.id}`}>
        <CardContent className="pt-0 pb-4">
          <h1 className="font-semibold text-xl">{course.title}</h1>
          {course.faculty && (
            <div className="flex flex-wrap items-center justify-start gap-2">
              <span className="flex items-center gap-1">
                <Building className="mr-1 size-3" />
                {course.faculty.name}
              </span>
              <Badge className="text-xs" variant="outline">
                {course.code}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-4" />
              <span>{course.credits} credits</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>{course.estimatedHours} weeks</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span className="capitalize">{course.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span>{course.enrollments?.length || 0} enrolled</span>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="pt-0">
        {user.role === "STUDENT" && (
          <Button
            className="w-full"
            disabled={optimisticEnrolled || isEnrolled || isPending}
            onClick={handleEnroll}
            variant={optimisticEnrolled || isEnrolled ? "secondary" : "default"}
          >
            {optimisticEnrolled || isEnrolled
              ? "Already Enrolled"
              : "Enroll Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
