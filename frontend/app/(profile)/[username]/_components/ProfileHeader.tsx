import Image from "next/image";
import { formatDate } from "date-fns";

import { FollowerInfo, UserData } from "@/types/types";
import { formatNumber } from "@/lib/utils";
import FollowButton from "@/components/feed/FollowButton";
import FollowerCount from "@/components/feed/FollowerCount";
import Linkify from "@/components/feed/Linkify";
import { Icons } from "@/components/shared/icons";
import UserAvatar from "@/components/UserAvatar";

import EditProfileButton from "./EditProfileButton";

interface ProfileHeaderProps {
  user: UserData;
  loggedInUserId: string;
  followerInfo: FollowerInfo;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  user,
  loggedInUserId,
  followerInfo,
  isOwnProfile,
}: ProfileHeaderProps) {
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
                {isOwnProfile && (
                  <span className="rounded-full px-2 py-0.5 text-xs text-blue-800">
                    You
                  </span>
                )}
              </h5>
            </div>
            {/* Profile actions positioned on top right */}
            <div className="">
              {isOwnProfile ? (
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
                <p className="text-sm text-gray-500">Student ID</p>
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
                <p className="text-sm text-gray-500">Current Semester</p>
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
      <div className="flex flex-col gap-2 py-2">
        <div className="mb-3 flex items-center">
          <Icons.edu className="mr-2 size-6 text-green-600" />
          <h3 className="font-medium text-muted-foreground">
            Institution Info
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Icons.edu className="size-6 text-green-600" />
          <span className="font-medium">{user.institution}</span>
        </div>
      </div>
    );
  }

  return null;
}