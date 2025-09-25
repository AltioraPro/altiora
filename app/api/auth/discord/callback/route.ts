import { NextRequest, NextResponse } from "next/server";
import { DiscordService } from "@/server/services/discord";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";


// Route pour le callback Discord
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Discord OAuth error:', error);
      return NextResponse.redirect(new URL('/profile?error=discord_auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/profile?error=discord_no_code', request.url));
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login?error=not_authenticated', request.url));
    }

    const tokenData = await DiscordService.exchangeCodeForToken(code);
    
    const discordUser = await DiscordService.getUserInfo(tokenData.access_token);
    
    await DiscordService.addUserToGuild(discordUser.id, tokenData.access_token);
    
    await db.update(users)
      .set({
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordDiscriminator: discordUser.discriminator,
        discordAvatar: discordUser.avatar,
        discordConnected: true,
        discordRoleSynced: false,
        lastDiscordSync: new Date(),
      })
      .where(eq(users.id, session.user.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.rank) {
      try {
        await DiscordService.syncUserRank(discordUser.id, user.rank);
        
        await db.update(users)
          .set({
            discordRoleSynced: true,
            lastDiscordSync: new Date(),
          })
          .where(eq(users.id, session.user.id));
      } catch (syncError) {
        console.error('Failed to sync rank:', syncError);
      }
    }

    return NextResponse.redirect(new URL('/profile?success=discord_connected', request.url));
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(new URL('/profile?error=discord_connection_failed', request.url));
  }
} 