import { NextRequest, NextResponse } from "next/server";
import { DiscordService } from "@/server/services/discord";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { type, userId } = body;

    if (type === 'user' && userId) {
      if (userId !== session.user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }


      return NextResponse.json({ success: true, message: 'Synchronisation utilisateur déclenchée' });
    }

    if (type === 'all') {
      const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
      if (!isAdmin) {
        return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
      }

      const result = await DiscordService.syncAllConnectedUsers();
      return NextResponse.json({
        success: true,
        message: `Synchronisation terminée: ${result.success} succès, ${result.failed} échecs`,
        result
      });
    }

    return NextResponse.json({ error: 'Type de synchronisation invalide' }, { status: 400 });
  } catch (error) {
    console.error('Erreur de synchronisation Discord:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const botUrl = process.env.DISCORD_BOT_WEBHOOK_URL;
    const response = await fetch(`${botUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const botStatus = {
      online: response.ok,
      status: response.status,
      url: botUrl,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(botStatus);
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { 
        online: false,
        error: 'Erreur lors de la vérification du statut',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 