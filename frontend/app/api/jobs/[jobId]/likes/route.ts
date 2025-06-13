import { LikeInfo } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      // select: {
      //   likes: {
      //     where: {
      //       userId: loggedInUser.id,
      //     },
      //     select: {
      //       userId: true,
      //     },
      //   },
      //   _count: {
      //     select: {
      //       likes: true,
      //     },
      //   },
      // },
    });

    if (!job) {
      return Response.json({ error: "job not found" }, { status: 404 });
    }

    // const data: LikeInfo = {
    //   likes: job._count.likes,
    //   isLikedByUser: !!job.likes.length,
    // };

    return Response.json("heelo");
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        userId: true,
      },
    });

    if (!job) {
      return Response.json({ error: "job not found" }, { status: 404 });
    }
    // await prisma.$transaction([
    //   prisma.like.upsert({
    //     where: {
    //       userId_jobId: {
    //         userId: loggedInUser.id,
    //         jobId,
    //       },
    //     },
    //     create: {
    //       userId: loggedInUser.id,
    //       jobId,
    //     },
    //     update: {},
    //   }),
    //   ...(loggedInUser.id !== job.userId
    //     ? [
    //         prisma.notification.create({
    //           data: {
    //             issuerId: loggedInUser.id,
    //             recipientId: job.userId,
    //             jobId,
    //             type: "LIKE",
    //           },
    //         }),
    //       ]
    //     : []),
    // ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  try {
    const loggedInUser = await getCurrentUser();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        userId: true,
      },
    });

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    try {
      await prisma.$transaction([
        prisma.like.deleteMany({
          where: {
            userId: loggedInUser.id,
            // jobId,
          },
        }),
        prisma.notification.deleteMany({
          where: {
            issuerId: loggedInUser.id,
            recipientId: job.userId,
            jobId,
            type: "LIKE",
          },
        }),
      ]);
      return new Response(null, { status: 200 });
    } catch (error) {
      // If the like doesn't exist, that's fine - just return success
      if (error.code === "P2025") {
        return new Response(null, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
