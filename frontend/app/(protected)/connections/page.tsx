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
import BlurImage from "@/components/shared/blur-image";
import UserTooltip from "@/components/UserTooltip";

async function Connections() {
  const user = await getCurrentUser();

  if (!user) return null;

  const connections = await prisma.user.findMany({
    where: {
      // Fetch users that the current user is following
      followers: {
        some: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
  });
  // console.log(connections, "connections"); // You might want to keep or remove this for debugging
  return (
    <div className="w-full space-y-5 rounded-2xl p-2 px-4 shadow-sm">
      <h1 className="text-xl font-bold">Following</h1> {/* Updated Title */}
      <div className="grid grid-cols-3 gap-4 rounded-2xl max-md:grid-cols-2">
        {connections?.map(
          (
            connectionUser, // Renamed user to connectionUser for clarity
          ) => (
            <Card className="pt-0" key={connectionUser.id}>
              <BlurImage
                src={connectionUser.image || "/_static/avatars/shadcn.jpeg"}
                width={50}
                height={50}
                alt={connectionUser.name}
                className="h-36 w-full object-cover"
              />
              <CardContent className="max-md:px-3">
                <UserTooltip user={connectionUser}>
                  <Link
                    href={`/${connectionUser.username}`}
                    className="flex items-center gap-3"
                  >
                    <CardTitle>
                      <p className="font-semibold hover:underline">
                        {connectionUser.name}
                      </p>
                      <p className="text-muted-foreground">
                        @{connectionUser.username}
                      </p>
                    </CardTitle>
                  </Link>
                </UserTooltip>
              </CardContent>
              <CardFooter>
                <FollowButton
                  userId={connectionUser.id}
                  initialState={{
                    followers: connectionUser._count.followers,
                    // Since this list is users the current user is following,
                    // isFollowedByUser should be true.
                    isFollowedByUser: true,
                  }}
                />
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

export default Connections;
