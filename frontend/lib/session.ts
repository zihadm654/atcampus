import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import type { ExtendedUser } from "@/types/auth-types";
import { auth } from "./auth";

export const getCurrentUser = cache(
  async (): Promise<ExtendedUser | undefined> => {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return;
    }

    // Cast to our extended user type
    return session.user as ExtendedUser;
  },
);

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
  const now = Date.now(); // Current time in milliseconds since January 1, 1970 00:00:00 UTC
  const expiresAt = new Date(session.expiresAt).getTime(); // getTime() returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
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

// Optimized session retrieval with caching
export const getSession = getCurrentSession;

// Lightweight role/status check for server components
export const getUserRoleAndStatus = cache(async () => {
  const session = await getCurrentSession();

  if (!session?.user) return null;

  const user = session.user as ExtendedUser;

  return {
    role: user.role,
    status: user.status,
    user,
  };
});

// Permission check utilities
export const hasRole = cache(
  async (allowedRoles: ExtendedUser["role"][]): Promise<boolean> => {
    const user = await getCurrentUser();
    return user ? allowedRoles.includes(user.role) : false;
  },
);

export const hasAnyRole = cache(
  async (allowedRoles: ExtendedUser["role"][]): Promise<boolean> => {
    const user = await getCurrentUser();
    return user ? allowedRoles.includes(user.role) : false;
  },
);

export const hasActiveStatus = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.status === "ACTIVE";
});

export const isUserApproved = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user ? user.status === "ACTIVE" || user.status === "SUSPENDED" : false;
});

export const isUserPending = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.status === "PENDING";
});

export const isUserRejected = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.status === "REJECTED";
});

export const canCreateOrganizations = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user
    ? user.role === "INSTITUTION" || user.role === "ORGANIZATION"
    : false;
});

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
});

export const canReviewCourses = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user ? user.role === "ADMIN" || user.role === "PROFESSOR" : false;
});
