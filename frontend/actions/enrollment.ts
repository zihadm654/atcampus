"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const enrollCourse = async (courseId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: user.id,
        },
      },
    });
    if (existingEnrollment) {
      return { success: false, message: "You are already enrolled in this course." };
    }

    // Fetch course to get the instructor's userId
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (!course) {
      return { success: false, message: "Course not found." };
    }
    if (course.instructorId === user.id) {
      return { success: false, message: "You cannot enroll in your own course." };
    }

    // Use a transaction to create enrollment and notification atomically
    await prisma.$transaction(async (tx) => {
      await tx.enrollment.create({
        data: {
          courseId,
          studentId: user.id,
          status: "enrolled",
        },
      });
      await tx.notification.create({
        data: {
          issuerId: user.id,
          recipientId: course.instructorId,
          type: "ENROLLMENT", // Custom type for course enrollments
          // Optionally add more fields (courseId, message, etc.)
        },
      });
    });

    revalidatePath("/courses");
    return {
      success: true,
      message: "Successfully enrolled in the course.",
    };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw new Error("Failed to enroll in course.");
  }
};

export const updateEnrollmentStatus = async (
  enrollmentId: string,
  newStatus: "enrolled" | "completed" | "dropped",
) => {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROFESSOR") throw new Error("Unauthorized");

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment || enrollment.course.instructorId !== user.id)
    throw new Error("Unauthorized or enrollment not found");

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: newStatus },
  });

  revalidatePath("/courses");
  return { success: true, message: "Enrollment status updated successfully." };
};
