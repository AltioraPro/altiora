import { and, desc, eq, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { goalReminders, goals } from "@/server/db/schema";
import { user } from "@/server/db/schema/auth/schema";
import { discordProfile } from "@/server/db/schema/discord-profile";
import { GoalRemindersService } from "@/server/services/goal-reminders";

function basicAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Basic ")) {
        return false;
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
        "ascii"
    );
    const [username, password] = credentials.split(":");

    const expectedUsername = process.env.ADMIN_API_USERNAME;
    const expectedPassword = process.env.ADMIN_API_PASSWORD;

    console.info("🔍 Production Auth Debug:", {
        hasUsername: !!expectedUsername,
        hasPassword: !!expectedPassword,
        usernameLength: expectedUsername?.length || 0,
        passwordLength: expectedPassword?.length || 0,
        environment: process.env.NODE_ENV,
    });

    if (!(expectedUsername && expectedPassword)) {
        console.error("❌ Admin API credentials not configured");
        return false;
    }

    return username === expectedUsername && password === expectedPassword;
}

export async function GET(request: NextRequest) {
    try {
        if (!basicAuth(request)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                {
                    status: 401,
                    headers: {
                        "WWW-Authenticate": 'Basic realm="Admin API"',
                    },
                }
            );
        }

        const goalsWithReminders = await db
            .select({
                goalId: goals.id,
                goalTitle: goals.title,
                goalDescription: goals.description,
                goalDeadline: goals.deadline,
                reminderFrequency: goals.reminderFrequency,
                nextReminderDate: goals.nextReminderDate,
                lastReminderSent: goals.lastReminderSent,
                remindersEnabled: goals.remindersEnabled,
                isActive: goals.isActive,
                isCompleted: goals.isCompleted,
                userId: goals.userId,
                userEmail: user.email,
                userDiscordId: discordProfile.discordId,
                userDiscordConnected: discordProfile.discordConnected,
                userRank: user.rank,
            })
            .from(goals)
            .leftJoin(user, eq(goals.userId, user.id))
            .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
            .where(
                and(
                    isNotNull(goals.reminderFrequency),
                    eq(goals.remindersEnabled, true)
                )
            )
            .orderBy(desc(goals.nextReminderDate));

        const remindersByFrequency = goalsWithReminders.reduce(
            (acc, goal) => {
                const frequency = goal.reminderFrequency || "unknown";
                if (!acc[frequency]) {
                    acc[frequency] = [];
                }
                acc[frequency].push({
                    goalId: goal.goalId,
                    title: goal.goalTitle,
                    description: goal.goalDescription,
                    deadline: goal.goalDeadline,
                    nextReminderDate: goal.nextReminderDate,
                    lastReminderSent: goal.lastReminderSent,
                    isActive: goal.isActive,
                    isCompleted: goal.isCompleted,
                    user: {
                        id: goal.userId,
                        email: goal.userEmail,
                        discordId: goal.userDiscordId,
                        discordConnected: goal.userDiscordConnected,
                        rank: goal.userRank,
                    },
                });
                return acc;
            },
            {} as Record<
                string,
                Array<{
                    goalId: string;
                    title: string | null;
                    description: string | null;
                    deadline: Date | null;
                    nextReminderDate: Date | null;
                    lastReminderSent: Date | null;
                    isActive: boolean;
                    isCompleted: boolean;
                    user: {
                        id: string;
                        email: string | null;
                        discordId: string | null;
                        discordConnected: boolean | null;
                        rank: string | null;
                    };
                }>
            >
        );

        // Get reminder statistics
        const totalReminders = goalsWithReminders.length;
        const activeReminders = goalsWithReminders.filter(
            (g) => g.isActive && !g.isCompleted
        ).length;
        const completedGoals = goalsWithReminders.filter(
            (g) => g.isCompleted
        ).length;
        const discordConnectedUsers = goalsWithReminders.filter(
            (g) => g.userDiscordConnected
        ).length;

        const recentReminders = await db
            .select({
                reminderId: goalReminders.id,
                goalId: goalReminders.goalId,
                goalTitle: goals.title,
                userId: goalReminders.userId,
                userEmail: user.email,
                reminderType: goalReminders.reminderType,
                sentAt: goalReminders.sentAt,
            })
            .from(goalReminders)
            .leftJoin(goals, eq(goalReminders.goalId, goals.id))
            .leftJoin(user, eq(goalReminders.userId, user.id))
            .orderBy(desc(goalReminders.sentAt))
            .limit(50);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            statistics: {
                totalReminders,
                activeReminders,
                completedGoals,
                discordConnectedUsers,
                frequencyBreakdown: Object.keys(remindersByFrequency).reduce(
                    (acc, freq) => {
                        acc[freq] = remindersByFrequency[freq].length;
                        return acc;
                    },
                    {} as Record<string, number>
                ),
            },
            remindersByFrequency,
            recentActivity: recentReminders.map((reminder) => ({
                reminderId: reminder.reminderId,
                goalId: reminder.goalId,
                goalTitle: reminder.goalTitle,
                userId: reminder.userId,
                userEmail: reminder.userEmail,
                reminderType: reminder.reminderType,
                sentAt: reminder.sentAt,
            })),
        });
    } catch (error) {
        console.error("❌ Error fetching reminders data:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!basicAuth(request)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                {
                    status: 401,
                    headers: {
                        "WWW-Authenticate": 'Basic realm="Admin API"',
                    },
                }
            );
        }

        const body = await request.json();
        const { action, goalId } = body;

        if (action === "test-reminder" && goalId) {
            const [goal] = await db
                .select({
                    id: goals.id,
                    title: goals.title,
                    description: goals.description,
                    deadline: goals.deadline,
                    reminderFrequency: goals.reminderFrequency,
                    userId: goals.userId,
                    userEmail: user.email,
                    userDiscordId: discordProfile.discordId,
                    userDiscordConnected: discordProfile.discordConnected,
                })
                .from(goals)
                .leftJoin(user, eq(goals.userId, user.id))
                .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
                .where(eq(goals.id, goalId))
                .limit(1);

            if (!goal) {
                return NextResponse.json(
                    { error: "Goal not found" },
                    { status: 404 }
                );
            }

            if (!(goal.userDiscordId && goal.userDiscordConnected)) {
                return NextResponse.json(
                    {
                        error: "User not connected to Discord",
                    },
                    { status: 400 }
                );
            }

            const { GoalRemindersService } = await import(
                "@/server/services/goal-reminders"
            );

            await GoalRemindersService.sendDiscordReminder(goal.userDiscordId, {
                title: goal.title,
                description: goal.description || undefined,
                deadline: goal.deadline || undefined,
                reminderFrequency:
                    (goal.reminderFrequency as
                        | "daily"
                        | "weekly"
                        | "monthly") || "daily",
            });

            return NextResponse.json({
                success: true,
                message: `Test reminder sent for goal: ${goal.title}`,
                goalId,
                discordId: goal.userDiscordId,
            });
        }

        if (action === "process-all") {
            await GoalRemindersService.sendOverdueReminders();

            return NextResponse.json({
                success: true,
                message: "All overdue reminders processed",
            });
        }

        if (action === "force-all") {
            const activeGoals = await db
                .select({
                    goalId: goals.id,
                    goalTitle: goals.title,
                    goalDescription: goals.description,
                    goalDeadline: goals.deadline,
                    reminderFrequency: goals.reminderFrequency,
                    userId: goals.userId,
                    userEmail: user.email,
                    userDiscordId: discordProfile.discordId,
                    userDiscordConnected: discordProfile.discordConnected,
                })
                .from(goals)
                .leftJoin(user, eq(goals.userId, user.id))
                .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
                .where(
                    and(
                        eq(goals.isActive, true),
                        eq(goals.isCompleted, false),
                        eq(goals.remindersEnabled, true),
                        isNotNull(goals.reminderFrequency),
                        eq(discordProfile.discordConnected, true),
                        isNotNull(discordProfile.discordId)
                    )
                );

            const { GoalRemindersService } = await import(
                "@/server/services/goal-reminders"
            );

            let sentCount = 0;
            for (const goal of activeGoals) {
                if (goal.userDiscordId && goal.reminderFrequency) {
                    await GoalRemindersService.sendDiscordReminder(
                        goal.userDiscordId,
                        {
                            title: goal.goalTitle,
                            description: goal.goalDescription || undefined,
                            deadline: goal.goalDeadline || undefined,
                            reminderFrequency: goal.reminderFrequency as
                                | "daily"
                                | "weekly"
                                | "monthly",
                        }
                    );

                    await GoalRemindersService.updateNextReminderDate(
                        goal.goalId,
                        goal.reminderFrequency as
                            | "daily"
                            | "weekly"
                            | "monthly",
                        goal.userId
                    );

                    await GoalRemindersService.recordReminderSent(
                        goal.goalId,
                        goal.userId,
                        "discord"
                    );

                    sentCount++;
                }
            }

            return NextResponse.json({
                success: true,
                message: `Force sent ${sentCount} reminders to all active goals`,
                sentCount,
                totalActiveGoals: activeGoals.length,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("❌ Error in POST reminders API:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
