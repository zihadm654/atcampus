import { NextRequest } from "next/server";

import { getCourseDataInclude, CoursesPage } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CourseStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = req.nextUrl.searchParams.get("q") || undefined;

    const pageSize = 10;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const whereClause: Prisma.CourseWhereInput = {
      ...(searchQuery && {
        title: {
          contains: searchQuery,
          mode: "insensitive",
        },
      }),
      status: CourseStatus.PUBLISHED
    };
    const courses = await prisma.course.findMany({
      include: getCourseDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: whereClause
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
