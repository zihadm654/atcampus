"use server"
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const getFollowing = async (id?: string) => {
    const session = await auth();
    if (!session?.user) {
        throw new Error("User is not Authenticated!!");
    }
    try {
         const following = await prisma.follower.findMany({
      where: {
        followerId: session.user?.id,
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
}