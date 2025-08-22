import { cache } from "react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate } from "date-fns";

import {
  FollowerInfo,
  getJobDataInclude,
  getResearchDataInclude,
  getUserDataSelect,
  UserData,
} from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatNumber } from "@/lib/utils";
import FollowButton from "@/components/feed/FollowButton";
import FollowerCount from "@/components/feed/FollowerCount";
import Linkify from "@/components/feed/Linkify";
import { Icons } from "@/components/shared/icons";
import UserAvatar from "@/components/UserAvatar";

import EditProfileButton from "./_components/EditProfileButton";
import ProfileClient from "./_components/ProfileClient";

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
    select: {
      ...getUserDataSelect(loggedInUserId),
      schools: {
        include: {
          faculties: true,
        },
      },
      institution: true,
      clubs: true,
      events: true,
    },
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
      id: true,
    },
  });
  return applications;
});
// const getCourses = cache(async (userId: string) => {
//   const enrolled = await prisma.enrollment.findMany({
//     where: {
//       studentId: userId,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//     select: {
//       course: {
//         include: getUserDataSelect(userId),
//       },
//       id: true,
//     },
//   });
//   return enrolled;
// });
const getResearches = cache(async (loggedInUserId: string) => {
  const researches = await prisma.research.findMany({
    where: {
      userId: loggedInUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      ...getResearchDataInclude(loggedInUserId),
    },
  });
  return researches;
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
  const researches = await getResearches(loggedInUser.id);
  // const courses = await getEnrolledCourses(loggedInUser.id);
  // console.log(courses);
  return (
    <div className="w-full min-w-0 space-y-5">
      <UserProfile user={user} loggedInUserId={loggedInUser.id} />
      <ProfileClient
        user={user}
        jobs={jobs}
        researches={researches}
        // courses={courses}
        loggedInUserId={loggedInUser.id}
      />
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
      ({ followerId }) => followerId === loggedInUserId
    ),
  };
  return (
    <div className="bg-card h-fit w-full overflow-hidden rounded-2xl shadow-sm">
      {/* Cover photo area with enhanced gradient */}
      <div className="relative h-56 w-full">
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
      </div>

      <div className="relative px-6 pb-2">
        {/* Avatar - positioned to overlap the cover photo with enhanced styling */}
        <div className="absolute -top-16 left-6 rounded-full shadow-lg ring-4 ring-white max-sm:-top-30">
          <UserAvatar
            avatarUrl={user.image}
            size={120}
            className="rounded-full border-4 border-white"
          />
        </div>

        <div className="pt-2">
          {/* Name and username with enhanced styling */}
          <div className="flex items-center justify-between">
            <div className="mb-4 pl-36 max-sm:pl-3">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <h5 className="text-muted-foreground gap-1 ml-2">
                <span>@{user.username}</span>
                {user.id === loggedInUserId && (
                  <span className="rounded-full px-2 py-0.5 text-xs text-blue-800">
                    You
                  </span>
                )}
              </h5>
            </div>
            {/* Profile actions positioned on top right */}
            <div className="">
              {user.id === loggedInUserId ? (
                <EditProfileButton user={user} />
              ) : (
                <FollowButton userId={user.id} initialState={followerInfo} />
              )}
            </div>
          </div>

          {/* Stats row with enhanced styling */}
          <div className="mb-2 flex items-center space-between gap-6 rounded-xl p-1 pl-36 max-sm:pl-3">
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
            <div className="py-2">
              <div className="mb-2 flex items-center">
                <Icons.info className="mr-2 size-6 text-green-600" />
                <h3 className="font-medium text-muted-foreground">About</h3>
              </div>
              <Linkify>
                <p className="overflow-hidden break-words whitespace-pre-line">
                  {user.bio}
                </p>
              </Linkify>
            </div>
          ) : null}

          {((user.institution || user.instituteId || user.currentSeamster) &&
            user.role === "STUDENT") ||
          user.role === "PROFESSOR" ? (
            <div className="flex flex-col gap-2">
              <div className="mb-3 flex items-center">
                <Icons.edu className="mr-2 size-6 text-green-600" />
                <h3 className="font-medium text-muted-foreground">
                  Academic Info
                </h3>
              </div>

              <div className="space-y-1">
                {user.institution && (
                  <div className="flex items-center gap-2">
                    <Icons.edu className="size-6 text-green-600" />
                    <span className="font-medium">{user.institution}</span>
                  </div>
                )}

                {user.instituteId && (
                  <div className="flex items-center gap-2">
                    <Icons.card className="size-6 text-green-600" />
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
          ) : (
            <div className="flex flex-col gap-2 py-2">
              <div className="mb-3 flex items-center">
                <Icons.edu className="mr-2 size-6 text-green-600" />
                <h3 className="font-medium text-muted-foreground">
                  Institution Info
                </h3>
              </div>

              {user.institution && (
                <div className="flex items-center gap-2">
                  <Icons.edu className="size-6 text-green-600" />
                  <span className="font-medium">{user.institution}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
