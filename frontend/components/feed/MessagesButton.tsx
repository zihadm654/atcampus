"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import type { MessageCountInfo } from "@/types/types";

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
    refetchInterval: 30_000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 20_000, // Consider data stale after 20 seconds
  });

  return (
    <Button
      asChild
      className="flex items-center justify-start gap-2"
      title="Messages"
      variant="ghost"
    >
      <Link href="/messages" prefetch={true}>
        <div className="relative">
          <Mail className="size-5" />
          {!!data.unreadCount && (
            <span className="-top-1 -right-1 absolute rounded-full bg-primary px-1 font-medium text-primary-foreground text-xs tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
