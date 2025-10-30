import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    const courseSkills = await prisma.courseSkill.findMany({
      where: {
        courseId,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(courseSkills);
  } catch (error) {
    console.error("Error fetching course skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
