import { prisma } from "@/lib/prisma";
import { notifyFollowRequestAccepted } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending follow requests for the user
    const followRequests = await prisma.followRequest.findMany({
      where: {
        targetId: userId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            website: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            website: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ followRequests });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { action, message } = await req.json();
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the follow request
    const followRequest = await prisma.followRequest.findUnique({
      where: {
        requesterId_targetId: {
          requesterId: userId,
          targetId: loggedInUser.id,
        },
      },
    });

    if (!followRequest) {
      return Response.json(
        { error: "Follow request not found" },
        { status: 404 },
      );
    }

    if (followRequest.status !== "PENDING") {
      return Response.json(
        { error: "Follow request is not pending" },
        { status: 400 },
      );
    }

    switch (action) {
      case "accept":
        // Update follow request status
        await prisma.followRequest.update({
          where: {
            id: followRequest.id,
          },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
          },
        });

        // Create follow relationship
        await prisma.follow.create({
          data: {
            followerId: userId,
            followingId: loggedInUser.id,
          },
        });

        // Create notification for the requester
        await notifyFollowRequestAccepted(loggedInUser.id, userId);

        return Response.json({
          message: "Follow request accepted successfully",
        });

      case "reject":
        await prisma.followRequest.update({
          where: {
            id: followRequest.id,
          },
          data: {
            status: "REJECTED",
            respondedAt: new Date(),
          },
        });

        return Response.json({
          message: "Follow request rejected successfully",
        });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find and cancel the follow request (only if it's pending and sent by the current user)
    const followRequest = await prisma.followRequest.findUnique({
      where: {
        requesterId_targetId: {
          requesterId: loggedInUser.id,
          targetId: userId,
        },
      },
    });

    if (!followRequest) {
      return Response.json(
        { error: "Follow request not found" },
        { status: 404 },
      );
    }

    if (followRequest.status !== "PENDING") {
      return Response.json(
        { error: "Cannot cancel non-pending follow request" },
        { status: 400 },
      );
    }

    await prisma.followRequest.update({
      where: {
        id: followRequest.id,
      },
      data: {
        status: "CANCELLED",
        respondedAt: new Date(),
      },
    });

    // Delete the notification that was sent to the target user
    await prisma.notification.deleteMany({
      where: {
        recipientId: userId,
        issuerId: loggedInUser.id,
        type: "FOLLOW_REQUEST",
      },
    });

    return Response.json({ message: "Follow request cancelled successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
