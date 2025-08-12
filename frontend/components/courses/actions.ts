"use server";

import { revalidatePath } from "next/cache";

import { getCourseDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { courseSchema, TCourse } from "@/lib/validations/course";

export async function deleteCourse(id: string) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) throw new Error("Job not found");

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

    const course = await prisma.course.create({
      data: {
        instructorId: user.id,
        ...validatedFields.data,
      },
    });

    revalidatePath("/courses");

    return { success: true, data: course };
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

    const course = await prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        instructorId: user.id,
        ...validatedFields.data,
      },
    });

    revalidatePath("/courses");

    return { success: true, data: course };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
