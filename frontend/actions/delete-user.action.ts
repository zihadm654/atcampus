"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function deleteUserAction({ userId }: { userId: string }) {
  const headersList = await headers();
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  if (session.role !== "INSTITUTION" || session.id === userId) {
    throw new Error("Forbidden");
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
        role: "INSTITUTION",
      },
    });

    if (session.id === userId) {
      await auth.api.signOut({ headers: headersList });
      redirect("/sign-in");
    }

    revalidatePath("/dashboard/admin");
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}
