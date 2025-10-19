"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import type { NotificationCountInfo } from "@/types/types";

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
    refetchInterval: 30_000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 20_000, // Consider data stale after 20 seconds
  });

  return (
    <Button
      asChild
      className="flex items-center justify-start gap-2 rounded-full"
      title="Notifications"
      variant="ghost"
    >
      <Link href="/notifications" prefetch={true}>
        <div className="relative">
          <Bell className="size-5" />
          {!!data.unreadCount && (
            <span className="-top-1 -right-1 absolute rounded-full bg-primary px-1 font-medium text-white text-xs tabular-nums dark:text-black">
              {data.unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
