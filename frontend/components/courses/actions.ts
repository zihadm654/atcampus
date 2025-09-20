"use server";

import { revalidatePath } from "next/cache";

import { getCourseDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { courseSchema, TCourse } from "@/lib/validations/course";
import { CourseStatus } from "@prisma/client";

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

    // Verify user is a professor in the selected faculty
    const professorMember = await prisma.member.findFirst({
      where: {
        userId: user.id,
        facultyId: validatedFields.data.facultyId,
        role: "PROFESSOR",
      },
    });

    if (!professorMember) {
      throw new Error("You must be a professor in the selected faculty to create courses");
    }

    // For professors, ensure the course is created with DRAFT status by default
    const courseData = {
      instructorId: user.id,
      ...validatedFields.data,
      status: user.role === "PROFESSOR" ? CourseStatus.DRAFT : validatedFields.data.status,
    };

    const course = await prisma.course.create({
      data: courseData,
    });

    revalidatePath("/courses");

    return { success: true, data: course };
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

export async function submitCourseForApproval(courseId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify course exists and user has permission
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id,
        status: "DRAFT",
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
      throw new Error("Course not found or you don't have permission to submit it");
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
      throw new Error("Course is already under review");
    }
    // Find a faculty admin to assign the review to
    const facultyAdmin = await prisma.member.findFirst({
      where: {
        organizationId: course.faculty.school.institutionId,
        facultyId: course.facultyId,
        role: "FACULTY_ADMIN",
      },
    });

    if (!facultyAdmin) {
      throw new Error("No faculty administrator available to review this course");
    }

    await prisma.$transaction(async (tx) => {
      // Update course status
      await tx.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.UNDER_REVIEW,
          submittedForApproval: new Date(),
          currentApprovalLevel: 1,
        },
      });

      // Create first level approval request
      await tx.courseApproval.create({
        data: {
          courseId,
          reviewerId: facultyAdmin.userId,
          level: 1,
          isActive: true,
          status: "PENDING",
        },
      });

      // Notify the faculty admin
      await tx.notification.create({
        data: {
          recipientId: facultyAdmin.userId,
          issuerId: user.id,
          type: "COURSE_APPROVAL_REQUEST",
          title: "New Course Approval Request",
          message: `${user.name} has submitted "${course.title}" for approval`,
          courseId,
        },
      });
    });

    revalidatePath("/courses");

    return { success: true, message: "Course submitted for approval successfully" };
  } catch (error) {
    console.error(error);
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
        (validatedFields.data.status === CourseStatus.PUBLISHED ||
          validatedFields.data.status === CourseStatus.APPROVED)
        ? existingCourse.status : validatedFields.data.status,
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