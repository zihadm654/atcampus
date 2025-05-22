import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

import Post from "./post";

const Feed = async ({ username }: { username?: string }) => {
  const user = await getCurrentUser();
  let posts: any[] = [];
  if (username) {
    posts = await prisma.post.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (!username && user?.username) {
    const following = await prisma.follower.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);
    const ids = [user.id, ...followingIds];

    posts = await prisma.post.findMany({
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  console.log(posts, "posts");
  return (
    <div className="flex flex-col gap-6 rounded-lg py-3">
      {posts.length
        ? posts.map((post) => <Post key={post.id} post={post} />)
        : "No posts found!"}
    </div>
  );
};

export default Feed;
