"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { timeAgo } from "@/lib/utils";
import type { ResearchData } from "@/types";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import { Button } from "../ui/button";
import { sendCollaborationRequest } from "./collaboration-actions";
import ResearchMoreButton from "./ResearchMoreButton";
import SaveResearchButton from "./SaveResearchButton";

interface ResearchProps {
	research: ResearchData;
}

export default function Research({ research }: ResearchProps) {
	const [isPending, startTransition] = useTransition();
	const { data: session } = useSession();

	// Check if user is the owner
	const isOwner = research.userId === session?.user.id;

	// Check if user is a collaborator
	const isCollaborator = research.collaborators?.some
		? research.collaborators?.some((c: any) => c.id === session?.user.id)
		: false;

	// Check if user has sent a collaboration request
	const userCollaborationRequest =
		Array.isArray(research.collaborationRequests) &&
		research.collaborationRequests.length > 0
			? research.collaborationRequests.find(
					(c: any) => c.requesterId === session?.user.id,
				)
			: null;

	const hasRequested = !!userCollaborationRequest;
	const isRequestRejected = userCollaborationRequest?.status === "DECLINED";

	const [optimisticRequested, setOptimisticRequested] = useOptimistic<
		boolean,
		boolean
	>(hasRequested, (_, newState: boolean) => newState);

	const handleCollaborationRequest = () => {
		startTransition(async () => {
			setOptimisticRequested(true);
			try {
				const res = await sendCollaborationRequest(research.id);
				if (res.success) {
					toast.success(res.message);
					// Update the local state to persist the request
				} else {
					setOptimisticRequested(false);
					toast.error(res.message);
				}
			} catch (_error) {
				setOptimisticRequested(false);
				toast.error("Failed to send collaboration request");
			}
		});
	};

	return (
		<Card className="group hover:-translate-y-1 relative overflow-hidden pt-0 transition-all duration-300 hover:shadow-lg">
			<CardHeader className="relative px-0">
				<Image
					alt={research.user.name}
					className="h-44 w-full rounded-sm object-cover"
					height="600"
					src={research?.user.image || "/_static/avatars/shadcn.jpeg"}
					width="400"
				/>
				<div className="absolute inset-0 flex items-start justify-end">
					{isOwner && <ResearchMoreButton research={research} />}
				</div>
			</CardHeader>
			<CardContent className="gap-2">
				<Link href={`/researches/${research.id}`}>
					<CardTitle className="line-clamp-2 text-lg">
						{research.title}
					</CardTitle>
					<div className="flex items-center gap-2 py-2">
						<UserTooltip user={research.user}>
							<Link href={`/${research.user.username}`}>
								<UserAvatar user={research?.user} />
							</Link>
						</UserTooltip>
						<UserTooltip user={research?.user}>
							<Link
								className="flex items-center gap-1 font-semibold hover:underline"
								href={`/${research.user.username}`}
							>
								{research.user.name}
								{research.user.emailVerified && (
									<ShieldCheck className="size-4 text-blue-700" />
								)}
							</Link>
						</UserTooltip>
					</div>
					<p>posted {timeAgo(research.createdAt)}</p>
				</Link>
			</CardContent>
			<CardFooter className="border-t bg-muted/30 relative">
				<div className="flex w-full items-center justify-between gap-2 pt-0">
					{!isOwner ? (
						<Button
							disabled={
								isCollaborator ||
								optimisticRequested ||
								(hasRequested && !isRequestRejected) ||
								isPending
							}
							onClick={handleCollaborationRequest}
							variant={
								isCollaborator
									? "success"
									: isRequestRejected
										? "destructive"
										: optimisticRequested || hasRequested
											? "outline"
											: "default"
							}
							className={
								isCollaborator
									? "flex-1 bg-green-600 hover:bg-green-700 text-white"
									: isRequestRejected
										? "flex-1"
										: optimisticRequested || hasRequested
											? "flex-1 border-gray-400 text-gray-400 hover:bg-gray-100"
											: "flex-1"
							}
						>
							{isCollaborator
								? "Selected"
								: isRequestRejected
									? "Rejected"
									: optimisticRequested || hasRequested
										? "Request Sent"
										: "Request Collaboration"}
						</Button>
					) : (
						<Button
							className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
							disabled
						>
							Own research
						</Button>
					)}
					<SaveResearchButton
						initialState={{
							isSaveResearchByUser: research.savedResearch?.some
								? research.savedResearch.some(
										(bookmark: any) => bookmark.userId === session?.user.id,
									)
								: false,
						}}
						researchId={research.id}
					/>
				</div>
			</CardFooter>
		</Card>
	);
}
