import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there's a schoolId query parameter
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    let faculties;

    if (user.role === "PROFESSOR") {
      // For professors, fetch faculties based on their institution
      // If schoolId is provided, filter by that school
      const query: any = {
        orderBy: { name: "asc" },
        include: {
          school: {
            select: {
              name: true,
              institution: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      };

      if (schoolId) {
        // If schoolId is provided, filter faculties by that school
        query.where = {
          schoolId,
          school: {
            institution: {
              members: {
                some: {
                  userId: user.id,
                  role: "member",
                },
              },
            },
          },
        };
      } else {
        // Otherwise, fetch all faculties from the professor's institution
        query.where = {
          school: {
            institution: {
              members: {
                some: {
                  userId: user.id,
                  role: "member",
                },
              },
            },
          },
        };
      }

      faculties = await prisma.faculty.findMany(query);
    } else if (user.role === "INSTITUTION") {
      // For institutions, fetch faculties based on their schools
      // If schoolId is provided, filter by that school
      const query: any = {
        orderBy: { name: "asc" },
        include: {
          school: {
            select: {
              name: true,
              institution: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      };

      if (schoolId) {
        // If schoolId is provided, filter faculties by that school
        // and ensure the school belongs to this institution
        query.where = {
          schoolId,
          school: {
            institutionId: user.id,
          },
        };
      } else {
        // Otherwise, fetch all faculties from schools belonging to this institution
        query.where = {
          school: {
            institutionId: user.id,
          },
        };
      }

      faculties = await prisma.faculty.findMany(query);
    } else {
      // For other roles (admins, etc.), fetch all faculties
      // If schoolId is provided, filter by that school
      const query: any = {
        orderBy: { name: "asc" },
        include: {
          school: {
            select: {
              name: true,
              institution: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      };

      if (schoolId) {
        query.where = {
          schoolId,
        };
      }

      faculties = await prisma.faculty.findMany(query);
    }

    return Response.json(faculties);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
