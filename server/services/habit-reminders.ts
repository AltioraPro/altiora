import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
    discordProfile,
    habitCompletions,
    habits,
    user,
} from "@/server/db/schema";
import { DiscordService } from "./discord";

/**
 * Get the current date string in user's timezone (YYYY-MM-DD format)
 */
function getDateInTimezone(timezone: string): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return formatter.format(now);
}

/**
 * Check if it's 19:00 (7 PM) in the user's timezone
 */
function is7PMInTimezone(timezone: string): boolean {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
    });
    const hour = Number.parseInt(formatter.format(now), 10);
    return hour === 19;
}

/**
 * Get hour in user's timezone
 */
function getHourInTimezone(timezone: string): number {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
    });
    return Number.parseInt(formatter.format(now), 10);
}

interface HabitWithCompletion {
    id: string;
    title: string;
    emoji: string;
    isCompleted: boolean;
}

interface _UserHabitData {
    userId: string;
    discordId: string;
    timezone: string;
    habits: HabitWithCompletion[];
}

export const HabitRemindersService = {
    /**
     * Process all habit reminders for users who have it enabled and it's 7 PM in their timezone
     */
    processHabitReminders: async (): Promise<{
        processed: number;
        sent: number;
        skipped: number;
    }> => {
        console.info("[HabitReminders] Starting habit reminders processing...");

        const stats = {
            processed: 0,
            sent: 0,
            skipped: 0,
        };

        try {
            // Get all users with habit reminders enabled
            const usersWithReminders = await db
                .select({
                    userId: discordProfile.userId,
                    discordId: discordProfile.discordId,
                    timezone: user.timezone,
                    lastReminderSent: discordProfile.lastHabitReminderSent,
                })
                .from(discordProfile)
                .innerJoin(user, eq(discordProfile.userId, user.id))
                .where(
                    and(
                        eq(discordProfile.habitRemindersEnabled, true),
                        eq(discordProfile.discordConnected, true)
                    )
                );

            console.info(
                `[HabitReminders] Found ${usersWithReminders.length} users with habit reminders enabled`
            );

            for (const userData of usersWithReminders) {
                stats.processed++;

                const userTimezone = userData.timezone ?? "UTC";

                // Check if it's 7 PM in user's timezone
                if (!is7PMInTimezone(userTimezone)) {
                    const currentHour = getHourInTimezone(userTimezone);
                    console.info(
                        `[HabitReminders] Skipping user ${userData.userId} - current hour in ${userTimezone}: ${currentHour}, waiting for 19:00`
                    );
                    stats.skipped++;
                    continue;
                }

                // Check if we already sent a reminder today
                const todayDate = getDateInTimezone(userTimezone);
                if (userData.lastReminderSent) {
                    const _lastReminderDate = getDateInTimezone(userTimezone);
                    const lastSentFormatter = new Intl.DateTimeFormat("en-CA", {
                        timeZone: userTimezone,
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    });
                    const lastSentDate = lastSentFormatter.format(
                        userData.lastReminderSent
                    );

                    if (lastSentDate === todayDate) {
                        console.info(
                            `[HabitReminders] Already sent reminder to user ${userData.userId} today`
                        );
                        stats.skipped++;
                        continue;
                    }
                }

                // Get user's habits and their completion status for today
                const userHabits =
                    await HabitRemindersService.getUserHabitsWithStatus(
                        userData.userId,
                        todayDate
                    );

                if (userHabits.length === 0) {
                    console.info(
                        `[HabitReminders] User ${userData.userId} has no active habits`
                    );
                    stats.skipped++;
                    continue;
                }

                const incompleteHabits = userHabits.filter(
                    (h) => !h.isCompleted
                );

                // If all habits are completed, skip sending a message
                if (incompleteHabits.length === 0) {
                    console.info(
                        `[HabitReminders] All habits completed for user ${userData.userId}, skipping reminder`
                    );
                    stats.skipped++;
                    continue;
                }

                // Send reminder for incomplete habits
                await HabitRemindersService.sendHabitReminder(
                    userData.discordId,
                    userHabits,
                    incompleteHabits
                );

                // Update last reminder sent timestamp
                await db
                    .update(discordProfile)
                    .set({
                        lastHabitReminderSent: new Date(),
                    })
                    .where(eq(discordProfile.userId, userData.userId));

                stats.sent++;
                console.info(
                    `[HabitReminders] Reminder sent to user ${userData.userId}`
                );
            }

            console.info(
                `[HabitReminders] Processing complete. Processed: ${stats.processed}, Sent: ${stats.sent}, Skipped: ${stats.skipped}`
            );

            return stats;
        } catch (error) {
            console.error(
                "[HabitReminders] Error processing habit reminders:",
                error
            );
            throw error;
        }
    },

    /**
     * Get user's habits with their completion status for a specific date
     */
    getUserHabitsWithStatus: async (
        userId: string,
        dateString: string
    ): Promise<HabitWithCompletion[]> => {
        // Get all active habits for the user
        const userHabits = await db
            .select({
                id: habits.id,
                title: habits.title,
                emoji: habits.emoji,
            })
            .from(habits)
            .where(and(eq(habits.userId, userId), eq(habits.isActive, true)));

        // Get completions for today
        const completions = await db
            .select({
                habitId: habitCompletions.habitId,
                isCompleted: habitCompletions.isCompleted,
            })
            .from(habitCompletions)
            .where(
                and(
                    eq(habitCompletions.userId, userId),
                    eq(habitCompletions.completionDate, dateString),
                    eq(habitCompletions.isCompleted, true)
                )
            );

        const completedHabitIds = new Set(completions.map((c) => c.habitId));

        return userHabits.map((habit) => ({
            ...habit,
            isCompleted: completedHabitIds.has(habit.id),
        }));
    },

    /**
     * Send habit reminder Discord message
     */
    sendHabitReminder: async (
        discordId: string,
        allHabits: HabitWithCompletion[],
        incompleteHabits: HabitWithCompletion[]
    ): Promise<void> => {
        const completedCount = allHabits.length - incompleteHabits.length;
        const totalCount = allHabits.length;
        const progress = Math.round((completedCount / totalCount) * 100);

        // Create progress bar
        const progressBarLength = 10;
        const filledBlocks = Math.round((progress / 100) * progressBarLength);
        const emptyBlocks = progressBarLength - filledBlocks;
        const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

        // Create habit list
        const habitsList = allHabits
            .map((h) => `${h.isCompleted ? "✅" : "❌"} ${h.emoji} ${h.title}`)
            .join("\n");

        // Color based on progress
        let color = 0xe7_4c_3c; // Red for low progress
        if (progress >= 75) {
            color = 0x2e_cc_71; // Green
        } else if (progress >= 50) {
            color = 0xf3_9c_12; // Orange
        } else if (progress >= 25) {
            color = 0xe6_7e_22; // Dark orange
        }

        const message = {
            embeds: [
                {
                    title: "🔔 Daily Habit Reminder",
                    description: `Hey! You still have **${incompleteHabits.length}** habit${incompleteHabits.length > 1 ? "s" : ""} to complete today.\n\nDon't forget to check them off before the day ends!`,
                    color,
                    fields: [
                        {
                            name: "📊 Today's Progress",
                            value: `${progressBar} ${progress}%\n${completedCount}/${totalCount} habits completed`,
                            inline: false,
                        },
                        {
                            name: "📋 Your Habits",
                            value: habitsList,
                            inline: false,
                        },
                        {
                            name: "⏰ Incomplete",
                            value: incompleteHabits
                                .map((h) => `${h.emoji} ${h.title}`)
                                .join("\n"),
                            inline: false,
                        },
                    ],
                    footer: {
                        text: "Altiora - Stay consistent, stay productive! 💪",
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        await DiscordService.sendDirectMessage(discordId, message);
    },

    /**
     * Send congratulations message when all habits are completed
     */
    sendAllCompletedMessage: async (
        discordId: string,
        allHabits: HabitWithCompletion[]
    ): Promise<void> => {
        const habitsList = allHabits
            .map((h) => `✅ ${h.emoji} ${h.title}`)
            .join("\n");

        const motivationalMessages = [
            "You're crushing it! Keep up the amazing work! 🌟",
            "100% completion! Your future self is thanking you! 🔥",
            "Perfect day! Consistency is the key to success! 💫",
            "All habits completed! You're building an unstoppable routine! 🚀",
            "Amazing discipline today! Tomorrow's success starts with today's habits! ⭐",
        ];

        const randomMessage =
            motivationalMessages[
                Math.floor(Math.random() * motivationalMessages.length)
            ];

        const message = {
            embeds: [
                {
                    title: "🎉 All Habits Completed!",
                    description: `Congratulations! You've completed **all ${allHabits.length}** of your habits today!\n\n${randomMessage}`,
                    color: 0x2e_cc_71, // Green for success
                    fields: [
                        {
                            name: "📊 Today's Progress",
                            value: `${"█".repeat(10)} 100%\n${allHabits.length}/${allHabits.length} habits completed`,
                            inline: false,
                        },
                        {
                            name: "✅ Completed Habits",
                            value: habitsList,
                            inline: false,
                        },
                    ],
                    footer: {
                        text: "Altiora - You're building something great! 🏆",
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        await DiscordService.sendDirectMessage(discordId, message);
    },

    /**
     * Send a test reminder to a specific user (for testing purposes)
     */
    sendTestReminder: async (userId: string): Promise<boolean> => {
        try {
            const [userData] = await db
                .select({
                    discordId: discordProfile.discordId,
                    discordConnected: discordProfile.discordConnected,
                    timezone: user.timezone,
                })
                .from(discordProfile)
                .innerJoin(user, eq(discordProfile.userId, user.id))
                .where(eq(discordProfile.userId, userId))
                .limit(1);

            if (!(userData?.discordId && userData.discordConnected)) {
                console.error(
                    `[HabitReminders] User ${userId} does not have Discord connected`
                );
                return false;
            }

            const todayDate = getDateInTimezone(userData.timezone ?? "UTC");
            const userHabits =
                await HabitRemindersService.getUserHabitsWithStatus(
                    userId,
                    todayDate
                );

            if (userHabits.length === 0) {
                console.error(
                    `[HabitReminders] User ${userId} has no active habits`
                );
                return false;
            }

            const incompleteHabits = userHabits.filter((h) => !h.isCompleted);

            if (incompleteHabits.length === 0) {
                console.info(
                    `[HabitReminders] All habits completed for user ${userId}, skipping test reminder`
                );
                return false;
            }

            await HabitRemindersService.sendHabitReminder(
                userData.discordId,
                userHabits,
                incompleteHabits
            );

            return true;
        } catch (error) {
            console.error(
                `[HabitReminders] Error sending test reminder to user ${userId}:`,
                error
            );
            return false;
        }
    },

    /**
     * Toggle habit reminders for a user
     */
    toggleHabitReminders: async (
        userId: string,
        enabled: boolean
    ): Promise<boolean> => {
        try {
            await db
                .update(discordProfile)
                .set({
                    habitRemindersEnabled: enabled,
                })
                .where(eq(discordProfile.userId, userId));

            console.info(
                `[HabitReminders] Habit reminders ${enabled ? "enabled" : "disabled"} for user ${userId}`
            );
            return true;
        } catch (error) {
            console.error(
                `[HabitReminders] Error toggling habit reminders for user ${userId}:`,
                error
            );
            return false;
        }
    },
};
