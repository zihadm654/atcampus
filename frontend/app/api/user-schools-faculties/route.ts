import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let institutionId: string;

    if (user.role === "PROFESSOR") {
      // For professors, get the organization they belong to via Member relationship
      const member = await prisma.member.findFirst({
        where: {
          userId: user.id,
          role: "member",
        },
        include: {
          organization: true,
        },
      });

      if (!member?.organizationId) {
        return NextResponse.json(
          { error: "Professor is not assigned to any organization" },
          { status: 404 }
        );
      }

      // Get the owner of the organization - this will be the institution user
      const organizationOwner = await prisma.member.findFirst({
        where: {
          organizationId: member.organizationId,
          role: "owner",
        },
      });

      if (!organizationOwner?.userId) {
        return NextResponse.json(
          { error: "Organization has no owner" },
          { status: 404 }
        );
      }

      institutionId = organizationOwner.userId;
    } else if (user.role === "INSTITUTION") {
      // For institutions, use their userId directly
      institutionId = user.id;
    } else {
      return NextResponse.json(
        { error: "User role not supported" },
        { status: 403 }
      );
    }

    // Fetch schools with their faculties
    const schools = await prisma.school.findMany({
      where: {
        institutionId,
        isActive: true,
      },
      include: {
        faculties: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            description: true,
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching user schools and faculties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
