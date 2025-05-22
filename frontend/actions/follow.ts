"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const getFollowing = async (id?: string) => {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("User is not Authenticated!!");
  }
  try {
    const following = await prisma.follower.findMany({
      where: {
        followerId: session.id,
      },
      select: {
        followingId: true,
      },
    });
    return following;
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong!");
  }
};
