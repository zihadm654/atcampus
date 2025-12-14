"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, SearchIcon, X } from "lucide-react";
import { useState } from "react";
import type { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { useSession } from "@/lib/auth-client";

interface NewChatDialogProps {
	onOpenChange: (open: boolean) => void;
	onChatCreated: () => void;
}

export default function NewChatDialog({
	onOpenChange,
	onChatCreated,
}: NewChatDialogProps) {
	const [searchInput, setSearchInput] = useState("");
	const searchInputDebounced = useDebounce(searchInput, 500);
	const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
	const { client, setActiveChannel } = useChatContext();
	const { data: session } = useSession();
	const { toast } = useToast();
	const loggedInUser = session?.user;
	if (!loggedInUser) throw new Error("User not logged in");

	const { data, isFetching, isError, isSuccess } = useQuery({
		queryKey: ["stream-users", searchInputDebounced],
		queryFn: async () => {
			if (!(searchInputDebounced && client)) return { users: [] };
			return client.queryUsers(
				{
					id: { $in: [loggedInUser?.id] }, // Use $nin instead of $ne for proper typing
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
					? [loggedInUser?.id, selectedUsers[0].id].sort().join("::")
					: crypto.randomUUID();

			const channelData = {
				members: [loggedInUser?.id, ...selectedUsers.map((u) => u.id)],
				created_by_id: loggedInUser?.id,
			};

			// Add optional name for group chats
			// if (selectedUsers.length > 1) {
			// 	channelData["name"] =
			// 		`${loggedInUser?.name}, ${selectedUsers.map((u) => u.name || u.id).join(", ")}`;
			// }

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
		<Dialog onOpenChange={onOpenChange} open>
			<DialogContent className="bg-card p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>New chat</DialogTitle>
				</DialogHeader>
				<div>
					<div className="group relative">
						<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-5 size-5 transform text-muted-foreground group-focus-within:text-primary" />
						<input
							className="h-12 w-full ps-14 pe-4 focus:outline-none"
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search users..."
							value={searchInput}
						/>
					</div>
					{!!selectedUsers.length && (
						<div className="mt-4 flex flex-wrap gap-2 p-2">
							{selectedUsers.map((user) => (
								<SelectedUserTag
									key={user.id}
									onRemove={() => {
										setSelectedUsers((prev) =>
											prev.filter((u) => u.id !== user.id),
										);
									}}
									user={user}
								/>
							))}
						</div>
					)}
					<hr />{" "}
					<div className="h-96 overflow-y-auto">
						{isFetching ? (
							<div className="flex justify-center py-4">
								<Loader2 className="size-6 animate-spin text-muted-foreground" />
							</div>
						) : isError ? (
							<p className="my-3 text-center text-destructive">
								An error occurred while loading users.
							</p>
						) : isSuccess &&
							data?.users.length === 0 &&
							searchInputDebounced ? (
							<p className="my-3 text-center text-muted-foreground">
								No users found. Try a different name.
							</p>
						) : searchInputDebounced ? (
							data?.users.map((user) => (
								<UserResult
									key={user.id}
									onClick={() => {
										setSelectedUsers((prev) =>
											prev.some((u) => u.id === user.id)
												? prev.filter((u) => u.id !== user.id)
												: [...prev, user],
										);
									}}
									selected={selectedUsers.some((u) => u.id === user.id)}
									user={user}
								/>
							))
						) : (
							<p className="my-3 text-center text-muted-foreground">
								Start typing to search for users
							</p>
						)}
					</div>
				</div>
				<DialogFooter className="flex-row items-center justify-between border-t p-4">
					<Button onClick={() => onOpenChange(false)} variant="ghost">
						Cancel
					</Button>
					<Button
						disabled={selectedUsers.length === 0 || mutation.isPending}
						onClick={() => mutation.mutate()}
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
			className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
			onClick={onClick}
			type="button"
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
			className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
			onClick={onRemove}
			type="button"
		>
			<UserAvatar
				user={{
					name: user.name || "",
					image: user.image || null,
					username: user.id,
				}}
			/>
			<p className="font-bold">{user.name || user.id}</p>
			<X className="mx-2 size-5 text-muted-foreground" />
		</button>
	);
}
