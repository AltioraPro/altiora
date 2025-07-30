import { db } from "@/server/db";
import { goals, goalReminders, users } from "@/server/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { addDays, addWeeks, addMonths } from "date-fns";
import { DiscordService } from "./discord";

export interface GoalReminderService {
  sendReminders(): Promise<void>;
  scheduleNextReminder(goalId: string, userId: string): Promise<void>;
}

export class GoalReminderServiceImpl implements GoalReminderService {
  
  /**
   * Envoie les rappels pour les objectifs qui doivent être notifiés
   */
  async sendReminders(): Promise<void> {
    const now = new Date();
    
    // Récupérer tous les objectifs avec des rappels activés et une date de prochain rappel passée
    const goalsToRemind = await db
      .select({
        goal: goals,
        user: {
          id: users.id,
          discordId: users.discordId,
          discordConnected: users.discordConnected,
        }
      })
      .from(goals)
      .leftJoin(users, eq(goals.userId, users.id))
      .where(
        and(
          eq(goals.remindersEnabled, true),
          lte(goals.nextReminderDate, now),
          eq(goals.isCompleted, false),
          eq(goals.isActive, true)
        )
      );

    for (const { goal, user } of goalsToRemind) {
      try {
        await this.sendGoalReminder(goal, user);
        await this.scheduleNextReminder(goal.id, goal.userId);
      } catch (error) {
        console.error(`Erreur lors de l'envoi du rappel pour l'objectif ${goal.id}:`, error);
      }
    }
  }

  /**
   * Envoie un rappel pour un objectif spécifique
   */
  private async sendGoalReminder(goal: any, user: any): Promise<void> {
    // Créer l'enregistrement du rappel
    await db.insert(goalReminders).values({
      id: crypto.randomUUID(),
      goalId: goal.id,
      userId: goal.userId,
      reminderType: "discord", // Maintenant on utilise Discord
      sentAt: new Date(),
      status: "sent",
    });

    // Envoyer le rappel via Discord si l'utilisateur est connecté
    if (user?.discordId && user?.discordConnected) {
      try {
        await DiscordService.sendGoalReminder(user.discordId, {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          deadline: goal.deadline,
          userId: goal.userId,
        });
        console.log(`✅ Rappel Discord envoyé pour l'objectif: ${goal.title} à ${user.discordId}`);
      } catch (discordError) {
        console.error(`❌ Erreur Discord pour l'objectif ${goal.title}:`, discordError);
        // Fallback vers email si Discord échoue
        await this.sendEmailReminder(goal, user);
      }
    } else {
      // Fallback vers email si l'utilisateur n'est pas connecté à Discord
      await this.sendEmailReminder(goal, user);
    }
  }

  /**
   * Envoie un rappel par email (fallback)
   */
  private async sendEmailReminder(goal: any, user: any): Promise<void> {
    // TODO: Implémenter l'envoi réel d'email
    console.log(`📧 Rappel email envoyé pour l'objectif: ${goal.title}`);
    
    // Ici, vous pourriez intégrer avec un service d'email comme SendGrid, Resend, etc.
    // await emailService.sendGoalReminder({
    //   to: user.email,
    //   goalTitle: goal.title,
    //   goalDescription: goal.description,
    //   deadline: goal.deadline,
    // });
  }

  /**
   * Programme le prochain rappel pour un objectif
   */
  async scheduleNextReminder(goalId: string, userId: string): Promise<void> {
    const goal = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .limit(1);

    if (!goal[0] || !goal[0].reminderFrequency) {
      return;
    }

    const now = new Date();
    let nextReminderDate: Date;

    switch (goal[0].reminderFrequency) {
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
        nextReminderDate = addWeeks(now, 1);
    }

    await db
      .update(goals)
      .set({
        lastReminderSent: now,
        nextReminderDate: nextReminderDate,
        updatedAt: now,
      })
      .where(eq(goals.id, goalId));
  }

  /**
   * Récupère les rappels envoyés pour un objectif
   */
  async getGoalReminders(goalId: string, userId: string): Promise<any[]> {
    return await db
      .select()
      .from(goalReminders)
      .where(and(eq(goalReminders.goalId, goalId), eq(goalReminders.userId, userId)))
      .orderBy(goalReminders.sentAt);
  }

  /**
   * Active les rappels pour un objectif
   */
  async enableReminders(goalId: string, userId: string, frequency: "daily" | "weekly" | "monthly"): Promise<void> {
    const now = new Date();
    let nextReminderDate: Date;

    switch (frequency) {
      case "daily":
        nextReminderDate = addDays(now, 1);
        break;
      case "weekly":
        nextReminderDate = addWeeks(now, 1);
        break;
      case "monthly":
        nextReminderDate = addMonths(now, 1);
        break;
    }

    await db
      .update(goals)
      .set({
        remindersEnabled: true,
        reminderFrequency: frequency,
        nextReminderDate: nextReminderDate,
        updatedAt: now,
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  }

  /**
   * Désactive les rappels pour un objectif
   */
  async disableReminders(goalId: string, userId: string): Promise<void> {
    await db
      .update(goals)
      .set({
        remindersEnabled: false,
        reminderFrequency: null,
        nextReminderDate: null,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  }
}

// Instance singleton
export const goalReminderService = new GoalReminderServiceImpl(); 