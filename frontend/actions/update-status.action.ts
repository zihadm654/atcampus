"use server";

import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const updateStatusAction = async (
  userId: string,
  status: UserStatus,
) => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: status },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    return { error: "Failed to update user status" };
  }
};
