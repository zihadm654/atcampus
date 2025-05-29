import { v4 as uuidv4 } from "uuid";

import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

export async function GET() {
  try {
    const user = await getCurrentUser();

    console.log("Calling for user: ", user?.id);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channel = streamServerClient.channel("messaging", uuidv4(), {
      members: [user.id],
      created_by_id: user.id,
    });
    const creationResult = await channel.create();
    console.log("creationResult: ", creationResult);

    return Response.json({ channelId: creationResult.channel.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
