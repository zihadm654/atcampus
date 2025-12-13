import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users that the current user is already following
    const following = await prisma.follow.findMany({
      where: {
        followerId: loggedInUser.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get users who have sent follow requests to the current user
    const receivedRequests = await prisma.followRequest.findMany({
      where: {
        targetId: loggedInUser.id,
        status: "PENDING",
      },
      select: {
        requesterId: true,
      },
    });

    const receivedRequestIds = receivedRequests.map((r) => r.requesterId);

    // Get users who the current user has sent follow requests to
    const sentRequests = await prisma.followRequest.findMany({
      where: {
        requesterId: loggedInUser.id,
        status: "PENDING",
      },
      select: {
        targetId: true,
      },
    });

    const sentRequestIds = sentRequests.map((r) => r.targetId);

    // Find users to suggest based on:
    // 1. Mutual connections (people who follow people you follow)
    // 2. Similar interests/skills
    // 3. Institution/organization
    // 4. Location

    const suggestions = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: loggedInUser.id } }, // Not the current user
          { id: { notIn: followingIds } }, // Not already following
          { id: { notIn: receivedRequestIds } }, // No pending requests from them
          { id: { notIn: sentRequestIds } }, // No pending requests to them
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        instituteId: true,
        institution: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 10,
      orderBy: [
        { followers: { _count: "desc" } }, // Popular users first
        { createdAt: "desc" }, // Newer users
      ],
    });

    return Response.json({ suggestions });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
