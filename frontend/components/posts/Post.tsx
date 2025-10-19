"use client";

import type { Media } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { cn, formatRelativeDate } from "@/lib/utils";
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
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return null;
  }
  const [showComments, setShowComments] = useState(false);
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
        <div className="whitespace-pre-line break-words">{post.content}</div>
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
              (bookmark) => bookmark.userId === user.id
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
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <BlurImage
        alt="Attachment"
        className="mx-auto size-fit max-h-[25rem] rounded-2xl"
        height={500}
        src={media.url}
        width={800}
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          className="mx-auto size-fit max-h-[25rem] rounded-2xl"
          controls
          src={media?.url}
          title="Video"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
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
