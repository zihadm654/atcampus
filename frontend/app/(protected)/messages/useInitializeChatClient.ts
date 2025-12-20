import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { env } from "@/env.mjs";
import { useSession } from "@/lib/auth-client";
import kyInstance from "@/lib/ky";

export default function useInitializeChatClient() {
	const [chatClient, setChatClient] = useState<StreamChat | null>(null);
	const { data: session } = useSession();
	
	useEffect(() => {
		if (!session?.user?.id) return;

		const client = StreamChat.getInstance(env.NEXT_PUBLIC_STREAM_KEY);

		const connectUser = async () => {
			try {
				const tokenResponse = await kyInstance.get("/api/get-token");
				const { token } = await tokenResponse.json<{ token: string }>();
				
				await client.connectUser(
					{
						id: session.user.id,
						username: session.user.username ?? undefined,
						name: session.user.name,
						image: session.user.image ?? undefined,
					},
					token
				);
				
				setChatClient(client);
			} catch (error) {
				console.error("Failed to connect user", error);
			}
		};

		connectUser();

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

	return chatClient;
}
