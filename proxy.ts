import { type NextRequest, NextResponse } from "next/server";

const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/check-email",
    "/confirm-2fa",
    "/error",
];

export function proxy(request: NextRequest) {
    // In production only, we will redirect all auth paths to the home page
    if (process.env.NODE_ENV === "production") {
        const path = request.nextUrl.pathname;

        if (authPaths.some((p) => path.startsWith(p))) {
            return NextResponse.redirect(new URL("/", request.url));
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
         * - any other file (svg, png, jpg, jpeg, gif, webp)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
