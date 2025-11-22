import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Reject a follow request
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

    // Ensure user is rejecting a request sent to them
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

    // Update follow request status
    const updatedRequest = await prisma.followRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        respondedAt: new Date(),
      },
    });

    return Response.json({ 
      message: "Follow request rejected",
      followRequest: updatedRequest
    });
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}