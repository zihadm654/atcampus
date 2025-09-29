import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { CourseReviewForm } from "./_components/CourseReviewForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Approval Review",
  description: "Review and approve course submissions",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

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

  if (!approval || !approval.course) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Course Approval
        </h1>
        <p className="text-sm">Review course submission for approval</p>
      </div>

      <CourseReviewForm approval={{
        ...approval,
        comments: approval.comments || undefined,
        submittedAt: approval.submittedAt.toISOString(),
        reviewedAt: approval.reviewedAt ? approval.reviewedAt.toISOString() : undefined,
        course: {
          id: approval.course.id,
          title: approval.course.title,
          code: approval.course.code,
          description: approval.course.description,
          department: approval.course.department || undefined,
          difficulty: approval.course.difficulty || undefined,
          credits: approval.course.credits || undefined,
          estimatedHours: approval.course.estimatedHours || undefined,
          year: approval.course.year || undefined,

          objectives: approval.course.objectives || [],
          outcomes: approval.course.outcomes || [],

          instructor: {
            id: approval.course.instructor.id,
            name: approval.course.instructor.name,
            email: approval.course.instructor.email,
            image: approval.course.instructor.image || undefined
          },
          faculty: {
            name: approval.course.faculty.name,
            school: {
              name: approval.course.faculty.school.name,
              institution: {
                name: approval.course.faculty.school.institution.name,
                id: approval.course.faculty.school.institution.id
              }
            }
          }
        },
        reviewer: {
          id: approval.reviewer.id,
          name: approval.reviewer.name,
          email: approval.reviewer.email,
          image: approval.reviewer.image || undefined
        }
      }} canReview={canReview} />
    </div>
  );
}
