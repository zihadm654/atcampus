"use client";

import { useSession } from "@/lib/auth-client";

import { UserAvatar } from "../shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const ProfileCard = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user?.id) return null;

  return (
    <Card className="py-3">
      <CardContent className="flex items-center justify-start gap-2">
        <UserAvatar
          user={{
            name: user.name,
            username: user.displayUsername || null,
            image: user.image ?? null,
          }}
        />
        <div>
          <h2 className="font-bold">{user?.name}</h2>
          <p>@{user.username}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
