import { Loader2 } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatNumber } from "@/lib/utils";
import { getUserDataSelect } from "@/types/types";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import FollowButton from "./FollowButton";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[4.5rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const user = await getCurrentUser();

  if (!user) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 3,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="font-bold text-xl">Who to follow</div>
      {usersToFollow.map((user) => (
        <div className="flex items-center justify-between gap-3" key={user.id}>
          <UserTooltip user={user}>
            <Link
              className="flex items-center gap-3"
              href={`/${user.username}`}
            >
              <UserAvatar
                avatarUrl={user.image}
                className="hidden sm:inline"
                size={40}
              />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.name}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id
              ),
            }}
            userId={user.id}
          />
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = (await prisma.post.aggregateRaw({
      pipeline: [
        {
          $project: {
            hashtags: {
              $regexFindAll: {
                input: "$content",
                regex: "#[a-zA-Z0-9_]+",
              },
            },
          },
        },
        { $unwind: "$hashtags" },
        {
          $group: {
            _id: { $toLower: "$hashtags.match" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            hashtag: "$_id",
            count: "$count",
          },
        },
      ],
    })) as unknown as { hashtag: string; count: number }[];

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  }
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="font-bold text-xl">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link className="block" href={`/hashtag/${title}`} key={title}>
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
