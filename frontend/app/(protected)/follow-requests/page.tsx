"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
	EmptyFollowRequests,
	FollowRequestCard,
} from "@/components/follow/FollowRequestCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useAcceptFollowRequest,
	useCancelFollowRequest,
	useFollowRequests,
	useRejectFollowRequest,
} from "@/hooks/useFollowRequests";
import { useUser } from "@/hooks/useUser";
import { filterFollowRequests, getRequestCounts } from "@/lib/follow-utils";

export default function FollowRequestsPage() {
	const { user } = useUser();
	const [activeTab, setActiveTab] = useState("received");

	const { data: followRequestsData, isLoading } = useFollowRequests(
		user?.id || "",
	);
	const acceptFollowRequest = useAcceptFollowRequest();
	const rejectFollowRequest = useRejectFollowRequest();
	const cancelFollowRequest = useCancelFollowRequest();

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground">
					Please log in to view follow requests.
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	const allRequests = followRequestsData?.followRequests || [];
	const { received: receivedRequests, sent: sentRequests } =
		filterFollowRequests(allRequests, user.id);
	const { receivedCount, sentCount } = getRequestCounts(allRequests, user.id);

	const handleAccept = (requesterId: string) => {
		acceptFollowRequest.mutate({ userId: requesterId, targetUserId: user.id });
	};

	const handleReject = (requesterId: string) => {
		rejectFollowRequest.mutate({ userId: requesterId, targetUserId: user.id });
	};

	const handleCancel = (targetId: string) => {
		cancelFollowRequest.mutate({ userId: user.id, targetUserId: targetId });
	};

	return (
		<div className="container mx-auto py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Follow Requests</h1>
				<p className="text-muted-foreground">
					Manage your incoming and outgoing follow requests
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="received" className="relative">
						Received
						{receivedCount > 0 && (
							<Badge variant="destructive" className="ml-2">
								{receivedCount}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="sent">
						Sent
						{sentCount > 0 && (
							<Badge variant="secondary" className="ml-2">
								{sentCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="received" className="space-y-4">
					{receivedRequests.length === 0 ? (
						<EmptyFollowRequests type="received" />
					) : (
						receivedRequests.map((request) => (
							<FollowRequestCard
								key={request.id}
								request={request}
								onAccept={handleAccept}
								onReject={handleReject}
								isLoading={
									acceptFollowRequest.isPending || rejectFollowRequest.isPending
								}
							/>
						))
					)}
				</TabsContent>

				<TabsContent value="sent" className="space-y-4">
					{sentRequests.length === 0 ? (
						<EmptyFollowRequests type="sent" />
					) : (
						sentRequests.map((request) => (
							<FollowRequestCard
								key={request.id}
								request={request}
								isSent={true}
								onCancel={handleCancel}
								isLoading={cancelFollowRequest.isPending}
							/>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
