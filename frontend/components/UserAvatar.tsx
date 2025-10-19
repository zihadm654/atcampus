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
      alt="User avatar"
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
      height={size ?? 48}
      src={avatarUrl || "/_static/avatars/shadcn.jpeg"}
      width={size ?? 48}
    />
  );
}
