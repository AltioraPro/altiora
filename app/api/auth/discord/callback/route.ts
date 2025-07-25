import { NextRequest, NextResponse } from "next/server";
import { DiscordService } from "@/server/services/discord";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Vérifier les erreurs
    if (error) {
      console.error('Discord OAuth error:', error);
      return NextResponse.redirect(new URL('/profile?error=discord_auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/profile?error=discord_no_code', request.url));
    }

    // Récupérer la session utilisateur
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login?error=not_authenticated', request.url));
    }

    // Échanger le code contre un token
    const tokenData = await DiscordService.exchangeCodeForToken(code);
    
    // Récupérer les informations de l'utilisateur Discord
    const discordUser = await DiscordService.getUserInfo(tokenData.access_token);
    
    // Ajouter l'utilisateur au serveur Discord
    await DiscordService.addUserToGuild(discordUser.id, tokenData.access_token);
    
    // Mettre à jour l'utilisateur dans la base de données
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

    // Synchroniser le rank actuel
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.rank) {
      try {
        await DiscordService.syncUserRank(discordUser.id, user.rank);
        
        // Marquer comme synchronisé
        await db.update(users)
          .set({
            discordRoleSynced: true,
            lastDiscordSync: new Date(),
          })
          .where(eq(users.id, session.user.id));
      } catch (syncError) {
        console.error('Failed to sync rank:', syncError);
        // Ne pas échouer complètement si la synchronisation échoue
      }
    }

    return NextResponse.redirect(new URL('/profile?success=discord_connected', request.url));
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(new URL('/profile?error=discord_connection_failed', request.url));
  }
} 