import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

import { NavBar } from "./navbar";

interface NavBarWrapperProps {
  scroll?: boolean;
  large?: boolean;
}

export async function NavBarServer({
  scroll = false,
  large = false,
}: NavBarWrapperProps) {
  const user = await getCurrentUser();

  // let notificationCount = 0;
  // let messageCount = 0;

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    await streamServerClient
      .getUnreadCount(user.id)
      .then((result) => result.total_unread_count)
      .catch((error) => {
        console.warn("Failed to get unread count from Stream:", error.message);
        return 0;
      }),
  ]);

  return (
    <NavBar
      scroll={scroll}
      large={large}
      initialNotificationCount={unreadNotificationsCount}
      initialMessageCount={unreadMessagesCount}
    />
  );
}
