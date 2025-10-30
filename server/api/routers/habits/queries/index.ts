import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/server/db";
import {
    type HabitCompletion,
    habitCompletions,
    habits,
} from "@/server/db/schema";
import type {
    DailyHabitStats,
    HabitStatsOverview,
    HabitsDashboardData,
    HabitWithCompletions,
    PaginatedResponse,
} from "../types";
import type { getHabitStatsValidator } from "../validators";

export const getUserHabits = async (
    userId: string
): Promise<HabitWithCompletions[]> => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

        const habitsWithCompletionsData = await db
            .select({
                habit: habits,
                completion: habitCompletions,
            })
            .from(habits)
            .leftJoin(
                habitCompletions,
                and(
                    eq(habits.id, habitCompletions.habitId),
                    eq(habitCompletions.userId, userId),
                    gte(habitCompletions.completionDate, thirtyDaysAgoStr)
                )
            )
            .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
            .orderBy(
                asc(habits.sortOrder),
                asc(habits.createdAt),
                desc(habitCompletions.completionDate)
            );

        const habitsMap = new Map<string, HabitWithCompletions>();

        for (const row of habitsWithCompletionsData) {
            const habitId = row.habit.id;

            if (!habitsMap.has(habitId)) {
                habitsMap.set(habitId, {
                    ...row.habit,
                    completions: [],
                    completionRate: 0,
                });
            }

            if (row.completion) {
                const habit = habitsMap.get(habitId);
                if (!habit) {
                    continue;
                }
                habit.completions.push(row.completion);
            }
        }

        const habitsWithCompletions: HabitWithCompletions[] = Array.from(
            habitsMap.values()
        ).map((habit) => {
            const completedCount = habit.completions.filter(
                (c) => c.isCompleted
            ).length;
            const completionRate =
                habit.completions.length > 0
                    ? (completedCount / habit.completions.length) * 100
                    : 0;

            return {
                ...habit,
                completionRate,
            };
        });

        return habitsWithCompletions;
    } catch (error) {
        console.error("Error getUserHabits:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch habits",
        });
    }
};

export const getDailyStats = async (
    userId: string,
    date: string
): Promise<DailyHabitStats> => {
    try {
        const [statsResult, habitsData] = await Promise.all([
            db
                .select({
                    totalHabits: sql<number>`count(distinct ${habits.id})`,
                    completedHabits: sql<number>`count(case when ${habitCompletions.isCompleted} = true then 1 end)`,
                })
                .from(habits)
                .leftJoin(
                    habitCompletions,
                    and(
                        eq(habits.id, habitCompletions.habitId),
                        eq(habitCompletions.userId, userId),
                        eq(habitCompletions.completionDate, date)
                    )
                )
                .where(
                    and(
                        eq(habits.userId, userId),
                        eq(habits.isActive, true),
                        sql`${habits.createdAt}::date <= ${date}::date`
                    )
                ),

            db
                .select({
                    habit: habits,
                    completion: habitCompletions,
                })
                .from(habits)
                .leftJoin(
                    habitCompletions,
                    and(
                        eq(habits.id, habitCompletions.habitId),
                        eq(habitCompletions.userId, userId),
                        eq(habitCompletions.completionDate, date)
                    )
                )
                .where(
                    and(
                        eq(habits.userId, userId),
                        eq(habits.isActive, true),
                        sql`${habits.createdAt}::date <= ${date}::date`
                    )
                )
                .orderBy(asc(habits.sortOrder)),
        ]);

        const stats = statsResult[0];
        const totalHabits = Number(stats.totalHabits);
        const completedHabits = Number(stats.completedHabits);
        const completionPercentage =
            totalHabits > 0
                ? Math.round((completedHabits / totalHabits) * 100)
                : 0;

        const habitStats = habitsData.map((row) => ({
            id: row.habit.id,
            title: row.habit.title,
            emoji: row.habit.emoji,
            isCompleted: row.completion?.isCompleted ?? false,
            notes: row.completion?.notes ?? undefined,
        }));

        return {
            date,
            totalHabits,
            completedHabits,
            completionPercentage,
            habits: habitStats,
        };
    } catch (error) {
        console.error("Error getDailyStats:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch daily statistics",
        });
    }
};

export const getHabitStats = async (
    userId: string,
    input: z.infer<typeof getHabitStatsValidator>
): Promise<HabitStatsOverview> => {
    try {
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
        const totalPossibleCompletions = Number(stats.totalPossibleCompletions);
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
            weeklyStatsPromises.push(getDailyStats(userId, dateStr));
        }

        const weeklyStatsResults = await Promise.all(weeklyStatsPromises);
        weeklyStats.push(...weeklyStatsResults);

        const { currentStreak, longestStreak, worstDay } =
            calculateStreaks(weeklyStats);

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
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch statistics",
        });
    }
};

export const getHabitsDashboard = async (
    userId: string,
    params?: { viewMode: "today" | "week" | "month" }
): Promise<HabitsDashboardData> => {
    try {
        const { viewMode = "today" } = params || {};

        const today = new Date().toISOString().split("T")[0];

        const [todayStats, habits, stats] = await Promise.all([
            getDailyStats(userId, today),
            getUserHabits(userId),
            getHabitStats(userId, { period: "month" }),
        ]);

        const recentActivityPromises: Promise<DailyHabitStats>[] = [];
        const daysToFetch =
            viewMode === "today" ? 1 : viewMode === "week" ? 7 : 30;

        for (let i = daysToFetch - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            recentActivityPromises.push(getDailyStats(userId, dateStr));
        }

        const recentActivityResults = await Promise.all(recentActivityPromises);
        const recentActivity = recentActivityResults.map((result) => ({
            date: result.date,
            completionPercentage: result.completionPercentage,
        }));

        const adaptedTodayStats = todayStats;
        let adaptedRecentActivity = recentActivity;

        if (viewMode === "today") {
            adaptedRecentActivity = recentActivity.slice(-1);
        } else if (viewMode === "week") {
            adaptedRecentActivity = recentActivity.slice(-7);
        }

        const result = {
            todayStats: adaptedTodayStats,
            habits,
            stats,
            recentActivity: adaptedRecentActivity,
        };

        return result;
    } catch (error) {
        console.error("Error getHabitsDashboard:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch dashboard",
        });
    }
};

export const getHabitsPaginated = async (
    userId: string,
    params: {
        page: number;
        limit: number;
        sortBy: "title" | "createdAt" | "sortOrder";
        sortOrder: "asc" | "desc";
        search?: string;
        showInactive?: boolean;
    }
): Promise<PaginatedResponse<HabitWithCompletions>> => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            showInactive = false,
        } = params;
        const offset = page * limit;

        const whereConditions = [eq(habits.userId, userId)];

        if (!showInactive) {
            whereConditions.push(eq(habits.isActive, true));
        }

        if (search) {
            whereConditions.push(
                sql`(${habits.title} ILIKE ${`%${search}%`} OR ${habits.description} ILIKE ${`%${search}%`})`
            );
        }

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(habits)
            .where(and(...whereConditions));

        const total = Number(totalResult[0]?.count || 0);

        const sortColumn =
            sortBy === "title"
                ? habits.title
                : sortBy === "createdAt"
                  ? habits.createdAt
                  : habits.sortOrder;

        const sortDirection = sortOrder === "desc" ? desc : asc;

        const habitsData = await db
            .select()
            .from(habits)
            .where(and(...whereConditions))
            .orderBy(sortDirection(sortColumn), asc(habits.createdAt))
            .limit(limit)
            .offset(offset);

        const habitIds = habitsData.map((h) => h.id);

        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

        const completionsData = await db
            .select()
            .from(habitCompletions)
            .where(
                and(
                    eq(habitCompletions.userId, userId),
                    inArray(habitCompletions.habitId, habitIds),
                    gte(habitCompletions.completionDate, thirtyDaysAgoStr)
                )
            )
            .orderBy(desc(habitCompletions.completionDate));

        const completionsMap = new Map<string, HabitCompletion[]>();
        for (const completion of completionsData) {
            if (!completionsMap.has(completion.habitId)) {
                completionsMap.set(completion.habitId, []);
            }
            completionsMap.get(completion.habitId)?.push(completion);
        }

        const habitsWithCompletions: HabitWithCompletions[] = habitsData.map(
            (habit) => {
                const completions = completionsMap.get(habit.id) || [];
                const completedCount = completions.filter(
                    (c) => c.isCompleted
                ).length;
                const completionRate =
                    completions.length > 0
                        ? (completedCount / completions.length) * 100
                        : 0;

                return {
                    ...habit,
                    completions,
                    completionRate,
                };
            }
        );

        const totalPages = Math.ceil(total / limit);

        return {
            data: habitsWithCompletions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages - 1,
                hasPrev: page > 0,
            },
        };
    } catch (error) {
        console.error("Error getHabitsPaginated:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch paginated habits",
        });
    }
};

function calculateStreaks(dailyStats: DailyHabitStats[]): {
    currentStreak: number;
    longestStreak: number;
    worstDay: { date: string; percentage: number };
} {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let worstDay = { date: "", percentage: 100 };

    for (let i = dailyStats.length - 1; i >= 0; i--) {
        if (dailyStats[i]?.completionPercentage > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    for (const day of dailyStats) {
        if (day.completionPercentage > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }

        if (day.completionPercentage < worstDay.percentage) {
            worstDay = {
                date: day.date,
                percentage: day.completionPercentage,
            };
        }
    }

    return { currentStreak, longestStreak, worstDay };
}
