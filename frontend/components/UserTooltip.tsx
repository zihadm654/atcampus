"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useSession } from "@/lib/auth-client";
import type { FollowerInfo, UserData } from "@/types/types";

import FollowButton from "./feed/FollowButton";
import FollowerCount from "./feed/FollowerCount";
import Linkify from "./feed/Linkify";
import { UserAvatar } from "./shared/user-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const { data: session } = useSession();
  const loggedInUser = session?.user;
  const followerState: FollowerInfo = {
    followers: user?._count?.followers || 0,
    isFollowedByUser: !!user?.followers?.some(
      ({ followerId }) => followerId === loggedInUser?.id
    ),
  };
  if (!user) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/${user.username}`}>
                <UserAvatar user={user} />
              </Link>
              {loggedInUser?.id !== user.id && (
                <FollowButton initialState={followerState} userId={user.id} />
              )}
            </div>
            <div>
              <Link href={`/${user.username}`}>
                <div className="font-semibold text-lg hover:underline">
                  {user.displayUsername}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}
            {user._count && (
              <FollowerCount initialState={followerState} userId={user.id} />
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
