import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import FollowButton from "@/components/feed/FollowButton";
import Linkify from "@/components/feed/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostDataInclude, type UserData } from "@/types/types";

interface PageProps {
	params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
	const post = await prisma.post.findUnique({
		where: {
			id: postId,
		},
		include: getPostDataInclude(loggedInUserId),
	});

	if (!post) notFound();

	return post;
});

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { postId } = await params;
	const user = await getCurrentUser();

	if (!user) return {};

	const post = await getPost(postId, user.id);

	return {
		title: `${post.title}: ${post.content.slice(0, 50)}...`,
	};
}

export default async function Page({ params }: PageProps) {
	const { postId } = await params;
	const user = await getCurrentUser();

	if (!user) {
		return (
			<p className="text-destructive">
				You&apos;re not authorized to view this page.
			</p>
		);
	}

	const post = await getPost(postId, user.id);

	return (
		<main className="flex w-full min-w-0 gap-5">
			<div className="w-full min-w-0 space-y-5">
				<Post post={post} />
			</div>
			<div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
				<Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
					<UserInfoSidebar user={post.user} />
				</Suspense>
			</div>
		</main>
	);
}

interface UserInfoSidebarProps {
	user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
	const loggedInUser = await getCurrentUser();

	if (!loggedInUser) return null;

	return (
		<div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
			<div className="font-bold text-xl">About this user</div>
			<UserTooltip user={user}>
				<Link className="flex items-center gap-3" href={`/${user.username}`}>
					<UserAvatar avatarUrl={user.image} className="flex-none" />
					<div>
						<p className="line-clamp-1 break-all font-semibold hover:underline">
							{user.displayUsername}
						</p>
						<p className="line-clamp-1 break-all text-muted-foreground">
							@{user.username}
						</p>
					</div>
				</Link>
			</UserTooltip>
			<Linkify>
				<div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
					{user.bio}
				</div>
			</Linkify>
			{user.id !== loggedInUser.id && (
				<FollowButton
					initialState={{
						followers: user._count.followers,
						isFollowedByUser: user.followers.some(
							({ followerId }) => followerId === loggedInUser.id,
						),
					}}
					userId={user.id}
				/>
			)}
		</div>
	);
}
