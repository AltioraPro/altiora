import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { goals, users } from "@/server/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export async function GET() {
  try {
    console.log("🔍 Diagnostic du système de rappels via API");
    
    // 1. Vérifier tous les objectifs
    const allGoals = await db
      .select({
        id: goals.id,
        title: goals.title,
        userId: goals.userId,
        remindersEnabled: goals.remindersEnabled,
        reminderFrequency: goals.reminderFrequency,
        isCompleted: goals.isCompleted,
        isActive: goals.isActive,
        nextReminderDate: goals.nextReminderDate,
      })
      .from(goals);

    // 2. Vérifier les utilisateurs connectés à Discord
    const discordUsers = await db
      .select({
        id: users.id,
        email: users.email,
        discordId: users.discordId,
        discordConnected: users.discordConnected,
      })
      .from(users)
      .where(and(
        isNotNull(users.discordId),
        eq(users.discordConnected, true)
      ));

    // 3. Vérifier les objectifs éligibles pour les rappels
    const eligibleGoals = allGoals.filter(goal => 
      goal.remindersEnabled && 
      !goal.isCompleted && 
      goal.isActive
    );

    // 4. Vérifier les objectifs avec rappels en retard
    const now = new Date();
    const overdueReminders = eligibleGoals.filter(goal => 
      goal.nextReminderDate && new Date(goal.nextReminderDate) <= now
    );

    const diagnosis = {
      totalGoals: allGoals.length,
      goalsWithReminders: allGoals.filter(goal => goal.remindersEnabled).length,
      discordUsers: discordUsers.length,
      eligibleGoals: eligibleGoals.length,
      overdueReminders: overdueReminders.length,
      details: {
        goals: allGoals.map(goal => ({
          id: goal.id,
          title: goal.title,
          remindersEnabled: goal.remindersEnabled,
          reminderFrequency: goal.reminderFrequency,
          isCompleted: goal.isCompleted,
          isActive: goal.isActive,
          nextReminderDate: goal.nextReminderDate,
        })),
        discordUsers: discordUsers.map(user => ({
          id: user.id,
          email: user.email,
          discordId: user.discordId,
          discordConnected: user.discordConnected,
        })),
        eligibleGoals: eligibleGoals.map(goal => {
          const user = discordUsers.find(u => u.id === goal.userId);
          return {
            id: goal.id,
            title: goal.title,
            reminderFrequency: goal.reminderFrequency,
            nextReminderDate: goal.nextReminderDate,
            user: user ? {
              email: user.email,
              discordId: user.discordId,
            } : null,
          };
        }),
        overdueReminders: overdueReminders.map(goal => {
          const user = discordUsers.find(u => u.id === goal.userId);
          return {
            id: goal.id,
            title: goal.title,
            reminderFrequency: goal.reminderFrequency,
            nextReminderDate: goal.nextReminderDate,
            user: user ? {
              email: user.email,
              discordId: user.discordId,
            } : null,
          };
        }),
      },
      recommendations: {
        createGoals: allGoals.length === 0,
        enableReminders: allGoals.filter(goal => goal.remindersEnabled).length === 0,
        connectDiscord: discordUsers.length === 0,
        remindersUpToDate: overdueReminders.length === 0 && eligibleGoals.length > 0,
      }
    };

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur lors du diagnostic",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
} 