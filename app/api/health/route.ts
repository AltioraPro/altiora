import { NextResponse } from 'next/server';
import { db } from '@/server/db';


// Route pour vérifier la santé de l'application
export async function GET() {
  try {
    await db.execute('SELECT 1');
    
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('❌ [API Health] Erreur de santé:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}