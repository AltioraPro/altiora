import { NextRequest, NextResponse } from "next/server";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel, pour la sécurité)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.REMINDERS_WEBHOOK_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔔 [API] Processing reminders...");
    
    // Traiter les rappels en retard
    await GoalRemindersService.sendOverdueReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ [API] Error processing reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// Endpoint GET pour tester manuellement
export async function GET() {
  try {
    console.log("🔔 [API] Manual reminder processing triggered...");
    
    await GoalRemindersService.sendOverdueReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: "Manual reminder processing completed",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ [API] Error in manual reminder processing:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 