import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes publiques et les API
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

  // Vérifier l'authentification pour les routes protégées
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
    // Vérification robuste: si pas de cookie détecté, tente une validation serveur via route interne
    const hasAnyCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("better-auth.session-id") ||
      request.cookies.get("session_token") ||
      request.cookies.get("session");

    if (!hasAnyCookie) {
      // Double check: ping l'API de session (évite les soucis de nom de cookie en prod)
      try {
        const apiUrl = new URL("/api/auth/session-check", request.url);
        const res = await fetch(apiUrl, {
          headers: { cookie: request.headers.get("cookie") || "" },
          cache: "no-store",
        });
        if (res.status !== 200) {
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
      } catch {
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