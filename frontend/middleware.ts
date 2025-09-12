import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/", "/dashboard", "/admin", "/jobs", "/reserches", "/bookmarks", "/messages", "/notifications", "/dashboard/settings"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = await getSessionCookie(req);
  const res = NextResponse.next();

  const isLoggedIn = !!sessionCookie;
  const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  const isOnAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  // Redirect unauthenticated users trying to access protected routes
  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from auth routes
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check user status for authenticated users on protected routes
  if (isLoggedIn && isOnProtectedRoute) {
    try {
      // Use a lightweight API endpoint to validate session
      // This avoids importing the full auth module which requires argon2
      const response = await fetch(new URL("/api/session/validate", req.url), {
        headers: {
          "cookie": req.headers.get("cookie") || "",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const { role, status } = userData;

        // Apply status-based access control for ORGANIZATION and INSTITUTION roles
        if ((role === "ORGANIZATION" || role === "INSTITUTION") && status !== "ACTIVE") {
          if (status === "PENDING") {
            return NextResponse.redirect(new URL("/pending-approval", req.url));
          } else if (status === "REJECTED") {
            return NextResponse.redirect(new URL("/rejected-account", req.url));
          }
        }
      } else {
        // If session validation fails, redirect to login
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch (error) {
      console.error("Error checking user status in middleware:", error);
      // In case of error, redirect to login to be safe
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};