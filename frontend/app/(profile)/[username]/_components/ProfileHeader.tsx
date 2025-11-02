import { formatDate } from "date-fns";
import Image from "next/image";
import FollowButton from "@/components/feed/FollowButton";
import FollowerCount from "@/components/feed/FollowerCount";
import Linkify from "@/components/feed/Linkify";
import { Icons } from "@/components/shared/icons";
import UserAvatar from "@/components/UserAvatar";
import { formatNumber } from "@/lib/utils";
import type { FollowerInfo, UserData } from "@/types/types";

import EditProfileButton from "./EditProfileButton";

interface ProfileHeaderProps {
  user: UserData;
  loggedInUserId: string;
  followerInfo: FollowerInfo;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  user,
  followerInfo,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <div className="h-fit w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      {/* Cover photo area with enhanced gradient */}
      <div className="relative h-56 w-full">
        {user.coverImage ? (
          <Image
            alt="Cover Image"
            className="object-cover"
            fill
            src={user.coverImage}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400" />
        )}
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-black opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative px-6 pb-2 max-md:px-2">
        {/* Avatar - positioned to overlap the cover photo with enhanced styling */}
        <div className="-top-16 max-sm:-top-30 absolute left-6 rounded-full shadow-lg ring-4 ring-white">
          <UserAvatar
            avatarUrl={user.image}
            className="rounded-full border-4 border-white"
            size={120}
          />
        </div>

        <div className="pt-2">
          {/* Name and username with enhanced styling */}
          <div className="flex items-center justify-between">
            <div className="mb-4 pl-36 max-sm:pl-3">
              <h1 className="font-bold text-2xl">{user.name}</h1>
              <h5 className="ml-2 gap-1 text-muted-foreground">
                <span>@{user.username}</span>
                {isOwnProfile && (
                  <span className="rounded-full px-2 py-0.5 text-blue-800 text-xs">
                    You
                  </span>
                )}
              </h5>
            </div>
            {/* Profile actions positioned on top right */}
            {isOwnProfile ? (
              <EditProfileButton user={user} />
            ) : (
              <FollowButton initialState={followerInfo} userId={user.id} />
            )}
          </div>

          {/* Stats row with enhanced styling */}
          <div className="space-between mb-2 flex items-center gap-6 rounded-xl p-1 pl-36 max-sm:pl-3">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700">
                {formatNumber(user._count.posts)}
              </span>
              <span className="text-muted-foreground text-sm">Posts</span>
            </div>
            <div className="h-10 w-px" />
            <FollowerCount initialState={followerInfo} userId={user.id} />
            <div className="h-10 w-px" />
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
                <p className="overflow-hidden whitespace-pre-line break-words">
                  {user.bio}
                </p>
              </Linkify>
            </div>
          ) : null}

          {/* Academic Information Section */}
          <AcademicInformation user={user} />
        </div>
      </div>
    </div>
  );
}

interface AcademicInformationProps {
  user: UserData;
}

function AcademicInformation({ user }: AcademicInformationProps) {
  const hasStudentInfo =
    user.institution || user.instituteId || user.currentSemester;
  const showAcademicSection =
    (hasStudentInfo && user.role === "STUDENT") || user.role === "PROFESSOR";

  if (showAcademicSection) {
    return (
      <div className="flex flex-col gap-2">
        <div className="mb-3 flex items-center">
          <Icons.edu className="mr-2 size-6 text-green-600" />
          <h3 className="font-medium text-muted-foreground">
            Academic Information
          </h3>
        </div>

        <div className="space-y-3">
          {/* Institution Info */}
          {user.institution && (
            <div className="flex items-center gap-2">
              <Icons.edu className="size-5 text-green-600" />
              <span className="font-medium">{user.institution}</span>
            </div>
          )}

          {/* Student ID */}
          {user.instituteId && (
            <div className="flex items-center gap-2">
              <Icons.card className="size-5 text-green-600" />
              <div>
                <span className="font-medium">{user.instituteId}</span>
                <p className="text-sm">
                  {user.role === "STUDENT" ? "Student Id" : "Professor Id"}
                </p>
              </div>
            </div>
          )}

          {/* Current Semester */}
          {user.currentSemester && (
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <Icons.bookOpen className="size-4 text-purple-600" />
              </div>
              <div>
                <span className="font-medium">
                  {user.currentSemester}th Semester
                </span>
                <p className="text-gray-500 text-sm">Current Semester</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show basic institution info for other roles
  if (user.institution) {
    return (
      <div className="mb-3 flex items-center">
        <Icons.edu className="size-6 text-green-600" />
        <span className="pl-2 font-medium">{user.institution}</span>
      </div>
    );
  }

  return null;
}
