import { type NextRequest, NextResponse } from "next/server";
import { sendEventReminders } from "@/lib/utils/event-reminders";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job or scheduled task
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.CRON_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendEventReminders();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Sent ${result.count} event reminders`,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in event reminders API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
