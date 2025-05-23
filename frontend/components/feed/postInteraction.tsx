"use client";

import { switchLike } from "@/actions/actions";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useOptimistic, useState } from "react";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
}: {
  postId: string;
  likes: string[];
  commentNumber: number;
}) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: user?.id ? likes.includes(user.id) : false,
  });

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state, value) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      };
    }
  );

  const likeAction = async () => {
    switchOptimisticLike("");
    try {
      switchLike(postId);
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {}
  };
  return (
    <div className="flex items-center justify-between text-sm my-4">
      <div className="flex gap-8">
        <div className="flex items-center gap-4 p-2 rounded-xl">
          <form action={likeAction}>
            <button>
              {optimisticLike.isLiked ?<ThumbsUp className="size-6"/>:<ThumbsUp className="size-6"/>}              
            </button>
          </form>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {optimisticLike.likeCount}
            <span className="hidden md:inline"> Likes</span>
          </span>
        </div>
        <div className="flex items-center gap-4 p-2 rounded-xl">
          <MessageCircle className="size-6" />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {commentNumber}<span className="hidden md:inline"> Comments</span>
          </span>
        </div>
      </div>
      <div className="">
        <div className="flex items-center gap-4 p-2 rounded-xl">
          <Share2 className="size-6" />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <span className="hidden md:inline"> Share</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostInteraction;
