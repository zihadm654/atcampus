import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { auditCourseAction } from "@/lib/audit";
import { excludeDeleted } from "@/lib/soft-delete";
import { approvalDecisionSchema } from "@/lib/validations/enhanced-validations";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

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
        const hasAccess =
            approval.reviewerId === currentUser.id || // Reviewer can view
            approval.course?.instructorId === currentUser.id; // Course creator can view

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

// PATCH /api/course-approvals/[id] - Make approval decision
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = approvalDecisionSchema.parse(body);

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

        if (approval.status !== "PENDING") {
            return NextResponse.json(
                { error: "This approval has already been processed" },
                { status: 409 }
            );
        }

        const { decision } = validatedData;

        const result = await prisma.$transaction(async (tx) => {
            // Calculate overall score if individual scores provided
            let calculatedOverallScore: number | null = null;
            if (validatedData.contentScore && validatedData.academicRigor && validatedData.resourceScore) {
                const scores = [
                    validatedData.contentScore,
                    validatedData.academicRigor,
                    validatedData.resourceScore,
                ];
                if (validatedData.innovationScore) {
                    scores.push(validatedData.innovationScore);
                }
                calculatedOverallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            }

            // Update the current approval
            const updatedApproval = await tx.courseApproval.update({
                where: { id },
                data: {
                    status: decision === "approve" ? "APPROVED" :
                        decision === "reject" ? "REJECTED" : "NEEDS_REVISION",
                    comments: validatedData.comments,
                    internalNotes: validatedData.internalNotes,
                    reviewedAt: new Date(),
                    contentScore: validatedData.contentScore,
                    academicRigor: validatedData.academicRigor,
                    resourceScore: validatedData.resourceScore,
                    innovationScore: validatedData.innovationScore,
                    overallScore: calculatedOverallScore,
                    requiredChanges: validatedData.requiredChanges || [],
                    suggestedChanges: validatedData.suggestedChanges || [],
                    revisionDeadline: validatedData.revisionDeadline ?
                        new Date(validatedData.revisionDeadline) : null,
                    isActive: false,
                    conflictOfInterest: validatedData.conflictOfInterest || false,
                    reviewMethodology: validatedData.reviewMethodology,
                    estimatedReviewTime: validatedData.estimatedReviewTime,
                },
            });

            let courseUpdate: any = {
                approvalHistory: {
                    push: JSON.stringify({
                        action: decision.toUpperCase(),
                        timestamp: new Date(),
                        userId: currentUser.id,
                        level: approval.level,
                        comments: validatedData.comments,
                        score: calculatedOverallScore,
                    })
                }
            };

            if (decision === "approve") {
                // Check if we need to proceed to next level
                const nextLevel = approval.level + 1;
                const maxLevel = 3; // Can be configurable per institution

                if (nextLevel <= maxLevel) {
                    // Move to next level
                    const nextLevelAdmin = await findApprover(
                        tx,
                        nextLevel,
                        approval.course?.faculty?.school?.institutionId || '',
                        approval.course?.facultyId,
                        approval.course?.faculty?.schoolId
                    );

                    if (nextLevelAdmin) {
                        // Create next level approval
                        await tx.courseApproval.create({
                            data: {
                                courseId: approval.courseId,
                                reviewerId: nextLevelAdmin,
                                level: nextLevel,
                                isActive: true,
                                status: "PENDING",
                                priority: approval.priority,
                            },
                        });

                        courseUpdate.currentApprovalLevel = nextLevel;

                        // Notify next level reviewer
                        await tx.notification.create({
                            data: {
                                recipientId: nextLevelAdmin,
                                issuerId: currentUser.id,
                                type: "COURSE_APPROVAL_REQUEST",
                                title: "Course Approval Request",
                                message: `Level ${nextLevel} approval needed for "${approval.course?.title}"`,
                                courseId: approval.courseId,
                            },
                        });
                    } else {
                        // No reviewer found for next level, approve automatically
                        courseUpdate.status = "APPROVED";
                        courseUpdate.currentApprovalLevel = 0;
                    }
                } else {
                    // Final approval - publish course
                    courseUpdate.status = "APPROVED";
                    courseUpdate.currentApprovalLevel = 0;

                    // Notify course creator of final approval
                    await tx.notification.create({
                        data: {
                            recipientId: approval.course?.instructorId || '',
                            issuerId: currentUser.id,
                            type: "COURSE_APPROVAL_RESULT",
                            title: "Course Approved",
                            message: `Your course "${approval.course?.title}" has been approved`,
                            courseId: approval.courseId,
                        },
                    });
                }

            } else if (decision === "reject") {
                // Reject the course
                courseUpdate.status = "REJECTED";
                courseUpdate.currentApprovalLevel = 0;
                courseUpdate.rejectionReason = validatedData.comments;

                // Notify course creator of rejection
                await tx.notification.create({
                    data: {
                        recipientId: approval.course?.instructorId || '',
                        issuerId: currentUser.id,
                        type: "COURSE_APPROVAL_RESULT",
                        title: "Course Rejected",
                        message: `Your course "${approval.course?.title}" has been rejected`,
                        courseId: approval.courseId,
                    },
                });

            } else if (decision === "request_revision") {
                // Request revisions
                courseUpdate.status = "NEEDS_REVISION";
                courseUpdate.currentApprovalLevel = 0;
                courseUpdate.revisionNotes = validatedData.comments;

                // Notify course creator of revision request
                await tx.notification.create({
                    data: {
                        recipientId: approval.course?.instructorId || '',
                        issuerId: currentUser.id,
                        type: "COURSE_APPROVAL_RESULT",
                        title: "Course Revision Requested",
                        message: `Revisions requested for "${approval.course?.title}"`,
                        courseId: approval.courseId,
                    },
                });
            }

            // Update course
            const updatedCourse = await tx.course.update({
                where: { id: approval.courseId },
                data: courseUpdate,
            });

            return { updatedApproval, updatedCourse };
        });

        // Create audit log
        await auditCourseAction(
            decision === "approve" ? "APPROVE" :
                decision === "reject" ? "REJECT" : "REQUEST_REVISION",
            approval.courseId,
            { status: approval.course?.status },
            { status: result.updatedCourse.status },
            validatedData.comments || `${decision} by ${currentUser.name}`,
            {
                level: approval.level,
                score: result.updatedApproval.overallScore,
                reviewerId: currentUser.id,
            }
        );

        return NextResponse.json({
            message: `Course ${decision} processed successfully`,
            approval: result.updatedApproval,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error processing course approval:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to find appropriate approver for next level
async function findApprover(
    tx: any,
    level: number,
    institutionId: string,
    facultyId?: string,
    schoolId?: string
): Promise<string | null> {
    if (level === 2) {
        // School admin
        const schoolAdmin = await tx.member.findFirst({
            where: {
                organizationId: institutionId,
                faculty: { schoolId },
                role: "SCHOOL_ADMIN",
                isActive: true,
            },
        });
        return schoolAdmin?.userId || null;
    }

    if (level === 3) {
        // Institution admin
        const institutionAdmin = await tx.member.findFirst({
            where: {
                organizationId: institutionId,
                role: "ORGANIZATION_ADMIN",
                isActive: true,
            },
        });
        return institutionAdmin?.userId || null;
    }

    return null;
}