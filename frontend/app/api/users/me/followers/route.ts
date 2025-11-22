import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const loggedInUser = await getCurrentUser();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followers = await prisma.user.findMany({
      where: {
        following: {
          some: {
            followingId: loggedInUser.id,
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

    return Response.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}