"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

const getStream = async () => {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      unreadNotificationsCount: 0,
      unreadMessagesCount: 0,
    };
  }
  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user?.id,
        read: false,
      },
    }),
    await streamServerClient
      .getUnreadCount(user?.id)
      .then((result) => result.total_unread_count)
      .catch((error) => {
        console.warn("Failed to get unread count from Stream:", error.message);
        return 0;
      }),
  ]);
  return { unreadNotificationsCount, unreadMessagesCount };
};

export default getStream;
