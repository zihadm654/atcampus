import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: {
        userId,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(userSkills);
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
