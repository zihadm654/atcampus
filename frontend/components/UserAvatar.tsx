import Image from "next/image";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || "/_static/avatars/shadcn.jpeg"}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "bg-secondary aspect-square h-fit flex-none rounded-full object-cover",
        className
      )}
    />
  );
}
