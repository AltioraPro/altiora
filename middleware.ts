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
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/app")) {
    // Vérifier simplement la présence du cookie de session
    const sessionCookie = request.cookies.get("better-auth.session_token");
    
    if (!sessionCookie || !sessionCookie.value) {
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