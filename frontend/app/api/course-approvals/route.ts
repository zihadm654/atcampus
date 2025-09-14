import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { auditCourseAction } from "@/lib/audit";
import { excludeDeleted } from "@/lib/soft-delete";
import { courseApprovalQuerySchema } from "@/lib/validations/enhanced-validations";

// GET /api/course-approvals - Get pending course approvals for reviewer
export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const queryParams = {
            status: url.searchParams.get("status") || "PENDING",
            level: url.searchParams.get("level"),
            priority: url.searchParams.get("priority"),
            page: url.searchParams.get("page") || 1,
            limit: url.searchParams.get("limit") || 10,
        };

        const validatedQuery = courseApprovalQuerySchema.parse(queryParams);

        // Determine user's review capabilities based on role and memberships
        let reviewCapability: string[] = [];

        if (currentUser.role === "INSTITUTION") {
            reviewCapability = ["INSTITUTION_ADMIN"];
        }

        // Get user's member roles in organizations
        const memberRoles = await prisma.member.findMany({
            where: excludeDeleted({
                userId: currentUser.id,
                isActive: true,
            }),
            include: {
                organization: true,
                faculty: {
                    include: {
                        school: true,
                    },
                },
            },
        });

        memberRoles.forEach(member => {
            if (member.role === "FACULTY_ADMIN") {
                reviewCapability.push("FACULTY_ADMIN");
            }
            if (member.role === "SCHOOL_ADMIN") {
                reviewCapability.push("SCHOOL_ADMIN");
            }
        });

        if (reviewCapability.length === 0) {
            return NextResponse.json(
                { error: "You don't have permission to review courses" },
                { status: 403 }
            );
        }

        // Build where clause based on review capability
        let whereClause: any = {
            status: validatedQuery.status,
            isActive: true,
        };

        if (validatedQuery.priority) {
            whereClause.priority = validatedQuery.priority;
        }

        // Add level filter if specified
        if (validatedQuery.level) {
            whereClause.level = validatedQuery.level;
        } else {
            // Show approvals relevant to user's role
            const levelConditions: any[] = [];

            if (reviewCapability.includes("FACULTY_ADMIN")) {
                levelConditions.push({ level: 1 });
            }
            if (reviewCapability.includes("SCHOOL_ADMIN")) {
                levelConditions.push({ level: 2 });
            }
            if (reviewCapability.includes("INSTITUTION_ADMIN")) {
                levelConditions.push({ level: 3 });
            }

            if (levelConditions.length > 0) {
                whereClause.OR = levelConditions;
            }
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
                    { priority: 'desc' },
                    { submittedAt: 'asc' },
                ],
                skip,
                take: Number(validatedQuery.limit),
            }),
            prisma.courseApproval.count({ where: whereClause })
        ]);

        // Filter approvals based on user's actual access to the courses
        const accessibleApprovals = approvals.filter(approval => {
            if (!approval.course) return false;

            const course = approval.course;
            const userMember = memberRoles.find(member =>
                member.organizationId === course.faculty.school.institutionId
            );

            if (!userMember) return false;

            // Faculty admin can review level 1 approvals in their faculty
            if (approval.level === 1 && userMember.role === "FACULTY_ADMIN") {
                return userMember.facultyId === course.facultyId;
            }

            // School admin can review level 2 approvals in their school
            if (approval.level === 2 && userMember.role === "SCHOOL_ADMIN") {
                return userMember.faculty?.schoolId === course.faculty.schoolId;
            }

            // Institution admin can review level 3 approvals in their organization
            if (approval.level === 3 && currentUser.role === "INSTITUTION") {
                return course.faculty.school.institutionId === currentUser.id;
            }

            return false;
        });

        return NextResponse.json({
            approvals: accessibleApprovals,
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
                instructorId: currentUser.id,
                status: "DRAFT",
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
                { error: "Course not found or you don't have permission to submit it" },
                { status: 404 }
            );
        }

        // Check if there's already an active approval
        const existingApproval = await prisma.courseApproval.findFirst({
            where: {
                courseId,
                isActive: true,
                status: "PENDING",
            },
        });

        if (existingApproval) {
            return NextResponse.json(
                { error: "Course is already under review" },
                { status: 409 }
            );
        }

        // Find a faculty admin to assign the review to
        const facultyAdmin = await prisma.member.findFirst({
            where: {
                organizationId: course.faculty.school.institutionId,
                facultyId: course.facultyId,
                role: "FACULTY_ADMIN",
                isActive: true,
            },
        });

        if (!facultyAdmin) {
            return NextResponse.json(
                { error: "No faculty administrator available to review this course" },
                { status: 500 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update course status and approval level
            const updatedCourse = await tx.course.update({
                where: { id: courseId },
                data: {
                    status: "UNDER_REVIEW",
                    submittedForApproval: new Date(),
                    currentApprovalLevel: 1,
                    approvalHistory: {
                        push: JSON.stringify({
                            action: "SUBMITTED",
                            timestamp: new Date(),
                            userId: currentUser.id,
                            level: 1,
                        })
                    }
                },
            });

            // Create first level approval request
            const approval = await tx.courseApproval.create({
                data: {
                    courseId,
                    reviewerId: facultyAdmin.userId,
                    level: 1,
                    isActive: true,
                    status: "PENDING",
                    priority: "NORMAL",
                },
            });

            // Notify the faculty admin
            await tx.notification.create({
                data: {
                    recipientId: facultyAdmin.userId,
                    issuerId: currentUser.id,
                    type: "COURSE_APPROVAL_REQUEST",
                    title: "New Course Approval Request",
                    message: `${currentUser.name} has submitted "${course.title}" for approval`,
                    courseId,
                },
            });

            return { updatedCourse, approval };
        });

        // Create audit log
        await auditCourseAction(
            "SUBMIT_APPROVAL",
            courseId,
            { status: "DRAFT" },
            { status: "UNDER_REVIEW", currentApprovalLevel: 1 },
            "Course submitted for approval",
            { reviewerId: facultyAdmin.userId }
        );

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