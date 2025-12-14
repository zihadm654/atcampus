"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import FollowButton from "@/components/feed/FollowButton";
import { FollowRequestCard } from "@/components/follow/FollowRequestCard";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
	useAcceptFollowRequest,
	useRejectFollowRequest,
} from "@/hooks/useFollowRequests";
import { useUser } from "@/hooks/useUser";
import kyInstance from "@/lib/ky";

interface User {
	id: string;
	username: string;
	name: string;
	image: string | null;
	bio: string | null;
	summary: string | null;
	location: string | null;
	_count: {
		followers: number;
		following: number;
	};
}

export default function Connections() {
	const { user } = useUser();

	// Fetch following users
	const { data: followingData, isLoading: followingLoading } = useQuery({
		queryKey: ["user-following"],
		queryFn: async () => {
			const response = await kyInstance
				.get("/api/users/following")
				.json<{ users: User[] }>();
			return response.users;
		},
	});

	// Fetch followers
	const { data: followersData, isLoading: followersLoading } = useQuery({
		queryKey: ["user-followers"],
		queryFn: async () => {
			const response = await kyInstance
				.get("/api/users/followers")
				.json<{ users: User[] }>();
			return response.users;
		},
	});

	// Fetch follow suggestions
	const { data: suggestionsData } = useQuery({
		queryKey: ["user-suggestions"],
		queryFn: async () => {
			const response = await kyInstance
				.get("/api/users/suggestions")
				.json<{ suggestions: User[] }>();
			return response.suggestions;
		},
	});

	// Fetch follow requests
	const { data: followRequestsData } = useQuery({
		queryKey: ["follow-requests", user?.id],
		queryFn: async () => {
			const response = await kyInstance
				.get(`/api/users/${user?.id}/follow-requests`)
				.json<{ followRequests: any[] }>();
			return response; // Return the entire response object
		},
		enabled: !!user?.id,
	});

	// Calculate mutual connections
	const mutualConnections =
		followingData?.filter((followedUser) =>
			followersData?.some((follower) => follower.id === followedUser.id),
		) || [];

	const isLoading = followingLoading || followersLoading;
	const pendingRequests = (followRequestsData?.followRequests || []).filter(
		(req) => req.status === "PENDING" && req.targetId === user?.id,
	);

	if (isLoading) {
		return (
			<div className="w-full space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="font-bold text-2xl">Connections</h1>
					<div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
				</div>

				<div className="grid grid-cols-4 gap-2">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-10 bg-gray-200 rounded animate-pulse"
						></div>
					))}
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-4">
								<div className="flex flex-col items-center space-y-3">
									<div className="rounded-full bg-gray-200 h-24 w-24"></div>
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
									<div className="h-8 bg-gray-200 rounded w-full"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const following = followingData || [];
	const followers = followersData || [];
	const suggestions = suggestionsData || [];

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">Connections</h1>
				{pendingRequests.length > 0 && (
					<Button asChild variant="outline">
						<Link href="/follow-requests">
							{pendingRequests.length} Follow Requests
						</Link>
					</Button>
				)}
			</div>
			<ConnectionList
				users={following}
				emptyMessage="Not Following Anyone Yet"
				emptySubtext="Start connecting with others to build your network!"
				emptyActionText="Find People to Follow"
				emptyActionHref="/search"
				isFollowing={true}
			/>

			<h1 className="font-bold text-2xl">Follow Requests</h1>
			<FollowRequestList requests={pendingRequests} />

			<h1 className="font-bold text-2xl">Followers</h1>
			<ConnectionList
				users={followers}
				emptyMessage="No Followers Yet"
				emptySubtext="Share great content to attract followers!"
				emptyActionText="Create a Post"
				emptyActionHref="/create-post"
				isFollowing={false}
			/>
			<h1 className="font-bold text-2xl">Mutual Connections</h1>
			<ConnectionList
				users={mutualConnections}
				emptyMessage="No Mutual Connections Yet"
				emptySubtext="Follow people who follow you to create mutual connections!"
				emptyActionText="View Your Followers"
				emptyActionHref="/connections/followers"
				isFollowing={true}
			/>

			{/* Follow Suggestions Section */}
			{suggestions.length > 0 && (
				<div className="mt-8">
					<h2 className="font-bold text-xl mb-4">People You May Know</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{suggestions.slice(0, 6).map((user) => (
							<ConnectionCard key={user.id} user={user} isFollowing={false} />
						))}
					</div>
					{suggestions.length > 6 && (
						<div className="mt-4 text-center">
							<Button asChild variant="outline">
								<Link href="/search">View More Suggestions</Link>
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

interface ConnectionListProps {
	users: User[];
	emptyMessage: string;
	emptySubtext: string;
	emptyActionText: string;
	emptyActionHref: string;
	isFollowing: boolean;
}

function ConnectionList({
	users,
	emptyMessage,
	emptySubtext,
	emptyActionText,
	emptyActionHref,
	isFollowing,
}: ConnectionListProps) {
	if (users.length === 0) {
		return (
			<div className="flex w-full flex-col items-center justify-center rounded-2xl bg-card p-12 shadow-sm">
				<div className="mb-4 text-5xl">👥</div>
				<h2 className="mb-2 text-center font-bold text-2xl">{emptyMessage}</h2>
				<p className="mb-6 text-center text-muted-foreground">{emptySubtext}</p>
				<Button asChild>
					<Link href={emptyActionHref}>{emptyActionText}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{users.map((user) => (
				<ConnectionCard key={user.id} user={user} isFollowing={isFollowing} />
			))}
		</div>
	);
}

interface ConnectionCardProps {
	user: User;
	isFollowing: boolean;
}

function ConnectionCard({ user, isFollowing }: ConnectionCardProps) {
	return (
		<Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
			{/* Profile Picture as Main Visual Element */}
			<div className="relative flex justify-center p-2">
				<Link href={`/${user.username}`}>
					<div className="relative">
						<UserAvatar
							avatarUrl={user.image}
							className="size-24 rounded-full ring-4 ring-primary/10 transition-transform duration-300 hover:scale-105"
							size={96}
						/>
						<div className="absolute inset-0 rounded-full ring-1 ring-black/5 ring-inset" />
					</div>
				</Link>
			</div>

			{/* User Information */}
			<CardContent>
				<div className="gap-2 flex items-start flex-col justify-start w-full">
					<Link href={`/${user.username}`}>
						<h3 className="truncate font-bold text-xl hover:underline">
							{user.name}
						</h3>
					</Link>
					<p className="mb-3 truncate text-muted-foreground">
						@{user.username}
					</p>
					{user.summary && (
						<p className="text-sm text-muted-foreground mb-3">{user.summary}</p>
					)}
					<FollowButton
						initialState={{
							followers: user._count.followers,
							isFollowedByUser: isFollowing,
						}}
						userId={user.id}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

interface FollowRequestListProps {
	requests: any[];
}

function FollowRequestList({ requests }: FollowRequestListProps) {
	const acceptFollowRequest = useAcceptFollowRequest();
	const rejectFollowRequest = useRejectFollowRequest();

	if (requests.length === 0) {
		return (
			<div className="flex w-full flex-col items-center justify-center rounded-2xl bg-card p-12 shadow-sm">
				<div className="mb-4 text-5xl">📬</div>
				<h2 className="mb-2 text-center font-bold text-2xl">
					No Follow Requests
				</h2>
				<p className="mb-6 text-center text-muted-foreground">
					When someone wants to follow you, you'll see their requests here.
				</p>
				<Button asChild>
					<Link href="/follow-requests">Manage Requests</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{requests.map((request) => (
				<FollowRequestCard
					key={request.id}
					request={request}
					onAccept={(requesterId) =>
						acceptFollowRequest.mutate({
							userId: requesterId,
							targetUserId: request.targetId,
						})
					}
					onReject={(requesterId) =>
						rejectFollowRequest.mutate({
							userId: requesterId,
							targetUserId: request.targetId,
						})
					}
					isLoading={
						acceptFollowRequest.isPending || rejectFollowRequest.isPending
					}
				/>
			))}
		</div>
	);
}
