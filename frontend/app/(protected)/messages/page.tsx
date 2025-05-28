import { constructMetadata } from "@/lib/utils";

import Chat from "./Chat";

export const metadata = constructMetadata({
  title: "Messages – AtCampus",
  description: "Chat and interact with others.",
});

export default function Page() {
  return <Chat />;
}
