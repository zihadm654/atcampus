"use client";

import { useState, useEffect } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { useTheme } from "next-themes";
import { Chat as StreamChat } from "stream-chat-react";

import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  if (!isOnline) {
    return (
      <div className="bg-card flex min-h-80 w-full flex-col items-center justify-center gap-4 rounded-2xl p-6 shadow-sm">
        <WifiOff className="text-muted-foreground size-12" />
        <h3 className="text-xl font-semibold">You're offline</h3>
        <p className="text-muted-foreground text-center">
          Please check your internet connection to continue chatting
        </p>
        <Button onClick={() => window.location.reload()}>
          Try reconnecting
        </Button>
      </div>
    );
  }

  return (
    <main className="bg-card relative min-h-80 w-full overflow-hidden rounded-2xl shadow-sm">
      <div className="absolute top-0 bottom-0 flex w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
    </main>
  );
}
