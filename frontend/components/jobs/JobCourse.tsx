"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseData } from "@/types";
import Course from "../courses/Course";

interface JobCourseProps {
  courseId: string;
}

export default function JobCourse({ courseId }: JobCourseProps) {
  const {
    data: course,
    isLoading,
    error,
  } = useQuery<CourseData>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Associated Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !course) {
    return null;
  }
  return <Course course={course} />;
  // return (
  //     <Card className="group transition-shadow duration-200 hover:shadow-lg">
  //         <CardHeader>
  //             <div className="flex items-start justify-between">
  //                 <div className="flex items-center gap-3">
  //                     <UserTooltip user={course.instructor}>
  //                         <Link href={`/${course.instructor.username}`}>
  //                             <UserAvatar user={course.instructor} />
  //                         </Link>
  //                     </UserTooltip>
  //                     <div>
  //                         <UserTooltip user={course.instructor}>
  //                             <Link
  //                                 className="font-semibold hover:underline"
  //                                 href={`/${course.instructor.username}`}
  //                             >
  //                                 {course.instructor.name || course.instructor.username}
  //                             </Link>
  //                         </UserTooltip>
  //                         <div className="flex items-center gap-2 text-muted-foreground text-sm">
  //                             {/* <Link
  //                                 className="hover:underline"
  //                                 href={`/courses/${course.id}`}
  //                                 suppressHydrationWarning
  //                             >
  //                                 {formatRelativeDate(course.createdAt)}
  //                             </Link> */}
  //                         </div>
  //                     </div>
  //                 </div>
  //             </div>
  //         </CardHeader>

  //         <Link href={`/courses/${course.id}`}>
  //             <CardContent className="pt-0 pb-4">
  //                 <h1 className="font-semibold text-xl">{course.title}</h1>
  //                 {course.faculty && (
  //                     <div className="flex flex-wrap items-center justify-start gap-2">
  //                         <span className="flex items-center gap-1">
  //                             <Building className="mr-1 size-3" />
  //                             {course.faculty.name}
  //                         </span>
  //                         <Badge className="text-xs" variant="outline">
  //                             {course.code}
  //                         </Badge>
  //                     </div>
  //                 )}

  //                 <div className="grid grid-cols-2 gap-4 text-sm">
  //                     <div className="flex items-center gap-2 text-muted-foreground">
  //                         <CreditCard className="size-4" />
  //                         <span>{course.credits} credits</span>
  //                     </div>
  //                     <div className="flex items-center gap-2 text-muted-foreground">
  //                         <Clock className="size-4" />
  //                         <span>{course.estimatedHours} weeks</span>
  //                     </div>
  //                     <div className="flex items-center gap-2 text-muted-foreground">
  //                         <Users className="size-4" />
  //                         <span className="capitalize">{course.difficulty}</span>
  //                     </div>
  //                     <div className="flex items-center gap-2 text-muted-foreground">
  //                         <BookOpen className="size-4" />
  //                         <span>{course.enrollments?.length || 0} enrolled</span>
  //                     </div>
  //                 </div>
  //             </CardContent>
  //         </Link>

  //         <CardContent className="pt-0">
  //             <Button className="w-full" variant="outline">
  //                 View Course Details
  //             </Button>
  //         </CardContent>
  //     </Card>
  // );
}
