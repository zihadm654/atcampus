import Link from "next/link";
import FollowButton from "@/components/feed/FollowButton";
import UserTooltip from "@/components/UserTooltip";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";
import UserAvatar from "@/components/UserAvatar";

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

  if (connections.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-card p-12 shadow-sm">
        <div className="mb-4 text-5xl">👥</div>
        <h2 className="mb-2 text-center font-bold text-2xl">No Connections Yet</h2>
        <p className="mb-6 text-center text-muted-foreground">
          You're not following anyone yet. Start connecting with others!
        </p>
        <Button asChild>
          <Link href="/search">Find People to Follow</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Following</h1>
        <p className="text-muted-foreground">
          {connections.length} connection{connections.length !== 1 ? "s" : ""}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections?.map((connectionUser) => (
          <Card 
            className="overflow-hidden transition-all duration-300 hover:shadow-lg" 
            key={connectionUser.id}
          >
            {/* Profile Picture as Main Visual Element */}
            <div className="flex justify-center p-2">
              <UserTooltip user={connectionUser}>
                <Link href={`/${connectionUser.username}`}>
                  <div className="relative">
                    <UserAvatar 
                      avatarUrl={connectionUser.image}
                      className="size-24 rounded-full ring-4 ring-primary/10 transition-transform duration-300 hover:scale-105"
                      size={96}
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                  </div>
                </Link>
              </UserTooltip>
            </div>
            
            {/* User Information */}
            <CardContent className="p-2 text-center">
              <UserTooltip user={connectionUser}>
                <Link href={`/${connectionUser.username}`}>
                  <h3 className="font-bold text-xl truncate hover:underline">
                    {connectionUser.name}
                  </h3>
                </Link>
              </UserTooltip>
              <p className="text-muted-foreground mb-3 truncate">
                @{connectionUser.username}
              </p>
              
              {/* User Stats */}
              <div className="flex justify-center gap-3 text-sm">
                <div className="text-center">
                  <p className="font-bold text-foreground">
                    {connectionUser._count.followers}
                  </p>
                  <p className="text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">
                    {connectionUser._count.following}
                  </p>
                  <p className="text-muted-foreground">Following</p>
                </div>
              </div>
            </CardContent>
            
            {/* Follow Button */}
            <CardFooter className="p-1 flex items-center justify-center gap-2">
                <FollowButton
                  initialState={{
                    followers: connectionUser._count.followers,
                    // Since this list is users the current user is following,
                    // isFollowedByUser should be true.
                    isFollowedByUser: true,
                  }}
                  userId={connectionUser.id}
                />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Connections;