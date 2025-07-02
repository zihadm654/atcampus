import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate } from "date-fns";
import { CalendarRange, Star } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowButton from "@/components/feed/FollowButton";
import FollowerCount from "@/components/feed/FollowerCount";
import Linkify from "@/components/feed/Linkify";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";
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
    <>
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
          <Tabs defaultValue="overview">
            <div className="border-b border-gray-100">
              <TabsList className="flex w-full justify-between p-0">
                <TabsTrigger
                  value="overview"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.home className="size-5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="posts"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.post className="size-5" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="courses"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.bookOpen className="size-5" />
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <CalendarRange className="size-5" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.skill className="size-5" />
                  Skills
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <Icons.skill className="size-7 pr-2" />
                      Skills
                    </CardTitle>
                    <CardAction>
                      <SkillButton user={user} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {user.userSkills.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto">
                        {/* @ts-expect-error Server Component */}
                        <UserSkillList skills={user.userSkills} userId={user.id} />
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                        <div className="flex flex-col items-center">
                          <Icons.skill className="size-10" />
                          No skills added yet
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <Icons.bookOpen className="size-7 pr-2" />
                      Courses
                    </CardTitle>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
                      >
                        <span>See More</span>
                        <Icons.chevronRight className="size-5" />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <Icons.bookOpen className="size-10" />
                        No courses enrolled
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <Star className="size-7 pr-2" />
                      Achievements
                    </CardTitle>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                      >
                        <span>See More</span>
                        <Icons.chevronRight className="size-5" />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <Star className="size-10" />
                        No achievements yet
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 flex items-center text-lg font-medium">
                  <Icons.job className="size-5" />
                  Job & Activities
                </h3>
                <div className="flex items-center justify-center rounded-xl border border-gray-100 p-8 text-gray-500 shadow-sm">
                  <div className="flex flex-col items-center">
                    <Icons.job className="size-10" />
                    <p>No job or activities added yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-full"
                    >
                      <Icons.add className="size-4" />
                      Add Experience
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="posts" className="mx-auto max-w-2xl p-6">
              <h2 className="mb-6 flex items-center text-xl font-medium">
                <Icons.post className="size-5" />
                {user.name}&apos;s posts
              </h2>
              <UserPosts userId={user.id} />
            </TabsContent>
            <TabsContent value="skills" className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <Icons.skill className="size-7 pr-2" />
                      Skills
                    </CardTitle>
                    <CardAction>
                      <SkillButton user={user} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {user.userSkills.length > 0 ? (
                      <div className="space-y-4">
                        {/* @ts-expect-error Server Component */}
                        <UserSkillList skills={user.userSkills} userId={user.id} />
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                        <div className="flex flex-col items-center">
                          <Icons.skill className="size-10" />
                          No skills added yet
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
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
    <div className="bg-card h-fit w-full overflow-hidden rounded-2xl shadow-sm">
      {/* Cover photo area with enhanced gradient */}
      <div className="relative h-48 w-full bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 20 L40 20 M20 0 L20 40"
                  stroke="white"
                  strokeWidth="1"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        {/* Profile actions positioned on top right */}
        <div className="absolute top-4 right-4 z-10">
          {user.id === loggedInUserId ? (
            <EditProfileButton user={user} />
          ) : (
            <FollowButton userId={user.id} initialState={followerInfo} />
          )}
        </div>
      </div>

      {/* Profile info section */}
      <div className="relative px-6 pb-6">
        {/* Avatar - positioned to overlap the cover photo with enhanced styling */}
        <div className="absolute -top-16 left-6 rounded-full shadow-lg ring-4 ring-white">
          <UserAvatar
            avatarUrl={user.image}
            size={120}
            className="rounded-full border-4 border-white"
          />
        </div>

        {/* Profile content with proper spacing for the avatar */}
        <div className="mt-4 pt-2">
          {/* Name and username with enhanced styling */}
          <div className="mb-4 pl-36">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <h5 className="text-muted-foreground flex items-center gap-1">
              <span>@{user.username}</span>
              {user.id === loggedInUserId && (
                <span className="rounded-full px-2 py-0.5 text-xs text-blue-800">
                  You
                </span>
              )}
            </h5>
          </div>

          {/* Stats row with enhanced styling */}
          <div className="mb-6 flex items-center gap-6 rounded-xl p-3 pl-36">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700">
                {formatNumber(user._count.posts)}
              </span>
              <span className="text-muted-foreground text-sm">Posts</span>
            </div>
            <div className="h-10 w-px"></div>
            <FollowerCount userId={user.id} initialState={followerInfo} />
            <div className="h-10 w-px"></div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700">
                {formatDate(user.createdAt, "yyyy")}
              </span>
              <span className="text-muted-foreground text-sm">Joined</span>
            </div>
          </div>

          {/* Bio section with enhanced styling */}
          {user.bio ? (
            <div className="mb-6 rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="font-medium">About</h3>
              </div>
              <Linkify>
                <p className="overflow-hidden break-words whitespace-pre-line text-gray-700">
                  {user.bio}
                </p>
              </Linkify>
            </div>
          ) : null}

          {/* Education info with enhanced styling */}
          {(user.institution || user.instituteId || user.currentSeamster) && (
            <div className="flex flex-col gap-2 rounded-xl border border-gray-100 px-4 py-2 shadow-sm">
              <div className="mb-3 flex items-center">
                <Icons.edu className="mr-2 size-7 text-green-600" />
                <h3 className="font-medium">Education</h3>
              </div>

              <div className="space-y-1">
                {user.institution && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-2">
                      <Icons.edu className="size-7" />
                    </div>
                    <div>
                      <span className="font-medium">{user.institution}</span>
                      <p className="text-sm">Institution</p>
                    </div>
                  </div>
                )}

                {user.instituteId && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">{user.instituteId}</span>
                      <p className="text-sm text-gray-500">Student ID</p>
                    </div>
                  </div>
                )}

                {user.currentSeamster && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">
                        {user.currentSeamster}th Semester
                      </span>
                      <p className="text-sm text-gray-500">Current Semester</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
