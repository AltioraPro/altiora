import { NextResponse } from "next/server";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export async function POST() {
  try {
    console.log("🚀 Déclenchement manuel des rappels d'objectifs");
    
    await GoalRemindersService.sendOverdueReminders();
    
    console.log("✅ Rappels d'objectifs envoyés avec succès");
    
    return NextResponse.json({ 
      success: true, 
      message: "Rappels envoyés avec succès" 
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des rappels:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de l'envoi des rappels" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Endpoint de rappels d'objectifs - Utilisez POST pour déclencher les rappels" 
  });
} 