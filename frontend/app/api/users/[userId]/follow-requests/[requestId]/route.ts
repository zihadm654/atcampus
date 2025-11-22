import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Cancel a follow request (sent by current user)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string; requestId: string }> }
) {
  try {
    const { userId, requestId } = await params;
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user is canceling their own follow request
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

    // Verify the request was sent by the current user
    if (followRequest.requesterId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if request is already processed
    if (followRequest.status !== "PENDING") {
      return Response.json({ 
        error: `Cannot cancel ${followRequest.status.toLowerCase()} follow request` 
      }, { status: 400 });
    }

    // Update follow request status to cancelled
    const updatedRequest = await prisma.followRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        respondedAt: new Date(),
      },
    });

    // Delete the notification that was sent to the target user
    await prisma.notification.deleteMany({
      where: {
        recipientId: followRequest.targetId,
        issuerId: userId,
        type: "FOLLOW_REQUEST",
      },
    });

    return Response.json({ 
      message: "Follow request cancelled",
      followRequest: updatedRequest
    });
  } catch (error) {
    console.error("Error cancelling follow request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}