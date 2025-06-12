import { NextRequest } from "next/server";

import { getResearchDataInclude, SaveResearchsPage } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveResearchs = await prisma.saveResearch.findMany({
      where: {
        userId: user.id,
      },
      include: {
        research: {
          include: getResearchDataInclude(user.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      saveResearchs.length > pageSize ? saveResearchs[pageSize].id : null;

    const data: SaveResearchsPage = {
      researchs: saveResearchs
        .slice(0, pageSize)
        .map((bookmark) => bookmark.research),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
