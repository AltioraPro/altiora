import { type NextRequest, NextResponse } from "next/server";
import { HabitRemindersService } from "@/server/services/habit-reminders";

/**
 * POST /api/habits/reminders/process
 *
 * Process habit reminders for all users who have it enabled.
 * This should be called by a cron job every hour.
 * The service will automatically check if it's 7 PM in each user's timezone.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.REMINDERS_WEBHOOK_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.info("[API] Processing habit reminders...");

    const stats = await HabitRemindersService.processHabitReminders();

    return NextResponse.json({
      success: true,
      message: "Habit reminders processed successfully",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error processing habit reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/habits/reminders/process
 *
 * Manual trigger for habit reminders processing.
 * Useful for testing or manual intervention.
 */
export async function GET() {
  try {
    console.info("[API] Manual habit reminder processing triggered...");

    const stats = await HabitRemindersService.processHabitReminders();

    return NextResponse.json({
      success: true,
      message: "Manual habit reminder processing completed",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error in manual habit reminder processing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

