import { unstable_cache } from "next/cache";
// import { headers } from "next/headers";
import getStream from "@/actions/stream-action";

import MessagesButton from "../feed/MessagesButton";
import NotificationsButton from "../feed/NotificationsButton";

// Cache the stream data at the server level
const getStreamCached = unstable_cache(
  async () => {
    return await getStream();
  },
  ["activity-counts"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["activity-counts"],
  },
);

const Activity = async () => {
  // Force dynamic behavior at the right level
  // headers();

  const { unreadNotificationsCount, unreadMessagesCount } =
    await getStreamCached();

  return (
    <div className="flex items-center gap-2">
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
    </div>
  );
};

export default Activity;
