import { JobType, type Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getJobDataInclude, type JobsPage } from "@/types/types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || undefined;
    const jobTypesParam = req.nextUrl.searchParams.get("type") || undefined;

    // Parse job types if provided
    let jobTypes: JobType[] | undefined;
    if (jobTypesParam) {
      const types = jobTypesParam.split(",");
      // Filter to only valid JobType values
      jobTypes = types.filter((type) =>
        Object.values(JobType).includes(type as JobType)
      ) as JobType[];
    }

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build the where clause for filtering
    const whereClause: Prisma.JobWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
      ...(jobTypes &&
        jobTypes.length > 0 && {
          type: {
            in: jobTypes,
          },
        }),
    };

    const jobs = await prisma.job.findMany({
      include: getJobDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: whereClause,
    });

    const nextCursor = jobs.length > pageSize ? jobs[pageSize].id : null;

    const data: JobsPage = {
      jobs: jobs.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
