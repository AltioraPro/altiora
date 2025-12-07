import { ORPCError } from "@orpc/client";
import { call } from "@orpc/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { habitCompletions, habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import type { DailyHabitStats, HabitStatsOverview } from "../types";
import { getHabitStatsSchema } from "../validators";
import { getDailyStatsHandler } from "./get-daily-stats";

function calculateStreaksFromWeeklyStats(dailyStats: DailyHabitStats[]): {
    worstDay: { date: string; percentage: number };
} {
    let worstDay = { date: "", percentage: 100 };

    for (const day of dailyStats) {
        if (day.completionPercentage < worstDay.percentage) {
            worstDay = {
                date: day.date,
                percentage: day.completionPercentage,
            };
        }
    }

    return { worstDay };
}

/**
 * Calcule le streak actuel et le plus long en utilisant les dates avec complétion
 * @param completedDates - Set de dates (format YYYY-MM-DD) où au moins une habitude a été complétée
 * @param today - Date du jour
 * @returns currentStreak et longestStreak
 */
function calculateStreaksFromDates(
    completedDates: Set<string>,
    today: Date
): { currentStreak: number; longestStreak: number } {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculer le streak actuel (depuis aujourd'hui en arrière)
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0] ?? "";

        if (completedDates.has(dateStr)) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculer le plus long streak sur l'année
    for (let i = 364; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0] ?? "";

        if (completedDates.has(dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    return { currentStreak, longestStreak };
}

export const getHabitStatsBase = protectedProcedure.input(getHabitStatsSchema);

export const getHabitStatsHandler = getHabitStatsBase.handler(
    async ({ context, input }): Promise<HabitStatsOverview> => {
        try {
            const { db, session } = context;
            const userId = session.user.id;
            const { period } = input;

            const today = new Date();
            let startDate: Date;
            let daysToFetch: number;

            switch (period) {
                case "week":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 7);
                    daysToFetch = 7;
                    break;
                case "month":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 30);
                    daysToFetch = 30;
                    break;
                case "quarter":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 90);
                    daysToFetch = 90;
                    break;
                case "year":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 365);
                    daysToFetch = 365;
                    break;
                default:
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 30);
                    daysToFetch = 30;
            }

            const startDateStr = startDate.toISOString().split("T")[0];

            const statsResult = await db
                .select({
                    totalActiveHabits: sql<number>`count(distinct ${habits.id})`,
                    totalCompletions: sql<number>`count(case when ${habitCompletions.isCompleted} = true then 1 end)`,
                    totalPossibleCompletions: sql<number>`count(distinct ${habits.id}) * ${daysToFetch}`,
                })
                .from(habits)
                .leftJoin(
                    habitCompletions,
                    and(
                        eq(habits.id, habitCompletions.habitId),
                        eq(habitCompletions.userId, userId),
                        gte(habitCompletions.completionDate, startDateStr)
                    )
                )
                .where(
                    and(
                        eq(habits.userId, userId),
                        eq(habits.isActive, true),
                        sql`${habits.createdAt}::date <= ${startDateStr}::date`
                    )
                );

            const stats = statsResult[0];
            const totalActiveHabits = Number(stats.totalActiveHabits);
            const totalCompletions = Number(stats.totalCompletions);
            const totalPossibleCompletions = Number(
                stats.totalPossibleCompletions
            );
            const averageCompletionRate =
                totalPossibleCompletions > 0
                    ? Math.round(
                          (totalCompletions / totalPossibleCompletions) * 100
                      )
                    : 0;

            const weeklyStats: DailyHabitStats[] = [];
            const weeklyStatsPromises: Promise<DailyHabitStats>[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];
                weeklyStatsPromises.push(
                    call(
                        getDailyStatsHandler,
                        { date: dateStr },
                        {
                            context,
                        }
                    )
                );
            }

            const weeklyStatsResults = await Promise.all(weeklyStatsPromises);
            weeklyStats.push(...weeklyStatsResults);

            // Récupérer les dates avec complétion sur les 365 derniers jours
            // pour calculer le streak de manière efficace (une seule requête SQL)
            const yearStartDate = new Date(today);
            yearStartDate.setDate(today.getDate() - 365);
            const yearStartDateStr = yearStartDate.toISOString().split("T")[0];

            const completedDatesResult = await db
                .select({
                    completionDate: habitCompletions.completionDate,
                })
                .from(habitCompletions)
                .where(
                    and(
                        eq(habitCompletions.userId, userId),
                        eq(habitCompletions.isCompleted, true),
                        gte(
                            habitCompletions.completionDate,
                            yearStartDateStr ?? ""
                        )
                    )
                );

            const completedDates = new Set(
                completedDatesResult.map((c) => c.completionDate)
            );

            const { currentStreak, longestStreak } = calculateStreaksFromDates(
                completedDates,
                today
            );
            const { worstDay } = calculateStreaksFromWeeklyStats(weeklyStats);

            const monthlyProgressPromises: Promise<
                {
                    date?: string;
                    completionPercentage: number;
                }[]
            >[] = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];

                monthlyProgressPromises.push(
                    db
                        .select({
                            date: sql<string>`${dateStr}`,
                            completionPercentage: sql<number>`case
                when count(distinct ${habits.id}) = 0 then 0
                else round((count(case when ${habitCompletions.isCompleted} = true then 1 end) * 100.0) / count(distinct ${habits.id}))
              end`,
                        })
                        .from(habits)
                        .leftJoin(
                            habitCompletions,
                            and(
                                eq(habits.id, habitCompletions.habitId),
                                eq(habitCompletions.userId, userId),
                                eq(habitCompletions.completionDate, dateStr)
                            )
                        )
                        .where(
                            and(
                                eq(habits.userId, userId),
                                eq(habits.isActive, true),
                                sql`${habits.createdAt}::date <= ${dateStr}::date`
                            )
                        )
                );
            }

            const monthlyProgressResults = await Promise.all(
                monthlyProgressPromises
            );
            const monthlyProgress = monthlyProgressResults.map((result) => ({
                date: result[0]?.date ?? "",
                completionPercentage: Number(result[0]?.completionPercentage),
            }));

            return {
                totalActiveHabits,
                currentStreak,
                longestStreak,
                worstDay,
                averageCompletionRate,
                weeklyStats,
                monthlyProgress,
            };
        } catch (error) {
            console.error("Error getHabitStats:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch statistics",
            });
        }
    }
);
