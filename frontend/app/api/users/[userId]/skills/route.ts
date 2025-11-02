import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Fetch user skills with endorsements count, excluding deleted skills
    const userSkills = await prisma.userSkill.findMany({
      where: {
        userId,
        isDeleted: false, // Only fetch non-deleted skills
      },
      include: {
        skill: true,
        _count: {
          select: {
            endorsements: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(userSkills);
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
