import { UTApi } from "uploadthing/server";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    new UTApi().deleteFiles(unusedMedia.map((m) => m.url));

    // Delete records from database
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
