import { NextResponse } from 'next/server';
import { DiscordService } from '@/server/services/discord';


// Route pour synchroniser tous les utilisateurs discord
export async function POST() {
  try {
    console.log('🔄 [API] Synchronisation globale demandée');
    
    const result = await DiscordService.syncAllConnectedUsers();
    
    console.log('✅ [API] Synchronisation globale terminée', result);
    
    return NextResponse.json({
      success: true,
      message: 'Synchronisation globale terminée',
      syncResult: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Erreur lors de la synchronisation globale:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}