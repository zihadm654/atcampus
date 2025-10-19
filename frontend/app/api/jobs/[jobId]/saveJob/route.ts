import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { SaveJobInfo } from "@/types/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: loggedInUser.id,
          jobId,
        },
      },
    });

    const data: SaveJobInfo = {
      isSaveJobByUser: !!saveJob,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedJob.upsert({
      where: {
        userId_jobId: {
          userId: loggedInUser.id,
          jobId,
        },
      },
      create: {
        userId: loggedInUser.id,
        jobId,
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
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedJob.deleteMany({
      where: {
        userId: loggedInUser.id,
        jobId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
