import Image from "next/image";
import { Post as PostType, User } from "@prisma/client";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import PostInfo from "./postInfo";
import PostInteraction from "./postInteraction";
import Comments from "./comments";
import { UserAvatar } from "../shared/user-avatar";
import BlurImage from "../shared/blur-image";
import { ExtendedUser } from "@/types/next-auth";

type FeedPostType = PostType & { user: ExtendedUser } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};

const Post = async({ post }: { post: FeedPostType }) => {
  const user = await getCurrentUser();
  return (
    <div className="flex flex-col gap-4 p-2 shadow rounded-md">
      {/* USER */}
      <div className="flex items-center justify-between">
        <UserAvatar user={user!}/>
        {user?.id === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        {post.img && (
          <div className="w-full min-h-96 relative">
            <BlurImage
              src={post.img}
              fill
              className="object-cover rounded-md"
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
