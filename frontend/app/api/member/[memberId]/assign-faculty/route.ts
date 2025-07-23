import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const patchSchema = z.object({
  facultyId: z.string().optional(),
});

export async function PATCH(
  req: Request,
  context: { params: { memberId: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "INSTITUTION") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { params } = context;

    if (!params.memberId) {
      return new NextResponse("Member ID is required", { status: 400 });
    }

    const json = await req.json();
    const body = patchSchema.parse(json);

    const member = await prisma.member.update({
      where: {
        id: params.memberId,
        // instituteId: user.id,
      },
      data: {
        facultyId: body.facultyId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}