import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return Response.json(following);
  } catch (error) {
    console.error("Error fetching following users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
