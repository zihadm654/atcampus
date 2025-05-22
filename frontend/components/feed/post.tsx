import { Suspense } from "react";
import Image from "next/image";
import { Post as PostType, User } from "@/generated/prisma";

import { getCurrentUser } from "@/lib/session";

import BlurImage from "../shared/blur-image";
import { UserAvatar } from "../shared/user-avatar";
import Comments from "./comments";
import PostInfo from "./postInfo";
import PostInteraction from "./postInteraction";

type FeedPostType = PostType & { user: User } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};

const Post = async ({ post }: { post: FeedPostType }) => {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col gap-4 rounded-md p-2 shadow">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <UserAvatar
            user={{
              name: post.user?.username || post.user?.name!,
              image: post.user?.image || null,
            }}
          />
          <h5>{post.user?.name}</h5>
        </div>
        {user?.id === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        {post.img && (
          <div className="relative min-h-96 w-full">
            <BlurImage
              src={post.img}
              fill
              className="rounded-md object-cover"
              alt={post.id}
            />
          </div>
        )}
        <p>{post.desc}</p>
      </div>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
        />
      </Suspense>
      <Suspense fallback="Loading...">
        <Comments postId={post.id} />
      </Suspense>
    </div>
  );
};

export default Post;
