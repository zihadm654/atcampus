"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema,
} from "@/lib/validations/validation";
import { getUserDataSelect } from "@/types/types";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updateUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });
    // await streamServerClient.partialUpdateUser({
    //   id: user.id,
    //   set: {
    //     name: validatedValues.name,
    //   },
    // });
    return updateUser;
  });

  return updatedUser;
}
