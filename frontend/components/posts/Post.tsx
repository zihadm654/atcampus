"use client";

import type { Media } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import type { PostData } from "@/types/types";

import Linkify from "../feed/Linkify";
import BlurImage from "../shared/blur-image";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import Comments from "./comments/Comments";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";

interface PostProps {
	post: PostData;
}

export default function Post({ post }: PostProps) {
	const [showComments, setShowComments] = useState(false);
	const { data: session } = useSession();
	const user = session?.user;
	if (!user) {
		return null;
	}
	return (
		<article className="group/post space-y-3 rounded-2xl border bg-card p-5 shadow-sm max-md:p-3">
			<div className="flex justify-between gap-3">
				<div className="flex flex-wrap gap-3">
					<UserTooltip user={post.user}>
						<Link href={`/${post.user.username}`}>
							<UserAvatar user={post?.user} />
						</Link>
					</UserTooltip>
					<div>
						<UserTooltip user={post?.user}>
							<Link
								className="block font-medium hover:underline"
								href={`/${post.user.username}`}
							>
								{post.user.username}
							</Link>
						</UserTooltip>
						<Link
							className="block text-muted-foreground text-sm hover:underline"
							href={`/posts/${post.id}`}
							suppressHydrationWarning
						>
							{formatRelativeDate(post.createdAt)}
						</Link>
					</div>
				</div>
				{post.user.id === user.id && (
					<PostMoreButton
						post={post}
						// className="opacity-0 transition-opacity group-hover/post:opacity-100"
					/>
				)}
			</div>
			<Linkify>
				<div className="whitespace-pre-line wrap-break-words">
					{post.content}
				</div>
			</Linkify>
			{!!post.attachments.length && (
				<MediaPreviews attachments={post.attachments} />
			)}
			<hr className="text-muted-foreground" />
			<div className="flex justify-between gap-5">
				<div className="flex items-center gap-5">
					<LikeButton
						initialState={{
							likes: post._count.likes,
							isLikedByUser: post.likes.some((like) => like.userId === user.id),
						}}
						postId={post.id}
					/>
					<CommentButton
						onClick={() => setShowComments(!showComments)}
						post={post}
					/>
				</div>
				<BookmarkButton
					initialState={{
						isBookmarkedByUser: post.bookmarks.some(
							(bookmark) => bookmark.userId === user.id,
						),
					}}
					postId={post.id}
				/>
			</div>
			{showComments && <Comments post={post} />}
		</article>
	);
}

interface MediaPreviewsProps {
	attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
	// For single media, show full width
	if (attachments.length === 1) {
		return (
			<div className="overflow-hidden rounded-2xl">
				<MediaPreview media={attachments[0]} />
			</div>
		);
	}

	// For two media, show side by side
	if (attachments.length === 2) {
		return (
			<div className="grid grid-cols-2 gap-2">
				{attachments.map((m) => (
					<div className="overflow-hidden rounded-2xl" key={m.id}>
						<MediaPreview media={m} />
					</div>
				))}
			</div>
		);
	}

	// For three media, show in a balanced layout
	if (attachments.length === 3) {
		return (
			<div className="grid grid-cols-2 gap-2">
				<div className="row-span-2 overflow-hidden rounded-2xl">
					<MediaPreview media={attachments[0]} />
				</div>
				<div className="flex flex-col gap-2">
					<div className="overflow-hidden rounded-2xl">
						<MediaPreview media={attachments[1]} />
					</div>
					<div className="overflow-hidden rounded-2xl">
						<MediaPreview media={attachments[2]} />
					</div>
				</div>
			</div>
		);
	}

	// For four or more media, show grid with count overlay
	return (
		<div className="grid grid-cols-2 gap-2">
			<div className="overflow-hidden rounded-2xl">
				<MediaPreview media={attachments[0]} />
			</div>
			<div className="overflow-hidden rounded-2xl">
				<MediaPreview media={attachments[1]} />
			</div>
			<div className="overflow-hidden rounded-2xl">
				<MediaPreview media={attachments[2]} />
			</div>
			<div className="relative overflow-hidden rounded-2xl">
				<MediaPreview media={attachments[3]} />
				{attachments.length > 4 && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50">
						<div className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
							<span className="font-bold text-lg text-white">
								+{attachments.length - 4}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

interface MediaPreviewProps {
	media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
	if (media.type === "IMAGE") {
		return (
			<div className="relative h-0 w-full bg-gray-100 pb-[100%]">
				<BlurImage
					alt="Attachment"
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
					height={500}
					src={media.url}
					width={500}
				/>
			</div>
		);
	}

	if (media.type === "VIDEO") {
		return (
			<div className="relative h-0 w-full bg-gray-100 pb-[100%]">
				<video
					className="absolute inset-0 h-full w-full object-cover"
					src={media?.url}
					title="Video"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-transform hover:scale-110">
						<svg
							className="h-5 w-5 text-black"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-0 w-full items-center justify-center bg-gray-100 pb-[100%]">
			<p className="text-destructive">Unsupported media type</p>
		</div>
	);
}

interface CommentButtonProps {
	post: PostData;
	onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
	return (
		<button className="flex items-center gap-2" onClick={onClick} type="button">
			<MessageSquare className="size-5" />
			<span className="font-medium text-sm tabular-nums">
				{post._count.comments}{" "}
				<span className="hidden sm:inline">comments</span>
			</span>
		</button>
	);
}
