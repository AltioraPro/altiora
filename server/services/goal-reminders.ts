import { db } from "@/server/db";
import { goals, users, goalReminders } from "@/server/db/schema";
import { eq, and, lte, gte, isNotNull } from "drizzle-orm";
import { DiscordService } from "./discord";
import { createId } from "@paralleldrive/cuid2";

export interface GoalReminder {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  deadline?: Date;
  reminderType: "discord" | "email" | "push";
  reminderFrequency: "daily" | "weekly" | "monthly";
  nextReminderDate: Date;
  lastReminderSent?: Date;
}

export class GoalRemindersService {
  static async sendOverdueReminders() {
    console.log("Checking for overdue reminders...");
    
    try {
      const now = new Date();
      
      const overdueGoals = await db
        .select({
          id: goals.id,
          userId: goals.userId,
          title: goals.title,
          description: goals.description,
          deadline: goals.deadline,
          reminderFrequency: goals.reminderFrequency,
          nextReminderDate: goals.nextReminderDate,
          lastReminderSent: goals.lastReminderSent,
        })
        .from(goals)
                 .where(
           and(
             eq(goals.isActive, true),
             eq(goals.isCompleted, false),
             lte(goals.nextReminderDate, now),
             isNotNull(goals.reminderFrequency),
             isNotNull(goals.nextReminderDate)
           )
         );

      console.log(`Found ${overdueGoals.length} overdue reminders`);

      for (const goal of overdueGoals) {
        if (goal.reminderFrequency) {
          await this.sendReminder({
            id: goal.id,
            userId: goal.userId,
            title: goal.title,
            description: goal.description || undefined,
            deadline: goal.deadline || undefined,
            reminderFrequency: goal.reminderFrequency as "daily" | "weekly" | "monthly",
          });
          await this.updateNextReminderDate(goal.id, goal.reminderFrequency as "daily" | "weekly" | "monthly");
        }
      }

      console.log("Overdue reminders processed successfully");
    } catch (error) {
      console.error("Error processing overdue reminders:", error);
    }
  }

  /**
   * Envoyer un rappel pour un goal spécifique
   */
  static async sendReminder(goal: {
    id: string;
    userId: string;
    title: string;
    description?: string;
    deadline?: Date;
    reminderFrequency: "daily" | "weekly" | "monthly";
  }) {
    try {
      const [user] = await db
        .select({
          discordId: users.discordId,
          discordConnected: users.discordConnected,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, goal.userId))
        .limit(1);

      if (!user) {
        console.warn(`User not found for goal ${goal.id}`);
        return;
      }

      if (user.discordId && user.discordConnected) {
        await this.sendDiscordReminder(user.discordId, goal);
      }

      await this.recordReminderSent(goal.id, goal.userId, "discord");

      console.log(`Reminder sent for goal: ${goal.title}`);
    } catch (error) {
      console.error(`Error sending reminder for goal ${goal.id}:`, error);
    }
  }

  /**
   * Envoyer un rappel Discord
   */
  static async sendDiscordReminder(discordId: string, goal: {
    title: string;
    description?: string;
    deadline?: Date;
    reminderFrequency: "daily" | "weekly" | "monthly";
  }) {
    try {


      const frequencyText = {
        daily: "quotidien",
        weekly: "hebdomadaire", 
        monthly: "mensuel"
      }[goal.reminderFrequency];

      const message = {
        embeds: [{
          title: "🎯 Rappel d'Objectif",
          description: `Il est temps de travailler sur votre objectif !`,
          color: 0x00ff00,
          fields: [
            {
              name: "📋 Objectif",
              value: goal.title,
              inline: false
            },
            {
              name: "📝 Description", 
              value: goal.description || "Aucune description",
              inline: false
            },
            {
              name: "⏰ Fréquence",
              value: `Rappel ${frequencyText}`,
              inline: true
            }
          ],
          footer: {
            text: "Altiora - Votre assistant de productivité"
          },
          timestamp: new Date().toISOString()
        }]
      };

      await DiscordService.sendDirectMessage(discordId, message);
      console.log(`Reminder sent to ${discordId} for goal: ${goal.title}`);
    } catch (error) {
      console.error(`Error sending reminder to ${discordId}:`, error);
    }
  }

  /**
   * Mettre à jour la prochaine date de rappel
   */
  static async updateNextReminderDate(goalId: string, frequency: "daily" | "weekly" | "monthly") {
    try {
      const now = new Date();
      const nextDate = new Date(now);

      switch (frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }

      nextDate.setHours(9, 0, 0, 0);

      await db
        .update(goals)
        .set({
          nextReminderDate: nextDate,
          lastReminderSent: now,
          updatedAt: now,
        })
        .where(eq(goals.id, goalId));

      console.log(`Next reminder date updated for goal ${goalId}: ${nextDate}`);
    } catch (error) {
      console.error(`Error updating next reminder date for goal ${goalId}:`, error);
    }
  }

  /**
   * Enregistrer qu'un rappel a été envoyé
   */
  static async recordReminderSent(goalId: string, userId: string, reminderType: "discord" | "email" | "push") {
    try {
      const reminderId = createId();
      
      await db.insert(goalReminders).values({
        id: reminderId,
        goalId,
        userId,
        reminderType,
        sentAt: new Date(),
        status: "sent",
      });

      console.log(`Reminder record created: ${reminderId}`);
    } catch (error) {
      console.error(`Error recording reminder sent:`, error);
    }
  }

  /**
   * Programmer un rappel pour un goal
   */
  static async scheduleReminder(goalId: string, frequency: "daily" | "weekly" | "monthly") {
    try {
      const now = new Date();
      const nextDate = new Date(now);

      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(9, 0, 0, 0);

      await db
        .update(goals)
        .set({
          reminderFrequency: frequency,
          nextReminderDate: nextDate,
          updatedAt: now,
        })
        .where(eq(goals.id, goalId));

      console.log(`Reminder scheduled for goal ${goalId} at ${nextDate}`);
    } catch (error) {
      console.error(`Error scheduling reminder for goal ${goalId}:`, error);
    }
  }

  /**
   * Annuler les rappels pour un goal
   */
  static async cancelReminders(goalId: string) {
    try {
      await db
        .update(goals)
        .set({
          reminderFrequency: null,
          nextReminderDate: null,
          lastReminderSent: null,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, goalId));

      console.log(`Reminders cancelled for goal ${goalId}`);
    } catch (error) {
      console.error(`Error cancelling reminders for goal ${goalId}:`, error);
    }
  }

  /**
   * Obtenir les statistiques des rappels
   */
  static async getReminderStats(userId: string) {
    try {
      const totalReminders = await db
        .select()
        .from(goals)
        .where(and(eq(goals.userId, userId), eq(goals.isActive, true), isNotNull(goals.reminderFrequency)));

      const sentReminders = await db
        .select()
        .from(goalReminders)
        .where(
          and(
            eq(goalReminders.userId, userId),
            gte(goalReminders.sentAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
          )
        );

      const activeReminders = await db
        .select()
        .from(goals)
        .where(
          and(
            eq(goals.userId, userId),
            eq(goals.isActive, true),
            eq(goals.isCompleted, false),
            isNotNull(goals.reminderFrequency)
          )
        );

      return {
        totalReminders: totalReminders.length,
        sentThisMonth: sentReminders.length,
        activeReminders: activeReminders.length,
      };
    } catch (error) {
      console.error("Error getting reminder stats:", error);
      return {
        totalReminders: 0,
        sentThisMonth: 0,
        activeReminders: 0,
      };
    }
  }
} 