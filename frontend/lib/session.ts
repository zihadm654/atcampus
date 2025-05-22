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
