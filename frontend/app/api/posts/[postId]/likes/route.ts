import { prisma } from "@/lib/db";
import { notifyLike } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user already liked this post
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    if (existingLike) {
      return Response.json({ message: "Already liked" }, { status: 200 });
    }

    await prisma.like.create({
      data: {
        userId: loggedInUser.id,
        postId,
      },
    });

    // Notify the post owner about the like (if it's not their own post)
    if (loggedInUser.id !== post.userId) {
      await notifyLike(postId, loggedInUser.id, post.userId);
    }

    return Response.json({ message: "Liked successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Find the like to delete
    const like = await prisma.like.findFirst({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    if (!like) {
      return Response.json({ message: "Like not found" }, { status: 404 });
    }

    await prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    return Response.json({ message: "Unliked successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
