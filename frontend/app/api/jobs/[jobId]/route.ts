import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getJobDataInclude } from "@/types/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!jobId) {
      return new NextResponse("Job ID is required", { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: getJobDataInclude(user.id),
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
