"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
// import streamServerClient from "@/lib/stream";

export async function deleteUserAction({ userId }: { userId: string }) {
  const headersList = await headers();
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  try {
    await Promise.all([
      prisma.user.delete({
        where: {
          id: userId,
        },
      }),
      // streamServerClient.deleteUser({
      // id: userId,
      // }),
    ]);
    if (session.id === userId) {
      await auth.api.signOut({ headers: headersList });
      redirect("/login");
    }

    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}
