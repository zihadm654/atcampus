import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

const protectedRoutes = ["/", "/dashboard", "/admin/dashboard", "/users"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = await getSessionCookie(req);
//   const session = await auth.api.getSession({
//     headers: await headers()
// })

// if(!session) {
//     return NextResponse.redirect(new URL("/login", req.url));
// }

  const res = NextResponse.next();

  const isLoggedIn = !!sessionCookie;
  const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  const isOnAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // if (isLoggedIn && session.user.status === "PENDING") {
  //   return NextResponse.redirect(new URL("/pending-approval",req.url))
  // }
  // if (isOnAuthRoute && isLoggedIn && session.user.status === "REJECTED") {
  //   return NextResponse.redirect(new URL("/rejected-account",req.url))
  // }
  return res;
}

export const config = {
  // runtime:"nodejs",
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
