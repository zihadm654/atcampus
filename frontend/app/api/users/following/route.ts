import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users that the current user is following
    const following = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: loggedInUser.id,
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({ users: following });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}