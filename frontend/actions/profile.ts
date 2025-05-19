"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProfileById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id:id },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            followings: true,
            posts: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email:true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return likedPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(formData: FormData) {
  try {
   const session = await auth();
   if (!session?.user.id) return;

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { id:session.user.id },
      data: {
        name,
        bio,
        website
      }
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function isFollowing(userId: string) {
  try {
   const session = await auth();
   if (!session?.user.id) return;

    const follow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
