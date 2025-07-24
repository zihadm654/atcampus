"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { UserData } from "@/types/types";
import kyInstance from "@/lib/ky";

import UserTooltip from "./UserTooltip";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export default function UserLinkWithTooltip({
  children,
  username,
}: UserLinkWithTooltipProps) {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link href={`/${username}`} className="text-primary hover:underline">
        {children}
      </Link>
    );
  }

  return (
    <UserTooltip user={data}>
      <Link href={`/${username}`} className="text-primary hover:underline">
        {children}
      </Link>
    </UserTooltip>
  );
}
