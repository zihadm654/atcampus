"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

import { NotificationCountInfo } from "@/types/types";
import kyInstance from "@/lib/ky";
import { Button } from "@/components/ui/button";

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton({
  initialState,
}: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      try {
        return await kyInstance
          .get("/api/notifications/unread-count")
          .json<NotificationCountInfo>();
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        return { unreadCount: 0 };
      }
    },
    initialData: initialState,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-2 rounded-full"
      title="Notifications"
      asChild
    >
      <Link href="/notifications" prefetch={true}>
        <div className="relative">
          <Bell className="size-5" />
          {!!data.unreadCount && (
            <span className="bg-primary text-white absolute -top-1 -right-1 rounded-full px-1 text-xs font-medium tabular-nums dark:text-black">
              {data.unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
