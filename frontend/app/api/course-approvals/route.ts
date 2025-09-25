import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { excludeDeleted } from "@/lib/soft-delete";
import { CourseStatus } from "@prisma/client";

// Simple query schema for course approvals
const courseApprovalQuerySchema = z.object({
    status: z.nativeEnum(CourseStatus).optional(),
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(10),
});

// GET /api/course-approvals - Get course approvals for institution reviewers
export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);

        // Validate query parameters
        let validatedQuery;
        try {
            validatedQuery = courseApprovalQuerySchema.parse({
                status: url.searchParams.get("status"),
                page: url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!) : undefined,
                limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined,
            });
        } catch (error) {
            console.error("Query validation error:", error);
            return NextResponse.json(
                { error: "Invalid query parameters", details: error.errors },
                { status: 400 }
            );
        }

        // Check if user has permission to view course approvals
        const hasReviewPermission = currentUser.role === "INSTITUTION"
                                  

        if (!hasReviewPermission) {
            return NextResponse.json(
                { error: "Only authenticated users can view course approvals" },
                { status: 403 }
            );
        }

        // Debug logging
        console.log(`User ${currentUser.id} (${currentUser.role}) requesting course approvals with status: ${validatedQuery.status}`);

        // Get institution memberships for the user based on their role
        let institutionIds: string[] = [];
        
        if (currentUser.role === "ADMIN") {
            // Admins can see all approvals
            const allInstitutions = await prisma.organization.findMany({
                select: { id: true }
            });
            institutionIds = allInstitutions.map(org => org.id);
        } else if (currentUser.role === "INSTITUTION") {
            // Institution users need admin/owner memberships
            const institutionMemberships = await prisma.member.findMany({
                where: {
                    userId: currentUser.id,
                    role: { in: ["admin", "owner"] },
                },
                select: {
                    organizationId: true,
                },
            });
            institutionIds = institutionMemberships.map(m => m.organizationId);
        } else if (currentUser.role === "PROFESSOR") {
            // Professors can see approvals for their institution
            const professorMemberships = await prisma.member.findMany({
                where: {
                    userId: currentUser.id,
                    role: { in: ["admin", "owner", "professor"] },
                },
                select: {
                    organizationId: true,
                },
            });
            institutionIds = professorMemberships.map(m => m.organizationId);
        } else if (currentUser.role === "STUDENT") {
            // Students can see approvals for their institution (read-only)
            const studentMemberships = await prisma.member.findMany({
                where: {
                    userId: currentUser.id,
                    role: { in: ["student"] },
                },
                select: {
                    organizationId: true,
                },
            });
            institutionIds = studentMemberships.map(m => m.organizationId);
        }

        if (institutionIds.length === 0) {
            console.log(`No institution memberships found for user ${currentUser.id}`);
            return NextResponse.json({
                approvals: [],
                pagination: {
                    page: validatedQuery.page,
                    limit: validatedQuery.limit,
                    total: 0,
                    totalPages: 0,
                },
            });
        }

        console.log(`Found ${institutionIds.length} institution IDs for user ${currentUser.id}:`, institutionIds);

        // Build where clause for institution courses
        const whereClause: any = {
            course: {
                faculty: {
                    school: {
                        institutionId: { in: institutionIds },
                    },
                },
            },
        };

        // Only add status filter if provided and not 'all'
        if (validatedQuery.status) {
            whereClause.status = validatedQuery.status;
        }

        // Calculate pagination
        const skip = (Number(validatedQuery.page) - 1) * Number(validatedQuery.limit);

        const [approvals, total] = await Promise.all([
            prisma.courseApproval.findMany({
                where: whereClause,
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
                orderBy: [
                    { submittedAt: 'asc' },
                ],
                skip,
                take: Number(validatedQuery.limit),
            }),
            prisma.courseApproval.count({ where: whereClause })
        ]);

        return NextResponse.json({
            approvals,
            pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total,
                pages: Math.ceil(total / Number(validatedQuery.limit)),
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid query parameters", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error fetching course approvals:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/course-approvals - Submit course for approval
export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // Verify course exists and user has permission
        const course = await prisma.course.findFirst({
            where: excludeDeleted({
                id: courseId,
            }),
            include: {
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
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Check if user is the instructor or has admin permissions
        const isCourseInstructor = course.instructorId === currentUser.id;

        // Check if user is admin in the organization
        const isAdmin = await prisma.member.findFirst({
            where: {
                userId: currentUser.id,
                organizationId: course.faculty.school.institutionId,
                role: { in: ["admin", "owner"] },
            },
        });

        if (!isCourseInstructor && !isAdmin) {
            return NextResponse.json(
                { error: "You don't have permission to submit this course for approval" },
                { status: 403 }
            );
        }

        // Check if course is in draft status
        if (course.status !== "DRAFT") {
            return NextResponse.json(
                { error: "Only draft courses can be submitted for approval" },
                { status: 400 }
            );
        }

        // Check if there's already an active approval
        const existingApproval = await prisma.courseApproval.findFirst({
            where: {
                courseId,
                status: "UNDER_REVIEW",
            },
        });

        if (existingApproval) {
            return NextResponse.json(
                { error: "Course is already under review" },
                { status: 409 }
            );
        }

        // Find institution admin to assign the review to
        const institutionAdmin = await prisma.member.findFirst({
            where: {
                organizationId: course.faculty.school.institutionId,
                role: { in: ["admin", "owner"] },
                user: {
                    status: "ACTIVE",
                },
            },
            include: {
                user: true,
            },
        });

        // If no institution admin found, throw error
        if (!institutionAdmin) {
            return NextResponse.json(
                { error: "No institution administrator available to review this course. Please contact your institution administrator." },
                { status: 500 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update course status
            const updatedCourse = await tx.course.update({
                where: { id: courseId },
                data: {
                    status: "UNDER_REVIEW",
                },
            });

            // Create approval request for institution admin
                const approval = await tx.courseApproval.create({
                    data: {
                        courseId,
                        reviewerId: institutionAdmin.userId,
                        status: "UNDER_REVIEW",
                    },
                });

            // Notify the reviewer
            await tx.notification.create({
                data: {
                    recipientId: institutionAdmin.userId,
                    issuerId: currentUser.id,
                    type: "COURSE_APPROVAL_REQUEST",
                    title: "New Course Approval Request",
                    message: `${currentUser.name} has submitted "${course.title}" for approval`,
                    courseId,
                },
            });

            return { updatedCourse, approval };
        });

        return NextResponse.json(
            { message: "Course submitted for approval successfully", approval: result.approval },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error submitting course for approval:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}