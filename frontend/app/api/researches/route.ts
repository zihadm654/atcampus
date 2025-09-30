import { NextRequest } from "next/server";

import { getResearchDataInclude, ResearchesPage } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || undefined;

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const whereClause: Prisma.ResearchWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
    };
    const researches = await prisma.research.findMany({
      where: whereClause,
      include: getResearchDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      researches.length > pageSize ? researches[pageSize].id : null;

    const data: ResearchesPage = {
      researches: researches.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
