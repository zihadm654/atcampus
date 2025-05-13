"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(desc: string, img: string) {
  try {
    const session = await auth();

    if (!session?.user.id) return;

    const post = await prisma.post.create({
      data: {
        desc,
        img,
        userId:session.user.id
      }
    });

    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            email:true,
            name: true,
            image: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email:true,
                image: true,
                name: true
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
      }
    });

    return posts;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}
export async function getPostsByIds(ids: string[]) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

// export async function toggleLike(postId: string) {
//   try {
//     const session = await auth();
//     if (!session?.user.id) return;

//     // check if like exists
//     const existingLike = await prisma.like.findUnique({
//       where: {
//         userId_postId: {
//           userId: session.user.id,
//           postId
//         }
//       }
//     });

//     const post = await prisma.post.findUnique({
//       where: { id: postId },
//       select: { userId: true }
//     });

//     if (!post) throw new Error("Post not found");

//     if (existingLike) {
//       // unlike
//       await prisma.like.delete({
//         where: {
//           userId_postId: {
//             userId:session.user?.id,
//             postId
//           }
//         }
//       });
//     } else {
//       // like and create notification (only if liking someone else's post)
//       await prisma.$transaction([
//         prisma.like.create({
//           data: {
//             userId:session.user.id,
//             postId
//           }
//         }),
//         ...(post.userId !== session.user.id
//           ? [
//               prisma.notification.create({
//                 data: {
//                   type: "LIKE",
//                   userId: post.userId, // recipient (post author)
//                   creatorId: session.user.id, // person who liked
//                   postId
//                 }
//               })
//             ]
//           : [])
//       ]);
//     }

//     revalidatePath("/");
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to toggle like:", error);
//     return { success: false, error: "Failed to toggle like" };
//   }
// }

export async function createComment(postId: string, desc: string) {
  try {
    const session = await auth();
    if (!session?.user.id) return;
    if (!desc) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          desc,
          userId: session.user?.id!,
          postId
        }
      });

      // Create notification if commenting on someone else's post
      if (post.userId !== session.user.id) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.userId,
            creatorId: session.user?.id!,
            postId,
            commentId: newComment.id
          }
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user.id) return;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) throw new Error("Post not found");
    if (post.userId !== session.user.id) throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: { id: postId }
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
