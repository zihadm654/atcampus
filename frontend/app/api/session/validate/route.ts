import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // This uses the full auth module but only in the API route context
    // where argon2 is available
    const session = await auth.api.getSession({
      headers: new Headers(req.headers),
    });

    if (!session) {
      return new NextResponse(null, { status: 401 });
    }

    return NextResponse.json({
      role: session.user.role,
      status: session.user.status,
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}