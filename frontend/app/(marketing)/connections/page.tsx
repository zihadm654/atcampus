import Link from "next/link";

import { getUserDataSelect } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FollowButton from "@/components/feed/FollowButton";
import UserTooltip from "@/components/UserTooltip";

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
  });

  return (
    <div className="w-full space-y-5 rounded-2xl p-2 shadow-sm">
      <h1 className="text-xl font-bold">Who to follow</h1>
      <div className="grid grid-cols-5 gap-4 rounded-2xl max-md:grid-cols-2">
        {usersToFollow.map((user) => (
          <Card key={user.id}>
            <CardContent>
              <UserTooltip user={user}>
                <Link
                  href={`/${user.username}`}
                  className="flex items-center gap-3"
                >
                  <CardTitle>
                    <p className="font-semibold hover:underline">{user.name}</p>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </CardTitle>
                </Link>
              </UserTooltip>
            </CardContent>
            <CardFooter>
              <FollowButton
                userId={user.id}
                initialState={{
                  followers: user._count.followers,
                  isFollowedByUser: user.followers.some(
                    ({ followerId }) => followerId === user.id,
                  ),
                }}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default WhoToFollow;
