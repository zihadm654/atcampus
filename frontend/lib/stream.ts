import { StreamChat } from "stream-chat";

import { env } from "@/env.mjs";

const streamServerClient = StreamChat.getInstance(
  env.NEXT_PUBLIC_STREAM_KEY,
  env.STREAM_SECRET,
);

export default streamServerClient;
