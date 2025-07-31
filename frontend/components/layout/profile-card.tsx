"use client";

import { useSession } from "@/lib/auth-client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import UserAvatar from "../UserAvatar";

const ProfileCard = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user?.id) return null;

  return (
    <Card className="border-0 shadow-none py-1">
      <CardContent className="flex items-center justify-start gap-2">
        <UserAvatar avatarUrl={user.image ?? null} size={40} />
        <div className="hidden lg:block">
          <h2 className="font-bold">{user?.name}</h2>
          <p>@{user.username}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
