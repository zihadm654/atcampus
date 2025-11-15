import { CourseStatus, type Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCourseDataInclude, type CoursesPage } from "@/types/types";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || undefined;
    const courseStatusParam = req.nextUrl.searchParams.get("status") || undefined;

    // Parse job types if provided
    let courseStatus: CourseStatus[] | undefined;
    if (courseStatusParam) {
      const types = courseStatusParam.split(",");
      // Filter to only valid JobType values
      courseStatus = types.filter((type) =>
        Object.values(CourseStatus).includes(type as CourseStatus)
      ) as CourseStatus[];
    }

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build the where clause for filtering
    const whereClause: Prisma.CourseWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
      ...(courseStatus &&
        courseStatus.length > 0 && {
        status: {
          in: courseStatus,
        },
      }),
      instructorId: user.id,
    };

    const courses = await prisma.course.findMany({
      include: getCourseDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: whereClause,
    });

    const nextCursor = courses.length > pageSize ? courses[pageSize].id : null;

    const data: CoursesPage = {
      courses: courses.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
