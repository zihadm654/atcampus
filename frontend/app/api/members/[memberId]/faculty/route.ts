import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { facultyId } = await req.json();

    // Get the member we're assigning faculty to
    const memberToUpdate = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        organization: true,
      },
    });

    if (!memberToUpdate) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if the current user has permission to assign faculty
    // Only organization admins or owners can assign faculty to members
    const currentUserMembership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: memberToUpdate.organizationId,
        role: {
          in: ["admin", "owner"],
        },
      },
    });

    if (!currentUserMembership) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update the member with the faculty assignment
    const updatedMember = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        facultyId: facultyId || null,
      },
      include: {
        user: true,
        faculty: true,
        organization: true,
      },
    });

    return Response.json(updatedMember);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
