import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        skills: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Transform the skills array into the expected format
    const skillsData = course.skills.map((skill, index) => ({
      id: `skill-${index}`,
      name: skill,
    }));

    return NextResponse.json(skillsData);
  } catch (error) {
    console.error("Error fetching course skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
