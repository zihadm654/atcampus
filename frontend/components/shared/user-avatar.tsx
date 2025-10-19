import type { User } from "@prisma/client";
import type { AvatarProps } from "@radix-ui/react-avatar";
import { Icons } from "@/components/shared/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "image" | "name" | "username">;
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage
          alt="Picture"
          referrerPolicy="no-referrer"
          src={user.image || "/_static/avatars/shadcn.jpeg"}
        />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name || user.username}</span>
          <Icons.user className="size-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
