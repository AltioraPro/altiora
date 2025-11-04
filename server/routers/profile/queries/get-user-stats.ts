import { ORPCError } from "@orpc/client";
import { and, count, eq, sql } from "drizzle-orm";

import {
    discordPomodoroSessions,
    habits,
    trades,
    user,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getUserStatsBase = protectedProcedure;

export const getUserStatsHandler = getUserStatsBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        try {
            const habitsStats = await db
                .select({
                    totalHabits: count(habits.id),
                    activeHabits: count(habits.id),
                })
                .from(habits)
                .where(
                    and(
                        eq(habits.userId, session.user.id),
                        eq(habits.isActive, true)
                    )
                );

            const tradesStats = await db
                .select({
                    totalTrades: count(trades.id),
                })
                .from(trades)
                .where(eq(trades.userId, session.user.id));

            const currentUser = await db.query.user.findFirst({
                where: eq(user.id, session.user.id),
                columns: {
                    rank: true,
                    createdAt: true,
                },
            });

            if (!currentUser) {
                throw new ORPCError("NOT_FOUND", {
                    message: "User not found",
                });
            }

            const daysSinceRegistration = Math.floor(
                (Date.now() - currentUser.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            // Statistiques Deepwork (sessions avec format = 'deepwork')
            const deepworkStats = await db
                .select({
                    totalSessions: count(discordPomodoroSessions.id),
                    completedSessions: sql<number>`COUNT(CASE WHEN ${discordPomodoroSessions.status} = 'completed' THEN 1 END)`,
                    totalWorkTime: sql<number>`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`,
                    averageSessionDuration: sql<number>`COALESCE(AVG(${discordPomodoroSessions.workTime}), 0)`,
                    longestSession: sql<number>`COALESCE(MAX(${discordPomodoroSessions.workTime}), 0)`,
                })
                .from(discordPomodoroSessions)
                .where(
                    and(
                        eq(discordPomodoroSessions.userId, session.user.id),
                        eq(discordPomodoroSessions.format, "deepwork")
                    )
                );

            // Statistiques Pomodoro (sessions avec format != 'deepwork' ou format null)
            const pomodoroStats = await db
                .select({
                    totalSessions: count(discordPomodoroSessions.id),
                    completedSessions: sql<number>`COUNT(CASE WHEN ${discordPomodoroSessions.status} = 'completed' THEN 1 END)`,
                    totalWorkTime: sql<number>`COALESCE(SUM(${discordPomodoroSessions.totalWorkTime}), 0)`,
                })
                .from(discordPomodoroSessions)
                .where(
                    and(
                        eq(discordPomodoroSessions.userId, session.user.id),
                        sql`${discordPomodoroSessions.format} != 'deepwork' OR ${discordPomodoroSessions.format} IS NULL`
                    )
                );

            return {
                habits: {
                    total: habitsStats[0]?.totalHabits || 0,
                    active: habitsStats[0]?.activeHabits || 0,
                },
                trades: {
                    total: tradesStats[0]?.totalTrades || 0,
                },
                deepwork: {
                    totalSessions: deepworkStats[0]?.totalSessions || 0,
                    completedSessions:
                        Number(deepworkStats[0]?.completedSessions) || 0,
                    totalWorkTime: Number(deepworkStats[0]?.totalWorkTime) || 0,
                    averageSessionDuration: Math.round(
                        Number(deepworkStats[0]?.averageSessionDuration) || 0
                    ),
                    longestSession:
                        Number(deepworkStats[0]?.longestSession) || 0,
                },
                pomodoro: {
                    totalSessions: pomodoroStats[0]?.totalSessions || 0,
                    completedSessions:
                        Number(pomodoroStats[0]?.completedSessions) || 0,
                    totalWorkTime: Number(pomodoroStats[0]?.totalWorkTime) || 0,
                },
                user: {
                    rank: currentUser.rank as string,
                    daysSinceRegistration,
                },
            };
        } catch (error) {
            if (error instanceof ORPCError) {
                throw error;
            }

            console.error("Error retrieving statistics:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Error retrieving statistics",
            });
        }
    }
);
