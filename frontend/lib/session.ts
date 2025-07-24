import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "./auth";

export const getCurrentUser = cache(async () => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    return undefined;
  }
  return session.user;
});

export const getCurrentSession = cache(async () => {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session;
});

export const isSessionExpired = (
  session: { expiresAt: Date } | null,
): boolean => {
  if (!session) return true;
  return new Date() > new Date(session.expiresAt);
};

export const getSessionTimeRemaining = (
  session: { expiresAt: Date } | null,
): number => {
  if (!session) return 0;
  const now = new Date().getTime();
  const expiresAt = new Date(session.expiresAt).getTime();
  return Math.max(0, expiresAt - now);
};

export const isSessionExpiringSoon = (
  session: { expiresAt: Date } | null,
  thresholdMinutes = 30,
): boolean => {
  if (!session) return false;
  const timeRemaining = getSessionTimeRemaining(session);
  const thresholdMs = thresholdMinutes * 60 * 1000;
  return timeRemaining > 0 && timeRemaining <= thresholdMs;
};
