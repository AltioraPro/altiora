import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    const isPublicRoute = publicRoutes.some(
        (route) => pathname.startsWith(route) || pathname.includes(".")
    );

    if (isPublicRoute) {
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

    const isProtectedRoute = protectedPrefixes.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (isProtectedRoute) {
        // Better Auth default cookie names (with secure prefix in prod):
        // - __Secure-better-auth.session_token
        // - __Secure-better-auth.session_data (optional cache)
        // In dev, cookies are not prefixed with __Secure-
        const cookieHeader = request.headers.get("cookie") || "";
        const hasSession =
            /(?:^|;\s)(__Secure-)?better-auth\.session_token=/.test(
                cookieHeader
            );
        if (!hasSession) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        return NextResponse.next();
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
