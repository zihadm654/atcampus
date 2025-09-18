import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/", "/dashboard", "/admin", "/jobs", "/reserches", "/bookmarks", "/messages", "/notifications", "/dashboard/settings"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = await getSessionCookie(req);

  const isLoggedIn = !!sessionCookie;
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  );
  const isAuthRoute = authRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  );

  // Handle unauthenticated access to protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // All other cases: proceed normally
  // Role/status validation is handled server-side for better performance
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};