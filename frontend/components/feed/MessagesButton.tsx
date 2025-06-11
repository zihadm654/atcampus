"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";

import { MessageCountInfo } from "@/types/types";
import kyInstance from "@/lib/ky";
import { Button } from "@/components/ui/button";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      try {
        return await kyInstance
          .get("/api/messages/unread-count")
          .json<MessageCountInfo>();
      } catch (error) {
        console.error("Error fetching unread messages count:", error);
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
      className="flex items-center justify-start gap-2"
      title="Messages"
      asChild
    >
      <Link href="/messages">
        <div className="relative">
          <Mail />
          {!!data.unreadCount && (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 rounded-full px-1 text-xs font-medium tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
