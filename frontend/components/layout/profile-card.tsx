"use client";

import { useSession } from "@/lib/auth-client";
import UserAvatar from "../UserAvatar";
import { Card, CardContent } from "../ui/card";

const ProfileCard = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user?.id) return null;

  return (
    <Card className="border-0 py-1 shadow-none">
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
