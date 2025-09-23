import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { addDays, addWeeks, addMonths } from "date-fns";

export async function POST() {
  try {
    console.log("Correction des rappels non programmés");
    
    const now = new Date();
    
    const goalsToFix = await db
      .select()
      .from(goals)
      .where(and(
        eq(goals.remindersEnabled, true),
        isNull(goals.nextReminderDate),
        eq(goals.isCompleted, false),
        eq(goals.isActive, true)
      ));

    console.log(`${goalsToFix.length} objectifs à corriger`);

    const fixedGoals = [];

    for (const goal of goalsToFix) {
      if (!goal.reminderFrequency) continue;

      let nextReminderDate: Date;

      switch (goal.reminderFrequency) {
        case "daily":
          nextReminderDate = addDays(now, 1);
          break;
        case "weekly":
          nextReminderDate = addWeeks(now, 1);
          break;
        case "monthly":
          nextReminderDate = addMonths(now, 1);
          break;
        default:
          continue;
      }

      await db
        .update(goals)
        .set({
          nextReminderDate: nextReminderDate,
          updatedAt: now,
        })
        .where(eq(goals.id, goal.id));

      fixedGoals.push({
        id: goal.id,
        title: goal.title,
        reminderFrequency: goal.reminderFrequency,
        nextReminderDate: nextReminderDate,
      });

      console.log(`Corrigé: ${goal.title} -> ${nextReminderDate.toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: `${fixedGoals.length} objectifs corrigés`,
      fixedGoals,
    });

  } catch (error) {
    console.error("Erreur lors de la correction:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors de la correction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
} 