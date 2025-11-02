import { CourseStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyCourseApprovalRequest } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";
import { excludeDeleted } from "@/lib/soft-delete";

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
        page: url.searchParams.get("page")
          ? Number.parseInt(url.searchParams.get("page")!, 10)
          : undefined,
        limit: url.searchParams.get("limit")
          ? Number.parseInt(url.searchParams.get("limit")!, 10)
          : undefined,
      });
    } catch (error) {
      console.error("Query validation error:", error);
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    // Debug logging
    console.log(
      `User ${currentUser.id} requesting course approvals with status: ${validatedQuery.status}`
    );

    // Build where clause for courses where user is reviewer
    const whereClause = {
      reviewerId: currentUser.id,
      status: {
        in: [
          CourseStatus.UNDER_REVIEW,
          CourseStatus.PUBLISHED,
          CourseStatus.REJECTED,
          CourseStatus.NEEDS_REVISION,
        ],
      },
    };

    // Only add status filter if provided and not 'all'
    if (validatedQuery.status) {
      whereClause.status = validatedQuery.status;
    }

    // Calculate pagination
    const skip =
      (Number(validatedQuery.page) - 1) * Number(validatedQuery.limit);

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
        orderBy: [{ submittedAt: "asc" }],
        skip,
        take: Number(validatedQuery.limit),
      }),
      prisma.courseApproval.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      approvals,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        pages: Math.ceil(total / Number(validatedQuery.limit)),
      },
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
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
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

    if (!(isCourseInstructor || isAdmin)) {
      return NextResponse.json(
        {
          error: "You don't have permission to submit this course for approval",
        },
        { status: 403 }
      );
    }

    // Check if course is in draft status
    if (
      course.status !== CourseStatus.DRAFT &&
      course.status !== CourseStatus.REJECTED &&
      course.status !== CourseStatus.NEEDS_REVISION
    ) {
      return NextResponse.json(
        {
          error:
            "Only draft, rejected, or courses needing revision can be submitted for approval",
        },
        { status: 400 }
      );
    }

    // Check if there's already an active approval
    const existingApproval = await prisma.courseApproval.findFirst({
      where: {
        courseId,
        status: CourseStatus.UNDER_REVIEW,
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
        {
          error:
            "No institution administrator available to review this course. Please contact your institution administrator.",
        },
        { status: 500 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update course status
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.UNDER_REVIEW,
        },
      });

      // Create approval request for institution admin
      const approval = await tx.courseApproval.create({
        data: {
          courseId,
          reviewerId: institutionAdmin.userId,
          status: CourseStatus.UNDER_REVIEW,
        },
      });

      // Notify the reviewer using the notification service
      await notifyCourseApprovalRequest(
        courseId,
        currentUser.id,
        institutionAdmin.userId
      );

      return { updatedCourse, approval };
    });

    return NextResponse.json(
      {
        message: "Course submitted for approval successfully",
        approval: result.approval,
      },
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
