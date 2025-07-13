import { cache, Fragment } from "react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { formatDate } from "date-fns";
import { Star } from "lucide-react";

import {
  FollowerInfo,
  getJobDataInclude,
  getUserDataSelect,
  UserData,
} from "@/types/types";
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
import Job from "@/components/jobs/Job";
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
const getAppliedJobs = cache(async (userId: string) => {
  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      job: {
        include: getJobDataInclude(userId),
      },
      id: true, // Optionally include application id or other fields if needed
    },
  });
  return applications;
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
  const jobs = await getAppliedJobs(loggedInUser.id);
  return (
    <div className="w-full min-w-0 space-y-5">
      <UserProfile user={user} loggedInUserId={loggedInUser.id} />
      <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
        <Tabs defaultValue="overview">
          <div className="border-b border-gray-100">
            <TabsList className="flex w-full justify-between p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.home className="size-5" />
                <span className="hidden md:block">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.post className="size-5" />
                <span className="hidden md:block">Posts</span>
              </TabsTrigger>
              <TabsTrigger
                value={`${UserRole.INSTITUTION ? "schools" : "courses"}`}
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {UserRole.INSTITUTION ? (
                  <Fragment>
                    <Icons.school className="size-5" />
                    <span className="hidden md:block">Schools</span>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Icons.bookOpen className="size-5" />
                    <span className="hidden md:block">Courses</span>
                  </Fragment>
                )}
              </TabsTrigger>
              <TabsTrigger
                value={`${UserRole.INSTITUTION ? "clubs" : "jobs"}`}
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                {UserRole.INSTITUTION ? (
                  <Fragment>
                    <Icons.bookOpen className="size-5" />
                    <span className="hidden md:block">Clubs</span>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Icons.job className="size-5" />
                    <span className="hidden md:block">Job & Activities</span>
                  </Fragment>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="research"
                className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
              >
                <Icons.bookMarked className="size-5" />
                <span className="hidden md:block">Research</span>
              </TabsTrigger>
              {UserRole.INSTITUTION ? (
                <TabsTrigger
                  value="events"
                  className="flex-1 rounded-xl border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Icons.event className="size-5" />
                  <span className="hidden md:block">Events</span>
                </TabsTrigger>
              ) : null}
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-2 p-6">
            <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.skill className="size-7 pr-2" />
                    Skills
                  </CardTitle>
                  <CardAction>
                    <SkillButton user={user} />
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-1">
                  {user.userSkills.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <UserSkillList
                        skills={user.userSkills.map((skill) => ({
                          ...skill,
                          _count: { skillEndorsements: 0 },
                          skill: { category: null },
                        }))}
                        userId={user.id}
                      />
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
                <CardHeader className="flex items-center justify-between pb-2">
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
            </div>
            <div className="space-y-2">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.job className="mr-2 size-5" />
                    <span>Job & Activities</span>
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
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center">
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
                  )}
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
          </TabsContent>
          <TabsContent value="posts" className="mx-auto max-w-2xl p-6">
            <h2 className="mb-6 flex items-center text-xl font-medium">
              <Icons.post className="size-5" />
              {user.name}&apos;s posts
            </h2>
            <UserPosts userId={user.id} />
          </TabsContent>
          <TabsContent value="jobs" className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.job className="mr-3 size-5" />
                    <span>Job & Activities</span>
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
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="research" className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
                <CardHeader className="flex items-center justify-between pb-4">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Icons.bookMarked className="mr-3 size-5" />
                    <span>Research</span>
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
                <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                  {jobs.length > 0 ? (
                    jobs
                      .filter((item) => item.job)
                      .map((item) => <Job key={item.job.id} job={item.job} />)
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
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
      <div className="relative h-48 w-full">
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt="Cover Image"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400" />
        )}
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-black opacity-20 mix-blend-overlay" />

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
        <div className="absolute -top-16 left-6 rounded-full shadow-lg ring-4 ring-white max-sm:-top-30">
          <UserAvatar
            avatarUrl={user.image}
            size={120}
            className="rounded-full border-4 border-white"
          />
        </div>

        {/* Profile content with proper spacing for the avatar */}
        <div className="mt-4 pt-2">
          {/* Name and username with enhanced styling */}
          <div className="mb-4 pl-36 max-sm:pl-3">
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
          <div className="mb-6 flex items-center gap-6 rounded-xl p-3 pl-36 max-sm:pl-3">
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
                <Icons.info className="mr-2 size-6 text-green-600" />
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
                <Icons.edu className="mr-2 size-6 text-green-600" />
                <h3 className="font-medium">Academic Info</h3>
              </div>

              <div className="space-y-1">
                {user.institution && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-2">
                      <Icons.edu className="size-6 text-green-600" />
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
                      <Icons.card className="size-6 text-green-600" />
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
