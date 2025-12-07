import { createId } from "@paralleldrive/cuid2";
import { and, eq, gte, isNotNull, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { discordProfile, goalReminders, goals, user } from "@/server/db/schema";
import { DiscordService } from "./discord";

function calculateNextReminderInTimezone(
    frequency: "daily" | "weekly" | "monthly",
    userTimezone = "UTC"
): Date {
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
        default:
            nextDate.setDate(nextDate.getDate() + 1);
            break;
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(nextDate);
    const year = Number.parseInt(
        parts.find((p) => p.type === "year")?.value || "2024",
        10
    );
    const month = Number.parseInt(
        parts.find((p) => p.type === "month")?.value || "1",
        10
    );
    const day = Number.parseInt(
        parts.find((p) => p.type === "day")?.value || "1",
        10
    );

    // Créer une date à 9h00 dans le timezone de l'utilisateur
    // puis la convertir en UTC
    const targetDate = new Date(Date.UTC(year, month - 1, day, 9, 0, 0, 0));

    // Calculer le décalage horaire du timezone de l'utilisateur
    const tzOffset = getTimezoneOffset(userTimezone, targetDate);
    targetDate.setTime(targetDate.getTime() - tzOffset);

    return targetDate;
}

function getTimezoneOffset(timezone: string, date: Date): number {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(
        date.toLocaleString("en-US", { timeZone: timezone })
    );
    return tzDate.getTime() - utcDate.getTime();
}

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

export const GoalRemindersService = {
    sendOverdueReminders: async () => {
        console.info("Checking for overdue reminders...");

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
                        eq(goals.remindersEnabled, true),
                        lte(goals.nextReminderDate, now),
                        isNotNull(goals.reminderFrequency),
                        isNotNull(goals.nextReminderDate)
                    )
                );

            console.info(`Found ${overdueGoals.length} overdue reminders`);

            for (const goal of overdueGoals) {
                if (goal.reminderFrequency) {
                    await GoalRemindersService.sendReminder({
                        id: goal.id,
                        userId: goal.userId,
                        title: goal.title,
                        description: goal.description || undefined,
                        deadline: goal.deadline || undefined,
                        reminderFrequency: goal.reminderFrequency as
                            | "daily"
                            | "weekly"
                            | "monthly",
                    });
                    await GoalRemindersService.updateNextReminderDate(
                        goal.id,
                        goal.reminderFrequency as
                            | "daily"
                            | "weekly"
                            | "monthly",
                        goal.userId
                    );
                }
            }

            console.info("Overdue reminders processed successfully");
        } catch (error) {
            console.error("Error processing overdue reminders:", error);
        }
    },

    sendReminder: async (goal: {
        id: string;
        userId: string;
        title: string;
        description?: string;
        deadline?: Date;
        reminderFrequency: "daily" | "weekly" | "monthly";
    }) => {
        try {
            const [userData] = await db
                .select({
                    discordId: discordProfile.discordId,
                    discordConnected: discordProfile.discordConnected,
                    email: user.email,
                })
                .from(user)
                .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
                .where(eq(user.id, goal.userId))
                .limit(1);

            if (!userData) {
                console.warn(`User not found for goal ${goal.id}`);
                return;
            }

            if (userData.discordId && userData.discordConnected) {
                await GoalRemindersService.sendDiscordReminder(
                    userData.discordId,
                    goal
                );
            }

            await GoalRemindersService.recordReminderSent(
                goal.id,
                goal.userId,
                "discord"
            );

            console.info(`Reminder sent for goal: ${goal.title}`);
        } catch (error) {
            console.error(`Error sending reminder for goal ${goal.id}:`, error);
        }
    },

    /**
     * Envoyer un rappel Discord
     */
    sendDiscordReminder: async (
        discordId: string,
        goal: {
            title: string;
            description?: string;
            deadline?: Date;
            reminderFrequency: "daily" | "weekly" | "monthly";
        }
    ) => {
        try {
            const frequencyText = {
                daily: "Daily",
                weekly: "Weekly",
                monthly: "Monthly",
            }[goal.reminderFrequency];

            const message = {
                embeds: [
                    {
                        title: "⏰ Goal Reminder",
                        description: "Time to work on your goal!",
                        color: 0x34_98_db, // Blue color
                        fields: [
                            {
                                name: "🎯 Goal",
                                value: goal.title,
                                inline: false,
                            },
                            {
                                name: "📝 Description",
                                value:
                                    goal.description ||
                                    "No description provided",
                                inline: false,
                            },
                            {
                                name: "⏰ Frequency",
                                value: `${frequencyText} reminder`,
                                inline: true,
                            },
                        ],
                        footer: {
                            text: "Altiora - Your productivity assistant",
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            };

            await DiscordService.sendDirectMessage(discordId, message);
            console.info(
                `Reminder sent to ${discordId} for goal: ${goal.title}`
            );
        } catch (error) {
            console.error(`Error sending reminder to ${discordId}:`, error);
        }
    },

    /**
     * Mettre à jour la prochaine date de rappel en utilisant le timezone de l'utilisateur
     */
    updateNextReminderDate: async (
        goalId: string,
        frequency: "daily" | "weekly" | "monthly",
        userId?: string
    ) => {
        try {
            const now = new Date();

            // Récupérer le timezone de l'utilisateur
            let userTimezone = "UTC";
            if (userId) {
                const [userData] = await db
                    .select({ timezone: user.timezone })
                    .from(user)
                    .where(eq(user.id, userId))
                    .limit(1);
                userTimezone = userData?.timezone || "UTC";
            } else {
                // Si pas d'userId, récupérer depuis le goal
                const [goalData] = await db
                    .select({ userId: goals.userId })
                    .from(goals)
                    .where(eq(goals.id, goalId))
                    .limit(1);

                if (goalData) {
                    const [userData] = await db
                        .select({ timezone: user.timezone })
                        .from(user)
                        .where(eq(user.id, goalData.userId))
                        .limit(1);
                    userTimezone = userData?.timezone || "UTC";
                }
            }

            const nextDate = calculateNextReminderInTimezone(
                frequency,
                userTimezone
            );

            await db
                .update(goals)
                .set({
                    nextReminderDate: nextDate,
                    lastReminderSent: now,
                    updatedAt: now,
                })
                .where(eq(goals.id, goalId));

            console.info(
                `Next reminder date updated for goal ${goalId}: ${nextDate} (timezone: ${userTimezone})`
            );
        } catch (error) {
            console.error(
                `Error updating next reminder date for goal ${goalId}:`,
                error
            );
        }
    },

    /**
     * Enregistrer qu'un rappel a été envoyé
     */
    recordReminderSent: async (
        goalId: string,
        userId: string,
        reminderType: "discord" | "email" | "push"
    ) => {
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

            console.info(`Reminder record created: ${reminderId}`);
        } catch (error) {
            console.error("Error recording reminder sent:", error);
        }
    },

    /**
     * Programmer un rappel pour un goal en utilisant le timezone de l'utilisateur
     */
    scheduleReminder: async (
        goalId: string,
        frequency: "daily" | "weekly" | "monthly",
        userId?: string
    ) => {
        try {
            const now = new Date();

            // Récupérer le timezone de l'utilisateur
            let userTimezone = "UTC";
            if (userId) {
                const [userData] = await db
                    .select({ timezone: user.timezone })
                    .from(user)
                    .where(eq(user.id, userId))
                    .limit(1);
                userTimezone = userData?.timezone || "UTC";
            } else {
                // Si pas d'userId, récupérer depuis le goal
                const [goalData] = await db
                    .select({ userId: goals.userId })
                    .from(goals)
                    .where(eq(goals.id, goalId))
                    .limit(1);

                if (goalData) {
                    const [userData] = await db
                        .select({ timezone: user.timezone })
                        .from(user)
                        .where(eq(user.id, goalData.userId))
                        .limit(1);
                    userTimezone = userData?.timezone || "UTC";
                }
            }

            // Calculer la prochaine date de rappel à 9h00 dans le timezone de l'utilisateur
            const nextDate = calculateNextReminderInTimezone(
                "daily",
                userTimezone
            );

            await db
                .update(goals)
                .set({
                    remindersEnabled: true,
                    reminderFrequency: frequency,
                    nextReminderDate: nextDate,
                    updatedAt: now,
                })
                .where(eq(goals.id, goalId));

            console.info(
                `Reminder scheduled for goal ${goalId} at ${nextDate} (timezone: ${userTimezone})`
            );
        } catch (error) {
            console.error(
                `Error scheduling reminder for goal ${goalId}:`,
                error
            );
        }
    },

    /**
     * Annuler les rappels pour un goal
     */
    cancelReminders: async (goalId: string) => {
        try {
            await db
                .update(goals)
                .set({
                    remindersEnabled: false,
                    reminderFrequency: null,
                    nextReminderDate: null,
                    lastReminderSent: null,
                    updatedAt: new Date(),
                })
                .where(eq(goals.id, goalId));

            console.info(`Reminders cancelled for goal ${goalId}`);
        } catch (error) {
            console.error(
                `Error cancelling reminders for goal ${goalId}:`,
                error
            );
        }
    },

    /**
     * Obtenir les statistiques des rappels
     */
    getReminderStats: async (userId: string) => {
        try {
            const totalReminders = await db
                .select()
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, userId),
                        eq(goals.isActive, true),
                        isNotNull(goals.reminderFrequency)
                    )
                );

            const sentReminders = await db
                .select()
                .from(goalReminders)
                .where(
                    and(
                        eq(goalReminders.userId, userId),
                        gte(
                            goalReminders.sentAt,
                            new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                1
                            )
                        )
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
    },
};
