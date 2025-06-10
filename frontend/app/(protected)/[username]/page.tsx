import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate } from "date-fns";

import { FollowerInfo, getUserDataSelect, UserData } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowButton from "@/components/feed/FollowButton";
import FollowerCount from "@/components/feed/FollowerCount";
import ForYouFeed from "@/components/feed/ForYouFeed";
import Linkify from "@/components/feed/Linkify";
import TrendsSidebar from "@/components/feed/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";

import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.name} (@${user.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="bg-card rounded-2xl p-2 shadow-sm">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    <CardAction>
                      <Button variant="link">See More</Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <h2>No Content yet</h2>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Courses</CardTitle>
                    <CardAction>
                      <Button variant="link">See More</Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <h2>No Content yet</h2>
                  </CardContent>
                </Card>
                <Label className="col-span-2 text-xl">Job & Activities</Label>
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Demo</CardTitle>
                    <CardAction>
                      <Button variant="link">See More</Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <h2>No Content yet</h2>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="posts">
              <h2 className="text-center text-xl font-bold">
                {user.name}&apos;s posts
              </h2>
              <UserPosts userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="bg-card h-fit w-full space-y-5 rounded-2xl p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.image}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden break-words whitespace-pre-line">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
