"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  CreditCard,
  Users,
  Building,
  Star,
} from "lucide-react";

import { Course as CourseType, Enrollment } from "@prisma/client";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";

import CourseMoreButton from "./CourseMoreButton";
import UserTooltip from "../UserTooltip";
import { UserAvatar } from "../shared/user-avatar";
import { toast } from "sonner";
import { enrollCourse } from "@/actions/enrollment";
import { useTransition, useOptimistic } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseProps {
  course: CourseType & {
    instructor: { username: string; image?: string; name?: string };
    faculty?: { name: string };
    enrollments: Enrollment[];
  };
}

export default function Course({ course }: any) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isPending, startTransition] = useTransition();

  const isEnrolled = course.enrollments.some(
    (enroll: Enrollment) => enroll.studentId === user?.id
  );
  const [optimisticEnrolled, setOptimisticEnrolled] = useOptimistic(
    isEnrolled,
    (_, newState: boolean) => newState
  );

  if (!user) {
    return null;
  }

  const handleEnroll = () => {
    startTransition(async () => {
      setOptimisticEnrolled(true);
      const res = await enrollCourse(course.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        setOptimisticEnrolled(false);
        toast.error(res.message);
      }
    });
  };
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserTooltip user={course.instructor}>
              <Link href={`/${course.instructor.username}`}>
                <UserAvatar user={course.instructor} />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={course.instructor}>
                <Link
                  href={`/${course.instructor.username}`}
                  className="font-semibold hover:underline"
                >
                  {course.instructor.name || course.instructor.username}
                </Link>
              </UserTooltip>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={`/courses/${course.id}`}
                  className="hover:underline"
                  suppressHydrationWarning
                >
                  {formatRelativeDate(course.createdAt)}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {course.code}
            </Badge>
            {course.instructorId === user.id && (
              <CourseMoreButton course={course} />
            )}
          </div>
        </div>
      </CardHeader>

      <Link href={`/courses/${course.id}`}>
        <CardContent className="pt-0 pb-4">
          <CardTitle className="text-lg mb-2 line-clamp-2">
            {course.title}
          </CardTitle>
          {course.faculty && (
            <div className="flex items-center justify-center">
              <Building className="size-3" />
              <span>{course.faculty.name}</span>
            </div>
          )}
          <CardDescription className="mb-4 line-clamp-2">
            {course.description}
          </CardDescription>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-4" />
              <span>{course.credits} credits</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>{course.duration} weeks</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span className="capitalize">{course.level?.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span>{course.enrollments?.length || 0} enrolled</span>
            </div>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-muted-foreground">
                Prerequisites:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {course.prerequisites.map((prereq: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="pt-0">
        {user.role === "STUDENT" && (
          <Button
            onClick={handleEnroll}
            variant={optimisticEnrolled ? "secondary" : "default"}
            disabled={optimisticEnrolled || isPending}
            className="w-full"
          >
            {optimisticEnrolled ? "Already Enrolled" : "Enroll Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
