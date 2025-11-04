import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CourseReviewForm } from "./_components/CourseReviewForm";

export const metadata: Metadata = {
  title: "Course Approval Review",
  description: "Review and approve course submissions",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "UNDER_REVIEW":
      return "default";
    case "PUBLISHED":
      return "success";
    case "REJECTED":
      return "destructive";
    case "NEEDS_REVISION":
      return "destructive";
    default:
      return "secondary";
  }
};

export default async function CourseApprovalPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const approval = await prisma.courseApproval.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          faculty: {
            include: {
              school: {
                include: {
                  institution: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!approval?.course) {
    notFound();
  }

  // Check if user can access this approval
  const canAccess =
    approval.reviewerId === currentUser.id || // Institution admin reviewer
    approval.course.instructorId === currentUser.id || // Course instructor
    currentUser.role === "ADMIN"; // Admin

  if (!canAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-2xl text-gray-900">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to view this approval.
          </p>
        </div>
      </div>
    );
  }

  const canReview =
    approval.reviewerId === currentUser.id &&
    approval.status === "UNDER_REVIEW";

  // Parse objectives from string to array
  let objectives: string[] = [];
  if (typeof approval.course.objectives === "string") {
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(approval.course.objectives);
      if (Array.isArray(parsed)) {
        objectives = parsed.filter(
          (item): item is string => typeof item === "string"
        );
      } else {
        // If it's not an array, treat as comma-separated string
        objectives = approval.course.objectives
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    } catch (_e) {
      // If parsing fails, treat as comma-separated string
      objectives = approval.course.objectives
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  // Create a properly typed approval object that matches CourseReviewForm interface
  const approvalWithFixedTypes = {
    ...approval,
    comments: approval.comments !== null ? approval.comments : undefined,
    course: {
      ...approval.course,
      objectives,
      year: approval.course.year ?? undefined, // Convert null to undefined
      credits: approval.course.credits ?? undefined, // Convert null to undefined
      difficulty: approval.course.difficulty ?? undefined, // Convert null to undefined
      estimatedHours: approval.course.estimatedHours ?? undefined, // Convert null to undefined
      instructor: {
        ...approval.course.instructor,
        image: approval.course.instructor.image ?? undefined, // Convert null to undefined
      },
      faculty: {
        ...approval.course.faculty,
        school: {
          ...approval.course.faculty.school,
          institution: {
            ...approval.course.faculty.school.institution,
            image:
              approval.course.faculty.school.institution.image ?? undefined, // Convert null to undefined
          },
        },
      },
    },
    reviewer: {
      ...approval.reviewer,
      image: approval.reviewer.image ?? undefined, // Convert null to undefined
    },
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Course Approval</h1>
          <p className="text-muted-foreground">
            Review and approve course submissions
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/courses/approvals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Approvals
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Course Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {approval.course.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {approval.course.code} • {approval.course.faculty.name}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge
                    className="text-sm"
                    variant={getStatusColor(approval.status) as any}
                  >
                    {approval.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium text-sm">Instructor</p>
                  <p className="text-muted-foreground text-sm">
                    {approval.course.instructor.name}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Institution</p>
                  <p className="text-muted-foreground text-sm">
                    {approval.course.faculty.school.institution.name}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm">Description</h4>
                <p className="text-muted-foreground text-sm">
                  <JsonToHtml json={JSON.parse(approval.course.description)} />
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Objectives</p>
                <ul className="list-inside list-disc text-muted-foreground text-sm">
                  {objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
              {/* Remove outcomes section since it doesn't exist in the model */}
            </CardContent>
          </Card>

          {approval.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Reviewer Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {approval.comments}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Form - Only show if user can review */}
        {canReview && (
          <div className="lg:col-span-1">
            <CourseReviewForm
              approval={approvalWithFixedTypes}
              canReview={canReview}
            />
          </div>
        )}
      </div>
    </div>
  );
}
