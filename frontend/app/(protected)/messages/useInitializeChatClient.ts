import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import { useSession } from "@/lib/auth-client";
import kyInstance from "@/lib/ky";

export default function useInitializeChatClient() {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { data: session } = useSession();
  if (!session) {
    return null;
  }
  const user = session.user;

  useEffect(() => {
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    client
      .connectUser(
        {
          id: user.id,
          username: user.username ?? undefined,
          name: user.name,
          image: user.image ?? undefined,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token)
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
  }, [user.id, user.username, user.name, user.image]);

  return chatClient;
}
