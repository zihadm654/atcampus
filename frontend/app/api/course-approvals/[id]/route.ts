import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";

type RouteParams = {
    params: Promise<{ id: string }>;
};

// GET /api/course-approvals/[id] - Get specific course approval
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        if (!approval) {
            return NextResponse.json(
                { error: "Course approval not found" },
                { status: 404 }
            );
        }

        // Filter out soft deleted courses
        if (approval.course?.isDeleted) {
            return NextResponse.json(
                { error: "Course approval not found" },
                { status: 404 }
            );
        }

        // Check access permissions
        // Users can view approvals if they are:
        // 1. The assigned reviewer
        // 2. The course instructor
        // 3. An admin in the organization
        const isReviewer = approval.reviewerId === currentUser.id;
        const isCourseInstructor = approval.course?.instructorId === currentUser.id;

        let isAdmin = false;
        if (approval.course?.faculty?.school?.institutionId) {
            const adminRole = await prisma.member.findFirst({
                where: {
                    userId: currentUser.id,
                    organizationId: approval.course.faculty.school.institutionId,
                    role: { in: ["admin", "owner"] },
                },
            });
            isAdmin = !!adminRole;
        }

        const hasAccess = isReviewer || isCourseInstructor || isAdmin;

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        return NextResponse.json({ approval });
    } catch (error) {
        console.error("Error fetching course approval:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

const reviewSchema = z.object({
  decision: z.enum(["PUBLISHED", "REJECTED", "NEEDS_REVISION"]),
  comments: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  contentQualityScore: z.number().min(0).max(100).optional(),
  pedagogyQualityScore: z.number().min(0).max(100).optional(),
});

// PATCH /api/course-approvals/[id] - Make approval decision
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { decision, comments, qualityScore, contentQualityScore, pedagogyQualityScore } = validation.data;

        // Convert decision to proper CourseStatus
        let courseStatus: CourseStatus;
        switch (decision) {
            case "PUBLISHED":
                courseStatus = CourseStatus.PUBLISHED;
                break;
            case "REJECTED":
                courseStatus = CourseStatus.REJECTED;
                break;
            case "NEEDS_REVISION":
                courseStatus = CourseStatus.NEEDS_REVISION;
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid decision" },
                    { status: 400 }
                );
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
                    },
                },
                reviewer: true,
            },
        });

        if (!approval) {
            return NextResponse.json(
                { error: "Course approval not found" },
                { status: 404 }
            );
        }

        // Filter out soft deleted courses
        if (approval.course?.isDeleted) {
            return NextResponse.json(
                { error: "Course approval not found" },
                { status: 404 }
            );
        }

        // Verify reviewer permission
        if (approval.reviewerId !== currentUser.id) {
            return NextResponse.json(
                { error: "Only the assigned reviewer can make approval decisions" },
                { status: 403 }
            );
        }

        if (approval.status !== "UNDER_REVIEW") {
            return NextResponse.json(
                { error: "This approval has already been processed" },
                { status: 409 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update the approval
            const updatedApproval = await tx.courseApproval.update({
              where: { id },
              data: {
                status: decision,
                comments: comments || "",
                reviewedAt: new Date(),
                qualityScore,
                contentQualityScore,
                pedagogyQualityScore,
            },
            select: {
                id: true,
                status: true,
                comments: true,
                reviewedAt: true,
                courseId: true,
                reviewerId: true,
            },
            });

            // Update course status
            const updatedCourse = await tx.course.update({
                where: { id: approval.courseId },
                data: { status: courseStatus },
            });

            // Notify course creator
            await tx.notification.create({
              data: {
                recipientId: approval.course?.instructorId || '',
                issuerId: currentUser.id,
                type: "COURSE_APPROVAL_RESULT",
                title: `Course ${decision}`,
                message: `Your course \"${approval.course?.title}\" has been ${decision}`,
                courseId: approval.courseId,
              },
            });

            return { updatedApproval, updatedCourse };
        });

        return NextResponse.json({
            message: `Course ${decision} processed successfully`,
            approval: result.updatedApproval,
        });
    } catch (error) {
        console.error("Error processing course approval:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}