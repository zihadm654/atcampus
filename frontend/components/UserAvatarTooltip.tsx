"use client";

import type { UserData } from "@/types/types";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

interface UserAvatarTooltipProps {
    user: UserData;
    avatarUrl: string | null | undefined;
    size?: number;
    className?: string;
}

export default function UserAvatarTooltip({
    user,
    avatarUrl,
    size,
    className,
}: UserAvatarTooltipProps) {
    return (
        <UserTooltip user={user}>
            <div className="relative inline-block">
                <UserAvatar
                    avatarUrl={avatarUrl}
                    className={className}
                    size={size}
                />
            </div>
        </UserTooltip>
    );
}