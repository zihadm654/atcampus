"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// export async function syncUser() {
//   try {
//     const session = await getCurrentUser();
//     const user = session;

//     if (!user?.id || !user) return;

//     const existingUser = await prisma.user.findUnique({
//       where: {
//         id: user.id,
//       },
//     });

//     if (existingUser) return existingUser;

//     const dbUser = await prisma.user.create({
//       data: {
//         id: user.id,
//         username: user.name!,
//         name: `${user.name}`,
//         email: user.email,
//         image: user.image,
//       },
//     });

//     return dbUser;
//   } catch (error) {
//     console.log("Error in syncUser", error);
//   }
// }

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const session = await getCurrentUser();
  if (!session?.id) return null;

  const user = await getUserById(session.id);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follower.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follower.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        // prisma.notification.create({
        //   data: {
        //     type: "FOLLOW",
        //     userId: targetUserId, // user being followed
        //     creatorId: userId, // user following
        //   },
        // }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}
