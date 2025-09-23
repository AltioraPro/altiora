import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/demo",
    "/setup", 
    "/contact",
    "/pricing",
    "/auth",
    "/api/auth",
    "/_next",
    "/static",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname.includes(".")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedPrefixes = [
    "/dashboard",
    "/trading", 
    "/habits",
    "/goals",
    "/settings",
    "/profile",
    "/app",
  ];

  const isProtectedRoute = protectedPrefixes.some(prefix => 
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute) {
    try {
      // Use Better-Auth's built-in session verification
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user?.id) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Session is valid, continue
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
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