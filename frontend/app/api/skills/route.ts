import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST to get specific skills by IDs
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!(ids && Array.isArray(ids))) {
      return new NextResponse("Invalid request: ids array required", {
        status: 400,
      });
    }

    const skills = await prisma.skill.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
