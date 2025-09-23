import { NextResponse } from "next/server";
import { DiscordService } from "@/server/services/discord";
import { nanoid } from "nanoid";


// Route pour la connexion Discord
export async function GET() {
  try {
    const state = nanoid();
    
    const authUrl = DiscordService.getAuthUrl(state);
    
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('discord_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, 
    });
    
    return response;
  } catch (error) {
    console.error('Discord auth error:', error);
    return NextResponse.redirect('/auth/login?error=discord_auth_failed');
  }
} 