"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { formatNumber } from "@/lib/utils";
import type { FollowerInfo } from "@/types/types";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span className="flex flex-col items-center text-muted-foreground">
      <span className="font-semibold text-blue-700">
        {formatNumber(data.followers)}
      </span>
      Followers
    </span>
  );
}
