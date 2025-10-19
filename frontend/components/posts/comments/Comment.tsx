import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import type { CommentData } from "@/types/types";

import UserAvatar from "../../UserAvatar";
import UserTooltip from "../../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;
  return (
    <div className="group/comment flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.image} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              className="font-medium hover:underline"
              href={`/${comment.user.username}`}
            >
              {comment.user.displayUsername}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
      {comment.user.id === user.id && (
        <CommentMoreButton
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
          comment={comment}
        />
      )}
    </div>
  );
}
