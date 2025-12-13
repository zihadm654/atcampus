"use client";

import type { Enrollment } from "@prisma/client";
import Image from "next/image";
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
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import type { CourseData } from "@/types";
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
      (enroll: Enrollment) => enroll.studentId === user?.id,
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
    <Card className="group pt-0 transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="relative px-0">
        <Image
          alt={course?.instructor.name}
          className="h-44 w-full rounded-sm object-cover"
          height="600"
          src={course?.instructor.image || "/_static/avatars/shadcn.jpeg"}
          width="400"
        />
        <div className="absolute inset-0 flex items-start justify-end">
          {course?.instructorId === user.id && (
            <CourseMoreButton course={course} />
          )}
        </div>
      </CardHeader>

      <Link href={`/courses/${course.id}`}>
        <CardContent className="pt-0 pb-2">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <div className="grid grid-cols-2 gap-4 py-2">
            <p className="text-lg">{formatRelativeDate(course.createdAt)}</p>
            <Badge className="text-xs" variant="outline">
              {course.code}
            </Badge>
          </div>
          {course.faculty && (
            <div className="flex flex-wrap items-center justify-start gap-3">
              <h5>{course.faculty.name}</h5>
              {/* <div className="flex items-center gap-2 text-muted-foreground">
                <span>{course.enrollments?.length || 0} enrolled</span>
              </div> */}
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          disabled={
            optimisticEnrolled ||
            isEnrolled ||
            isPending ||
            user.role !== "STUDENT"
          }
          onClick={handleEnroll}
          variant={optimisticEnrolled || isEnrolled ? "secondary" : "default"}
        >
          {optimisticEnrolled || isEnrolled ? "Already Enrolled" : "Enroll Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
