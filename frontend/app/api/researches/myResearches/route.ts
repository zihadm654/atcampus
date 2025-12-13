import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getResearchDataInclude, type MyResearchesPage } from "@/types/types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || undefined;

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch owned research projects
    const ownedWhereClause: Prisma.ResearchWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
      userId: user.id,
    };

    const ownedResearches = await prisma.research.findMany({
      where: ownedWhereClause,
      include: getResearchDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const ownedNextCursor =
      ownedResearches.length > pageSize ? ownedResearches[pageSize].id : null;

    // Fetch collaborative research projects
    const collaborativeWhereClause: Prisma.ResearchWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
      collaboratorIds: { has: user.id },
    };

    const collaborativeResearches = await prisma.research.findMany({
      where: collaborativeWhereClause,
      include: getResearchDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const collaborativeNextCursor =
      collaborativeResearches.length > pageSize
        ? collaborativeResearches[pageSize].id
        : null;

    // Return both sets of research projects
    const data: MyResearchesPage = {
      ownedResearches: {
        researches: ownedResearches.slice(0, pageSize),
        nextCursor: ownedNextCursor,
      },
      collaborativeResearches: {
        researches: collaborativeResearches.slice(0, pageSize),
        nextCursor: collaborativeNextCursor,
      },
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
