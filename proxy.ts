import { type NextRequest, NextResponse } from "next/server";
import { PAGES } from "./constants/pages";

const protectedRoutes = [
    PAGES.DASHBOARD,
    PAGES.TRADING,
    PAGES.HABITS,
    PAGES.GOALS,
    PAGES.SETTINGS,
    PAGES.PROFILE,
];

const authRoutes = [PAGES.SIGN_IN, PAGES.SIGN_UP];

function matches(route: string | RegExp, pathname: string) {
    return typeof route === "string"
        ? pathname.startsWith(route)
        : route.test(pathname);
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasSessionCookies = request.cookies
        .getAll()
        .some(
            (cookie) =>
                cookie.name.startsWith("better-auth.session") ||
                cookie.name.startsWith("__Secure-better-auth.session_token")
        );

    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isAuthRoute && hasSessionCookies) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const isProtectedRoute = protectedRoutes.some((route) =>
        matches(route, pathname)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    if (!hasSessionCookies) {
        return redirectToLogin(request);
    }

    return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL(PAGES.SIGN_IN, request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - any other file (svg, png, jpg, jpeg, gif, webp)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
