"use client";

import { useOptimistic, useState } from "react";
import Image from "next/image";
import { addComment } from "@/actions/actions";
import { Comment, User } from "@/generated/prisma";
import { Ellipsis, Smile, ThumbsUp } from "lucide-react";

import { useSession } from "@/lib/auth-client";

import { UserAvatar } from "../shared/user-avatar";

type CommentWithUser = Comment & { user: User };

const CommentList = ({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: string;
}) => {
  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");
  const { data: session } = useSession();
  const user = session?.user;
  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random().toString(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      user: {
        id: user.id,
        username: user?.username || null,
        name: "",
        email: "sending please wait",
        image: "",
        emailVerified: false,
        coverImage: "",
        bio: "",
        institution: "",
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        role: user.role,
        banned: null,
        banReason: null,
        banExpires: null,
        displayUsername: null,
        twoFactor: false,
      },
    });
    try {
      const createdComment = await addComment(postId, desc);
      setCommentState((prev) => [createdComment, ...prev]);
    } catch (err) {}
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state],
  );
  return (
    <>
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <UserAvatar user={{ name: user.name, image: user.image || null }} />
            <h5>{user.name}</h5>
          </div>
          <form
            action={add}
            className="flex w-full flex-1 items-center justify-between rounded-xl px-6 py-2 text-sm"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 bg-transparent outline-none"
              onChange={(e) => setDesc(e.target.value)}
            />
            <Smile className="size-6" />
          </form>
        </div>
      )}
      <div className="">
        {/* COMMENT */}
        {optimisticComments.map((comment) => (
          <div className="mt-6 flex justify-between gap-4" key={comment.id}>
            {/* AVATAR */}
            <UserAvatar user={comment.user} />
            {/* DESC */}
            <div className="flex flex-1 flex-col gap-2">
              <span className="font-medium">
                {comment.user.name && comment.user.name
                  ? comment.user.name
                  : comment.user.name}
              </span>
              <p>{comment.desc}</p>
              <div className="mt-2 flex items-center gap-8 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <ThumbsUp className="size-6" />
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">0 Likes</span>
                </div>
                <div className="">Reply</div>
              </div>
            </div>
            {/* ICON */}
            <Ellipsis className="size-6" />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentList;
