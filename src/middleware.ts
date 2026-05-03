import { NextRequest, NextResponse } from "next/server";

// The cookie name set by the backend on login. Check the Set-Cookie response
// header in the Network tab when logging in to confirm this value.
const SESSION_COOKIE_NAME = "token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the portal root pages (login/signup entry points)
  if (
    pathname === "/admin" ||
    pathname === "/company" ||
    pathname === "/attendee" ||
    pathname === "/member" ||
    pathname === "/moderator"
  ) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path+",
    "/company/:path+",
    "/attendee/:path+",
    "/member/:path+",
    "/moderator/:path+",
  ],
};
