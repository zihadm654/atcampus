import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { getUserDataSelect } from "@/types/types";
import { cache } from "react";

const getUser = cache(async (loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: loggedInUserId
    },
    select: {
      ...getUserDataSelect(loggedInUserId),
      members: true
    },
  });

  if (!user) notFound();
  return user;
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getUser(user.id);

    // Extract organizationId from query parameters
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");

    let institutionId: string | null = null;

    if (organizationId) {
      // If organizationId is provided, use it to find the institution
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      });

      if (organization) {
        institutionId = organization.id;
      }
    } else {
      // Find the institution ID based on user's membership
      if (currentUser.role === "INSTITUTION") {
        // Institution users: use their own ID
        institutionId = currentUser.id;
      } else if (currentUser.role === "PROFESSOR" && currentUser.members?.length > 0) {
        // Professor: use organizationId from their membership (which is the institution)
        const member = currentUser.members[0]; // Assuming first membership
        institutionId = member.organizationId;
      }
    }

    if (!institutionId) {
      return Response.json({ error: "No institution found" }, { status: 404 });
    }

    const faculties = await prisma.faculty.findMany({
      where: {
        school: {
          institutionId: institutionId
        }
      },
      orderBy: { name: "asc" }
    });

    return Response.json(faculties);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}