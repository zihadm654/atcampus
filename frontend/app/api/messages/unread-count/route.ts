import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ unreadCount: 0 });
    }
    
    const unreadCount = await streamServerClient
      .getUnreadCount(user.id)
      .then((result) => result.total_unread_count)
      .catch((error) => {
        console.warn("Failed to get unread count from Stream:", error.message);
        return 0;
      });
    
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return NextResponse.json({ unreadCount: 0 }, { status: 500 });
  }
}
