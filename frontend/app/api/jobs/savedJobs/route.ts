import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getJobDataInclude, type JobsPage } from "@/types/types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveJobs = await prisma.savedJob.findMany({
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

    const data: JobsPage = {
      jobs: saveJobs.slice(0, pageSize).map((bookmark) => bookmark.job),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
