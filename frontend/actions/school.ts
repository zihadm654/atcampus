"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { addSchoolSchema } from "@/app/(profile)/[username]/_components/tabs/AddSchoolDialog";

const schoolSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "slug must be at least 3 characters long"),
});
export async function getSchools() {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }
  const schools = await prisma.school.findMany({
    where: {
      institutionId: user.id
    }
  })
  return schools
}
export async function addSchool(values: z.infer<typeof addSchoolSchema>) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  const validatedFields = schoolSchema.safeParse({
    name: values.name,
    slug: values.slug,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  try {
    await prisma.school.create({
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        institutionId: user.id,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create school",
    };
  }

  revalidatePath(`/(profile)/[username]`);
}

export async function editSchool(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  const validatedFields = schoolSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const schoolId = formData.get("schoolId") as string;

  try {
    await prisma.school.update({
      where: {
        id: schoolId,
        institutionId: user.id,
      },
      data: {
        name: validatedFields.data.name,
      },
    });
  } catch (error) {
    return {
      error: "Failed to update school",
    };
  }

  revalidatePath(`/(profile)/[username]`);
}

export async function deleteSchool(schoolId: string) {
  const user = await getCurrentUser();

  if (!user || user.role !== "INSTITUTION") {
    return {
      error: "Not authorized",
    };
  }

  try {
    // Verify that the school belongs to this institution
    const school = await prisma.school.findUnique({
      where: {
        id: schoolId,
        institutionId: user.id,
      },
    });

    if (!school) {
      return {
        error: "School not found or unauthorized",
      };
    }

    await prisma.school.delete({
      where: {
        id: schoolId,
        institutionId: user.id,
      },
    });
  } catch (error) {
    return {
      error: "Failed to delete school",
    };
  }

  revalidatePath(`/(profile)/[username]`);
}