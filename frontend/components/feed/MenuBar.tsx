import { Bookmark, Briefcase, GraduationCap, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const user = await getCurrentUser();

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
    <div className={className}>
      <Button
        asChild
        className="flex items-center justify-start gap-3"
        title="Home"
        variant="ghost"
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <Button
        asChild
        className="flex items-center justify-start gap-3"
        title="Courses"
        variant="ghost"
      >
        <Link href="/courses">
          <GraduationCap />
          <span className="hidden lg:inline">Courses</span>
        </Link>
      </Button>
      <Button
        asChild
        className="flex items-center justify-start gap-3"
        title="Jobs"
        variant="ghost"
      >
        <Link href="/jobs">
          <Briefcase />
          <span className="hidden lg:inline">Jobs</span>
        </Link>
      </Button>
      <Button
        asChild
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        variant="ghost"
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}
