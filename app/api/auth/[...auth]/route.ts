import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Force Node.js runtime pour la compatibilité avec postgres
export const runtime = "nodejs";

export const GET = async (req: NextRequest) => {
  return auth.handler(req);
};

export const POST = async (req: NextRequest) => {
  return auth.handler(req);
}; 