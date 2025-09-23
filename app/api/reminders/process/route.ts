import { NextRequest, NextResponse } from "next/server";
import { GoalRemindersService } from "@/server/services/goal-reminders";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.REMINDERS_WEBHOOK_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Processing reminders...");
    
    await GoalRemindersService.sendOverdueReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("Manual reminder processing triggered...");
    
    await GoalRemindersService.sendOverdueReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: "Manual reminder processing completed",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error in manual reminder processing:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 