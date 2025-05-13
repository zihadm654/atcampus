"use client";

import { addComment } from "@/actions/actions";
import { getCurrentUser } from "@/lib/session";
import { Comment, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { UserAvatar } from "../shared/user-avatar";
import { useSession } from "next-auth/react";
import { Ellipsis, Smile, ThumbsUp } from "lucide-react";
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
  const { data: session, status } = useSession();
  const user = session?.user as User;
  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random().toString(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id!,
      postId: postId,
      user:{
        id: user.id!,
        name: "",
        email: "sending please wait",
        image: "",
        emailVerified: null,
        coverImage: "",
        bio: "",
        website: "",
        institution: "",
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        role:"STUDENT"
      }
    });
    try {
      const createdComment = await addComment(postId, desc);
      setCommentState((prev) => [createdComment, ...prev]);
    } catch (err) {}
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
      {user && (
        <div className="flex items-center gap-4">
          <UserAvatar user={user} />
          <form
            action={add}
            className="flex-1 flex items-center justify-between rounded-xl text-sm px-6 py-2 w-full"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="bg-transparent outline-none flex-1"
              onChange={(e) => setDesc(e.target.value)}
            />
            <Smile className="size-6"/>
          </form>
        </div>
      )}
      <div className="">
        {/* COMMENT */}
        {optimisticComments.map((comment) => (
          <div className="flex gap-4 justify-between mt-6" key={comment.id}>
            {/* AVATAR */}
            <UserAvatar user={comment.user} />
            {/* DESC */}
            <div className="flex flex-col gap-2 flex-1">
              <span className="font-medium">
                {comment.user.name && comment.user.name
                  ? comment.user.name
                  : comment.user.name}
              </span>
              <p>{comment.desc}</p>
              <div className="flex items-center gap-8 text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-4">
                  <ThumbsUp className="size-6"/>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">0 Likes</span>
                </div>
                <div className="">Reply</div>
              </div>
            </div>
            {/* ICON */}
            <Ellipsis className="size-6"/>
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentList;
