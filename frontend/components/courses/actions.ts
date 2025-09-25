"use server";

import { revalidatePath } from "next/cache";

import { getCourseDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { courseSchema, TCourse } from "@/lib/validations/course";
import { CourseStatus } from "@prisma/client";
import { auditCourseAction } from "@/lib/audit";

export async function submitCourseForApproval(courseId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify course exists with all necessary relations
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
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
      throw new Error("Course not found");
    }

    // Only the course instructor can submit for approval
    if (course.instructorId !== user.id) {
      throw new Error("Only the course instructor can submit for approval");
    }

    // Verify professor belongs to the faculty
    const professorMember = await prisma.member.findFirst({
      where: {
        userId: user.id,
        facultyId: course.facultyId,
        role: "member",
      },
    });

    if (!professorMember) {
      throw new Error("You must be a professor in this faculty to submit courses for approval");
    }

    // Check course status
    if (course.status !== CourseStatus.DRAFT &&
      course.status !== CourseStatus.REJECTED &&
      course.status !== CourseStatus.NEEDS_REVISION) {
      throw new Error("Only draft, rejected, or courses needing revision can be submitted for approval");
    }

    // Check for existing pending approval
    const existingApproval = await prisma.courseApproval.findFirst({
      where: {
        courseId,
        status: CourseStatus.UNDER_REVIEW,
      },
    });

    if (existingApproval) {
      throw new Error("Course is already under review");
    }

    // Find institution admin for review
    const institutionUserId = course.faculty.school.institutionId;

    if (!institutionUserId) {
      throw new Error("The course's school is not associated with an institution user.");
    }

    const institutionReviewer = await prisma.member.findFirst({
      where: {
        userId: institutionUserId,
        role: { in: ["owner", "admin"] },
        user: {
          status: "ACTIVE",
        },
      },
      include: {
        user: true,
      },
    });

    if (!institutionReviewer) {
      throw new Error("No institution administrator available. Please contact your institution.");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update course status
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.UNDER_REVIEW,
        },
        include: getCourseDataInclude(user.id),
      });

      // Create approval request
      const approval = await tx.courseApproval.create({
        data: {
          courseId,
          reviewerId: institutionReviewer.userId,
          status: CourseStatus.UNDER_REVIEW,
          submittedAt: new Date(),
          comments: null,
        },
      });

      // Notify institution admin
      await tx.notification.create({
        data: {
          recipientId: institutionReviewer.userId,
          issuerId: user.id,
          type: "COURSE_APPROVAL_REQUEST",
          title: "Course Approval Request",
          message: `Professor ${user.name} has submitted "${course.title}" for approval`,
          courseId,
        },
      });

      return { updatedCourse, approval };
    });

    // Create audit log
    await auditCourseAction(
      "SUBMIT_APPROVAL",
      courseId,
      { status: course.status },
      { status: CourseStatus.UNDER_REVIEW },
      "Course submitted for approval",
      { reviewerId: institutionReviewer.userId }
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting course for approval:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCourse(id: string) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
    }
  });

  if (!course) throw new Error("Course not found");

  if (course.instructorId !== user.id) throw new Error("Unauthorized");

  const deletedCourse = await prisma.course.delete({
    where: { id },
    include: getCourseDataInclude(user.id),
  });

  return deletedCourse;
}

export async function getCourses() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  if (courses.length === 0) {
    return [];
  }
  return courses;
}

export async function createCourse(values: TCourse) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = courseSchema.safeParse(values);

    if (!validatedFields.success) {
      throw new Error(validatedFields.error.message);
    }

    const { facultyId, status } = validatedFields.data;

    // Verify faculty exists and get institution info
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        school: {
          include: {
            institution: true,
          },
        },
      },
    });

    if (!faculty) {
      throw new Error("Faculty not found");
    }

    if (user.role === "PROFESSOR") {
      // Verify professor belongs to the faculty
      const professorMember = await prisma.member.findFirst({
        where: {
          userId: user.id,
          facultyId: facultyId,
          role: "member",
        },
      });

      if (!professorMember) {
        throw new Error(
          "You must be a professor in the selected faculty to create courses",
        );
      }

      // Professors create courses as DRAFT first.
      const course = await prisma.course.create({
        data: {
          ...validatedFields.data,
          status: validatedFields.data.status as CourseStatus,
          difficulty: validatedFields.data.difficulty || undefined,
          facultyId,
          instructorId: user.id,
        },
        include: getCourseDataInclude(user.id),
      });

      await auditCourseAction(
        "CREATE",
        course.id,
        {},
        { status: validatedFields.data.status },
        "Course created",
      );

      // If the intention is to submit for approval immediately
      if (status === CourseStatus.UNDER_REVIEW) {
        const submissionResult = await submitCourseForApproval(course.id);
        if (!submissionResult.success) {
          // Even if submission fails, the course is already created as a draft.
          // We pass a specific message to the client.
          return {
            success: true,
            data: course,
            message: `Course created as a draft, but failed to submit for approval: ${submissionResult.error}`,
          };
        }
        revalidatePath("/courses/my-courses");
        return {
          success: true,
          data: course,
          message: "Course created and submitted for approval!",
        };
      }

      revalidatePath("/courses/my-courses");
      return { success: true, data: course, message: "Course saved as a draft." };
    } else if (user.role === "INSTITUTION") {
      const institutionId = faculty.school.institutionId;

      if (!institutionId) {
        throw new Error("The school is not associated with an organization.");
      }
      // Verify institution admin owns the organization
      const isInstitutionAdmin = await prisma.member.findFirst({
        where: {
          userId: user.id,
          role: { in: ["admin", "owner"] },
        },
      });

      if (!isInstitutionAdmin) {
        throw new Error(
          "You must be an administrator of this institution to create courses",
        );
      }

      // Institution admins can create published courses directly
      const course = await prisma.course.create({
        data: {
          ...validatedFields.data,
          instructorId: user.id,
          status: CourseStatus.PUBLISHED,
        },
        include: getCourseDataInclude(user.id),
      });

      await auditCourseAction(
        "CREATE",
        course.id,
        {},
        { status: CourseStatus.PUBLISHED },
        "Course created and published by institution admin",
      );

      revalidatePath("/courses");
      return { success: true, data: course, message: "Course created and published." };
    } else {
      throw new Error(
        "Only professors and institution administrators can create courses",
      );
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getInstructorCourses() {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { instructorId: user.id },
      ]
    },
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
      approvals: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return courses;
}

export async function reviewCourse(courseId: string, decision: CourseStatus, comments?: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Only institution admins can review courses
    if (user.role !== "INSTITUTION") {
      throw new Error("Only institution administrators can review courses");
    }

    // Get course with approval info
    const course = await prisma.course.findFirst({
      where: { id: courseId },
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
        approvals: {
          where: { status: CourseStatus.NEEDS_REVISION },
          take: 1,
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const institutionId = course.faculty.school.institutionId;

    if (!institutionId) {
      throw new Error("The course's school is not associated with an organization.");
    }

    // Verify reviewer is from the same institution
    const isInstitutionAdmin = await prisma.member.findFirst({
      where: {
        userId: institutionId,
        role: { in: ["ORGANIZATION_ADMIN", "SUPER_ADMIN", "admin", "owner"] },
      },
    });

    if (!isInstitutionAdmin) {
      throw new Error("You must be an administrator of this institution to review courses");
    }

    if (course.status !== CourseStatus.UNDER_REVIEW) {
      throw new Error("Only courses under review can be processed");
    }

    if (course.approvals.length === 0) {
      throw new Error("No pending approval found for this course");
    }

    // Determine new course status based on decision
    let newStatus: CourseStatus;
    switch (decision) {
      case CourseStatus.PUBLISHED:
        newStatus = CourseStatus.PUBLISHED;
        break;
      case CourseStatus.REJECTED:
        newStatus = CourseStatus.REJECTED;
        break;
      case CourseStatus.NEEDS_REVISION:
        newStatus = CourseStatus.NEEDS_REVISION;
        break;
      default:
        throw new Error("Invalid approval decision");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update course status
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: newStatus,
        },
      });

      // Update approval record
      const updatedApproval = await tx.courseApproval.update({
        where: { id: course.approvals[0].id },
        data: {
          status: decision,
          reviewedAt: new Date(),
          comments,
        },
      });

      // Notify course instructor
      await tx.notification.create({
        data: {
          recipientId: course.instructorId,
          issuerId: user.id,
          type: "COURSE_APPROVAL_RESULT",
          title: "Course Review Complete",
          message: `Your course "${course.title}" has been ${decision.toLowerCase()}${comments ? ": " + comments : ""}`,
          courseId,
        },
      });

      return { course: updatedCourse, approval: updatedApproval };
    });

    // Create audit log
    await auditCourseAction(
      decision === CourseStatus.PUBLISHED ? "APPROVE" :
        decision === CourseStatus.REJECTED ? "REJECT" : "REQUEST_REVISION",
      courseId,
      { status: CourseStatus.UNDER_REVIEW },
      { status: newStatus },
      `Course ${decision.toLowerCase()}${comments ? ": " + comments : ""}`,
    );

    revalidatePath("/courses");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error reviewing course:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCourse(values: TCourse, courseId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = courseSchema.safeParse(values);

    if (!validatedFields.success) {
      throw new Error(validatedFields.error.message);
    }

    // Verify user owns the course
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id,
      },
    });

    if (!existingCourse) {
      throw new Error("Course not found or you don't have permission to edit it");
    }

    // For professors, ensure they can't change the status to published or approved directly
    const updateData = {
      ...validatedFields.data,
      status: user.role === "PROFESSOR" &&
        (existingCourse.status === CourseStatus.PUBLISHED)
        ? existingCourse.status : existingCourse.status,
    };

    const course = await prisma.course.update({
      where: {
        id: courseId
      },
      data: updateData,
    });

    revalidatePath("/courses");

    return { success: true, data: course };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}