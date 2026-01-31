import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const isWaitlistEnabled = process.env.WAITLIST_ENABLED === "true";
  const pathname = request.nextUrl.pathname;

  // If waitlist enabled and trying to access auth routes -> redirect to /waitlist
  if (isWaitlistEnabled && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/waitlist", request.url));
  }

  // If waitlist disabled and trying to access /waitlist -> redirect to /login
  if (!isWaitlistEnabled && pathname === "/waitlist") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/waitlist",
  ],
};
