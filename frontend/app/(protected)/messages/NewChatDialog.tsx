"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, SearchIcon, X } from "lucide-react";
import { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";

import { useSession } from "@/lib/auth-client";
import useDebounce from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/shared/user-avatar";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext();
  const { toast } = useToast();
  const { data: session } = useSession();
  const loggedInUser = session?.user;

  if (!loggedInUser) {
    console.error("User not logged in");
    return null;
  }

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput, 500);
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () => {
      if (!searchInputDebounced || !client) return { users: [] };
      return client.queryUsers(
        {
          id: { $in: [loggedInUser.id] }, // Use $nin instead of $ne for proper typing
          $or: [
            { name: { $autocomplete: searchInputDebounced } },
            { id: { $autocomplete: searchInputDebounced } },
          ],
        },
        { created_at: -1 }, // Sort by creation date descending
        { limit: 15 },
      );
    },
    enabled: !!client && !!searchInputDebounced,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUsers.length) {
        throw new Error("Select at least one user");
      } // For 1:1 chats, create a deterministic channel ID
      const channelId =
        selectedUsers.length === 1
          ? [loggedInUser.id, selectedUsers[0].id].sort().join("::")
          : crypto.randomUUID();

      const channelData = {
        members: [loggedInUser.id, ...selectedUsers.map((u) => u.id)],
        created_by_id: loggedInUser.id,
      };

      // Add optional name for group chats
      if (selectedUsers.length > 1) {
        channelData["name"] =
          `${loggedInUser.name}, ${selectedUsers.map((u) => u.name || u.id).join(", ")}`;
      }

      const channel = client.channel("messaging", channelId, channelData);

      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
      toast({
        description: "Chat created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Failed to create chat",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-5 size-5 -translate-y-1/2 transform" />
            <input
              placeholder="Search users..."
              className="h-12 w-full ps-14 pe-4 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {!!selectedUsers.length && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <SelectedUserTag
                  key={user.id}
                  user={user}
                  onRemove={() => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id),
                    );
                  }}
                />
              ))}
            </div>
          )}
          <hr />{" "}
          <div className="h-96 overflow-y-auto">
            {isFetching ? (
              <div className="flex justify-center py-4">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            ) : isError ? (
              <p className="text-destructive my-3 text-center">
                An error occurred while loading users.
              </p>
            ) : isSuccess &&
              data?.users.length === 0 &&
              searchInputDebounced ? (
              <p className="text-muted-foreground my-3 text-center">
                No users found. Try a different name.
              </p>
            ) : !searchInputDebounced ? (
              <p className="text-muted-foreground my-3 text-center">
                Start typing to search for users
              </p>
            ) : (
              data?.users.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selectedUsers.some((u) => u.id === user.id)}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.some((u) => u.id === user.id)
                        ? prev.filter((u) => u.id !== user.id)
                        : [...prev, user],
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
        <DialogFooter className="flex-row items-center justify-between border-t p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={selectedUsers.length === 0 || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-2.5 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <UserAvatar
          user={{
            name: user.name || "",
            image: user.image || null,
            username: user.id,
          }}
        />
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name || user.id}</p>
          <p className="text-muted-foreground">@{user.id}</p>
        </div>
      </div>
      {selected && <Check className="size-5 text-green-500" />}
    </button>
  );
}

interface SelectedUserTagProps {
  user: UserResponse;
  onRemove: () => void;
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
  return (
    <button
      onClick={onRemove}
      className="hover:bg-muted/50 flex items-center gap-2 rounded-full border p-1"
    >
      <UserAvatar
        user={{
          name: user.name || "",
          image: user.image || null,
          username: user.id,
        }}
      />
      <p className="font-bold">{user.name || user.id}</p>
      <X className="text-muted-foreground mx-2 size-5" />
    </button>
  );
}
