import Image from "next/image";
import Link from "next/link";
import { User } from "@/generated/prisma";
import { Calendar } from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

import UpdateUser from "./updateUser";
import UserInfoCardInteraction from "./userInfoCardInteraction";

const UserInfoCard = async ({ user }: { user: User }) => {
  const createdAtDate = new Date(user.createdAt);

  const formattedDate = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let isUserBlocked = false;
  let isFollowing = false;
  let isFollowingSent = false;

  const session = await getCurrentUser();

  if (session) {
    const blockRes = await prisma.block.findFirst({
      where: {
        blockerId: session.id,
        blockedId: user.id,
      },
    });

    blockRes ? (isUserBlocked = true) : (isUserBlocked = false);
    const followRes = await prisma.follower.findFirst({
      where: {
        followerId: session.id,
        followingId: user.id,
      },
    });

    followRes ? (isFollowing = true) : (isFollowing = false);
    const followReqRes = await prisma.followRequest.findFirst({
      where: {
        senderId: session.id,
        receiverId: user.id,
      },
    });

    followReqRes ? (isFollowingSent = true) : (isFollowingSent = false);
  }
  return (
    <div className="flex flex-col gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* TOP */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-500">User Information</span>
        {session?.id === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <Link href="/" className="text-xs text-blue-500">
            See all
          </Link>
        )}
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col gap-4 text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {" "}
            {user.name && user.username ? user.name : user.username}
          </span>
          <span className="text-sm">@{user.username}</span>
        </div>
        {user.bio && <p>{user.bio}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="size-4" />
            <span>Joined {formattedDate}</span>
          </div>
        </div>
        {session?.id && session?.id !== user.id && (
          <UserInfoCardInteraction
            userId={user.id}
            isUserBlocked={isUserBlocked}
            isFollowing={isFollowing}
            isFollowingSent={isFollowingSent}
          />
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
