import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return new NextResponse("Job ID is required", { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        skills: true,
      },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    return NextResponse.json(job.skills || []);
  } catch (error) {
    console.error("Error fetching job skills:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
