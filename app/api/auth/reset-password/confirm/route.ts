import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Utiliser Better Auth pour réinitialiser le mot de passe
    const response = await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
      asResponse: true,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Invalid or expired token" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Password reset confirmation error:", error);
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
