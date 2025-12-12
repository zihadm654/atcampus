import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import { useSession } from "@/lib/auth-client";
import kyInstance from "@/lib/ky";
import { env } from "@/env.mjs";

export default function useInitializeChatClient() {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { data: session } = useSession();
  useEffect(() => {
    const client = StreamChat.getInstance(env.NEXT_PUBLIC_STREAM_KEY);

    client
      .connectUser(
        {
          id: session?.user?.id || "",
          username: session?.user?.username ?? undefined,
          name: session?.user?.name,
          image: session?.user?.image ?? undefined,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.error("Failed to connect user", error))
      .then(() => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [
    session?.user?.id,
    session?.user?.username,
    session?.user?.name,
    session?.user?.image,
  ]);
  if (!session) {
    return null;
  }

  return chatClient;
}
