import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Accept a follow request
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string; requestId: string }> }
) {
  try {
    const { userId, requestId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user is accepting a request sent to them
    if (loggedInUser.id !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the follow request
    const followRequest = await prisma.followRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        target: true,
      },
    });

    if (!followRequest) {
      return Response.json({ error: "Follow request not found" }, { status: 404 });
    }

    // Verify the request belongs to the current user
    if (followRequest.targetId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if request is already processed
    if (followRequest.status !== "PENDING") {
      return Response.json({
        error: `Follow request already ${followRequest.status.toLowerCase()}`
      }, { status: 400 });
    }

    // Start a transaction to update request and create follow relationship
    const result = await prisma.$transaction(async (tx) => {
      // Update follow request status
      const updatedRequest = await tx.followRequest.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      });

      // Create follow relationship
      const follow = await tx.follow.create({
        data: {
          followerId: followRequest.requesterId,
          followingId: followRequest.targetId,
        },
      });

      // Create notification for the requester
      await tx.notification.create({
        data: {
          recipientId: followRequest.requesterId,
          issuerId: userId,
          type: "FOLLOW_REQUEST_ACCEPTED",
          title: "Follow Request Accepted",
          message: `${loggedInUser.name || loggedInUser.username} accepted your follow request`,
        },
      });

      return { updatedRequest, follow };
    });

    return Response.json({
      message: "Follow request accepted",
      followRequest: result.updatedRequest,
      follow: result.follow
    });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}