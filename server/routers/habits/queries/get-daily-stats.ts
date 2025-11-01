import { ORPCError } from "@orpc/client";
import { and, asc, eq, sql } from "drizzle-orm";
import { habitCompletions, habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import type { DailyHabitStats } from "../types";
import { getDailyStatsSchema } from "../validators";

export const getDailyStatsBase = protectedProcedure.input(getDailyStatsSchema);

export const getDailyStatsHandler = getDailyStatsBase.handler(
    async ({ context, input }): Promise<DailyHabitStats> => {
        try {
            const { db, session } = context;
            const userId = session.user.id;
            const { date } = input;

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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch daily statistics",
            });
        }
    }
);
