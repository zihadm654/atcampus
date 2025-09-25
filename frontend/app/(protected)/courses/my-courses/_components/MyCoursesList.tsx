"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import { submitCourseForApproval } from "@/components/courses/actions";

interface CourseApproval {
  id: string;
  status: string;
  comments: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  status: string;
  createdAt: Date;
  faculty: {
    name: string;
    school: {
      name: string;
    };
  };
  approvals: CourseApproval[];
}

interface MyCoursesListProps {
  courses: Course[];
}

const statusColors = {
  DRAFT: "secondary",
  UNDER_REVIEW: "default",
  NEEDS_REVISION: "destructive",
  PUBLISHED: "default",
  REJECTED: "destructive",
  ARCHIVED: "secondary",
} as const;

const statusLabels = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  NEEDS_REVISION: "Needs Revision",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
} as const;

export function MyCoursesList({ courses }: MyCoursesListProps) {
  const [submittingCourses, setSubmittingCourses] = useState<Set<string>>(
    new Set()
  );
  const queryClient = useQueryClient();

  const handleSubmitForApproval = async (courseId: string) => {
    try {
      setSubmittingCourses((prev) => new Set(prev).add(courseId));
      const result = await submitCourseForApproval(courseId);

      if (result.success) {
        toast.success("Course submitted for approval!");
        await queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
        await queryClient.invalidateQueries({ queryKey: ["course-feed"] });
      } else {
        toast.error(result.error || "Failed to submit for approval");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmittingCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            You haven't created any courses yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/courses/create">Create Your First Course</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {course.code} • {course.faculty.name}
                </CardDescription>
              </div>
              <Badge
                variant={
                  statusColors[course.status as keyof typeof statusColors] ||
                  "secondary"
                }
                className="text-xs shrink-0"
              >
                {statusLabels[course.status as keyof typeof statusLabels] ||
                  course.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            <div className="text-sm text-muted-foreground line-clamp-3 mb-3">
              <JsonToHtml json={JSON.parse(course.description)} />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <strong>School:</strong> {course.faculty.school.name}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {formatDistanceToNow(new Date(course.createdAt), {
                  addSuffix: true,
                })}
              </div>

              {course.approvals && course.approvals.length > 0 && (
                <div>
                  <strong>Last Submission:</strong>{" "}
                  {formatDistanceToNow(
                    new Date(course.approvals[0].submittedAt),
                    { addSuffix: true }
                  )}
                </div>
              )}
            </div>

            {course.approvals && course.approvals.length > 0 && course.approvals[0].comments && (
              <div className="mt-3 p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Review Notes:</strong> {course.approvals[0].comments}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-0 gap-2">
            <div className="flex gap-2 w-full">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/courses/${course.id}/edit`}>Edit</Link>
              </Button>

              {(course.status === "DRAFT" ||
                course.status === "NEEDS_REVISION" ||
                course.status === "REJECTED") && (
                <Button
                  onClick={() => handleSubmitForApproval(course.id)}
                  disabled={submittingCourses.has(course.id)}
                  size="sm"
                  className="flex-1"
                  variant={
                    course.status === "NEEDS_REVISION" ||
                    course.status === "REJECTED"
                      ? "destructive"
                      : "default"
                  }
                >
                  {submittingCourses.has(course.id)
                    ? "Submitting..."
                    : course.status === "NEEDS_REVISION"
                      ? "Submit Revision"
                      : course.status === "REJECTED"
                        ? "Resubmit Course"
                        : "Submit for Approval"}
                </Button>
              )}

              {course.status === "UNDER_REVIEW" && (
                <Button disabled size="sm" className="flex-1">
                  Under Review
                </Button>
              )}

              {course.status === "PUBLISHED" && (
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
