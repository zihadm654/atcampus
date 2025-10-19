"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const facultySchema = z.object({
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
  schoolId: z.string(),
});

const editFacultySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
});

export async function addFaculty(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  const validatedFields = facultySchema.safeParse({
    name: formData.get("name"),
    schoolId: formData.get("schoolId"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const slug = validatedFields.data.name.toLowerCase().replace(/\s/g, "-");

  try {
    await prisma.faculty.create({
      data: {
        name: validatedFields.data.name,
        slug,
        schoolId: validatedFields.data.schoolId,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create faculty",
    };
  }

  revalidatePath("/(profile)/[username]");
}

export async function editFaculty(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  const validatedFields = editFacultySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  try {
    await prisma.faculty.update({
      where: {
        id: validatedFields.data.id,
      },
      data: {
        name: validatedFields.data.name,
      },
    });
  } catch (error) {
    return {
      error: "Failed to update faculty",
    };
  }

  revalidatePath("/(profile)/[username]");
}

export async function deleteFaculty(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  const id = formData.get("id") as string;

  if (!id) {
    return {
      error: "ID is required",
    };
  }

  try {
    // First, verify that the faculty belongs to a school owned by this institution
    const faculty = await prisma.faculty.findUnique({
      where: {
        id,
      },
      include: {
        school: true,
      },
    });

    if (!faculty || faculty.school.institutionId !== user.id) {
      return {
        error: "Faculty not found or unauthorized",
      };
    }

    await prisma.faculty.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    return {
      error: "Failed to delete faculty",
    };
  }

  revalidatePath("/(profile)/[username]");
}
