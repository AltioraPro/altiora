import { NextResponse } from "next/server";
import { DiscordService } from "@/server/services/discord";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    // Générer un state unique pour la sécurité
    const state = nanoid();
    
    // Générer l'URL d'autorisation Discord
    const authUrl = DiscordService.getAuthUrl(state);
    
    // Stocker le state dans un cookie sécurisé (optionnel, pour validation)
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('discord_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Discord auth error:', error);
    return NextResponse.redirect('/auth/login?error=discord_auth_failed');
  }
} 