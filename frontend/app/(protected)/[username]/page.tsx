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
import Linkify from "@/components/feed/Linkify";
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="posts"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="courses"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Skills
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Skills
                    </CardTitle>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        <span>See More</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 h-8 w-8 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        No skills added yet
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-green-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      </svg>
                      Courses
                    </CardTitle>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-800"
                      >
                        <span>See More</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 h-8 w-8 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                        </svg>
                        No courses enrolled
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                  <CardHeader className="flex items-center justify-between pb-4">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-amber-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Achievements
                    </CardTitle>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                      >
                        <span>See More</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 h-8 w-8 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        No achievements yet
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 flex items-center text-lg font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Job & Activities
                </h3>
                <div className="flex items-center justify-center rounded-xl border border-gray-100 p-8 text-gray-500 shadow-sm">
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-3 h-12 w-12 text-gray-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    <p>No job or activities added yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Experience
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="posts" className="p-6">
              <h2 className="mb-6 flex items-center text-xl font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                    clipRule="evenodd"
                  />
                </svg>
                {user.name}&apos;s posts
              </h2>
              <UserPosts userId={user.id} />
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
        <div className="mt-4 pt-16">
          {/* Name and username with enhanced styling */}
          <div className="mb-4">
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
          <div className="mb-6 flex items-center gap-6 rounded-xl p-3">
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
            <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
                <h3 className="font-medium">Education</h3>
              </div>

              <div className="space-y-3">
                {user.institution && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
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
                      <span className="font-medium text-gray-700">
                        {user.instituteId}
                      </span>
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
                      <span className="font-medium text-gray-700">
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
