import { NextRequest } from "next/server";

import { getJobDataInclude, SaveJobsPage } from "@/types/types";
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

    const saveJobs = await prisma.saveJob.findMany({
      where: {
        userId: user.id,
      },
      include: {
        job: {
          include: getJobDataInclude(user.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      saveJobs.length > pageSize ? saveJobs[pageSize].id : null;

    const data: SaveJobsPage = {
      jobs: saveJobs.slice(0, pageSize).map((bookmark) => bookmark.job),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
