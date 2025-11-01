import { ORPCError } from "@orpc/client";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { habitCompletions, habits } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import type { HabitWithCompletions } from "../types";

export const getUserHabitsBase = protectedProcedure;

export const getUserHabitsHandler = getUserHabitsBase.handler(
    async ({ context }): Promise<HabitWithCompletions[]> => {
        try {
            const { db, session } = context;
            const userId = session.user.id;

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
                .where(
                    and(eq(habits.userId, userId), eq(habits.isActive, true))
                )
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch habits",
            });
        }
    }
);
