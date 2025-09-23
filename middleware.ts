import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/" ||
    pathname === "/demo" ||
    pathname === "/setup" ||
    pathname === "/contact" ||
    pathname === "/pricing" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const protectedPrefixes = [
    "/dashboard",
    "/trading",
    "/habits",
    "/goals",
    "/settings",
    "/profile",
    "/app",
  ];

  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Middleware debug:", {
        pathname,
        cookies: Array.from(request.cookies.getAll()).map(c => c.name),
      });
    }

    const hasAnyCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("better-auth.session-id") ||
      request.cookies.get("__Secure-better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session-id") ||
      request.cookies.get("session_token") ||
      request.cookies.get("session");

    if (!hasAnyCookie) {
      try {
        const apiUrl = new URL("/api/auth/session-check", request.url);
        const res = await fetch(apiUrl, {
          headers: { 
            cookie: request.headers.get("cookie") || "",
            "user-agent": "NextJS-Middleware"
          },
          cache: "no-store",
        });
        
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Session check result:", {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
          });
        }
        
        if (res.status !== 200) {
          console.log("🚫 Redirecting to login - session check failed:", res.status);
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
      } catch (error) {
        console.log("🚫 Redirecting to login - session check error:", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 