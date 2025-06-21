import { LikeInfo } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const research = await prisma.research.findUnique({
      where: { id: researchId },
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

    if (!research) {
      return Response.json({ error: "Research not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: research._count.likes,
      isLikedByUser: !!research.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const research = await prisma.research.findUnique({
      where: { id: researchId },
      select: {
        userId: true,
      },
    });

    if (!research) {
      return Response.json({ error: "Research not found" }, { status: 404 });
    }

    // Check if the user already liked this research
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: loggedInUser.id,
        researchId,
      },
    });

    if (existingLike) {
      return Response.json({ message: "Already liked" }, { status: 200 });
    }

    await prisma.$transaction([
      prisma.like.create({
        data: {
          userId: loggedInUser.id,
          researchId,
        },
      }),
      ...(loggedInUser.id !== research.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: research.userId,
                researchId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return Response.json({ message: "Liked successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> },
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const research = await prisma.research.findUnique({
      where: { id: researchId },
      select: {
        userId: true,
      },
    });

    if (!research) {
      return Response.json({ error: "Research not found" }, { status: 404 });
    }

    // Find the like to delete
    const like = await prisma.like.findFirst({
      where: {
        userId: loggedInUser.id,
        researchId,
      },
    });

    if (!like) {
      return Response.json({ message: "Like not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.like.delete({
        where: {
          id: like.id,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: research.userId,
          researchId,
          type: "LIKE",
        },
      }),
    ]);

    return Response.json({ message: "Unliked successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
