import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get('discordId');

    if (!discordId) {
      return NextResponse.json(
        { error: 'discordId requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur par discordId
    const user = await db
      .select({ id: users.id, discordId: users.discordId })
      .from(users)
      .where(eq(users.discordId, discordId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user[0].id,
      discordId: user[0].discordId
    });

  } catch (error) {
    console.error('Erreur lors de la recherche utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
