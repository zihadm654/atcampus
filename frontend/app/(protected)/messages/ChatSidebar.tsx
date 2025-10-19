"use client";

import { useQueryClient } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  type ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();

  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose]
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72",
        open ? "flex" : "hidden"
      )}
    >
      <MenuHeader onClose={onClose} />
      <ChannelList
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user?.id as string] } },
            },
          },
        }}
        filters={{
          type: "messaging",
          members: { $in: [user?.id as string] },
        }}
        options={{ state: true, presence: true, limit: 8 }}
        Preview={ChannelPreviewCustom}
        showChannelSearch
        sort={{ last_message_at: -1 }}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button onClick={onClose} size="icon" variant="ghost">
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto font-bold text-xl md:ms-2">Messages</h1>
        <Button
          onClick={() => setShowNewChatDialog(true)}
          size="icon"
          title="Start new chat"
          variant="ghost"
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
          onOpenChange={setShowNewChatDialog}
        />
      )}
    </>
  );
}
