import Post from "./post";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
const Feed = async ({ id }: { id?: string }) => {
  const user = await getCurrentUser()
  let posts:any[]=[]
  if (id) {
    posts = await prisma.post.findMany({
      where: {
        user: {
          id: id,
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

  if (!id && user?.id) {
    const following = await prisma.follower.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);
    const ids = [user.id,...followingIds]

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
  console.log(posts,"posts")
  return (
    <div className="rounded-lg py-3 flex flex-col gap-6">
      {posts.length ? (posts.map((post)=>(
        <Post key={post.id} post={post} />
      ))) : "No posts found!"}
    </div>
  );
};

export default Feed;
