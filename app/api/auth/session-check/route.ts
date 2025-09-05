import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (process.env.NODE_ENV === "development") {
      console.log("Session check API:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        cookies: request.headers.get("cookie")?.split(';').map(c => c.trim().split('=')[0]),
      });
    }
    
    if (session?.user?.id) {
      return NextResponse.json({ ok: true, userId: session.user.id }, { status: 200 });
    }
    
    return NextResponse.json({ ok: false, reason: "no_session" }, { status: 401 });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ ok: false, reason: "error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 401 });
  }
}


