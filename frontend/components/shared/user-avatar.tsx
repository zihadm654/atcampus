import { AvatarProps } from "@radix-ui/react-avatar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/shared/icons"
import { ExtendedUser } from "@/types/next-auth"

interface UserAvatarProps extends AvatarProps {
  user: Pick<ExtendedUser, "image" | "name">
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt="Picture" src={user.image} referrerPolicy="no-referrer" />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Icons.user className="size-4" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
