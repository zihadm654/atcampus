import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { SaveResearchInfo } from "@/types/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> }
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveResearch = await prisma.savedResearch.findUnique({
      where: {
        userId_researchId: {
          userId: loggedInUser.id,
          researchId,
        },
      },
    });

    const data: SaveResearchInfo = {
      isSaveResearchByUser: !!saveResearch,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> }
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedResearch.upsert({
      where: {
        userId_researchId: {
          userId: loggedInUser.id,
          researchId,
        },
      },
      create: {
        userId: loggedInUser.id,
        researchId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> }
) {
  const { researchId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedResearch.deleteMany({
      where: {
        userId: loggedInUser.id,
        researchId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
