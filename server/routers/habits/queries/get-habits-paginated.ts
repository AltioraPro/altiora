import { ORPCError } from "@orpc/client";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
    type HabitCompletion,
    habitCompletions,
    habits,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import type { HabitWithCompletions, PaginatedResponse } from "../types";
import { getHabitsPaginatedSchema } from "../validators";

export const getHabitsPaginatedBase = protectedProcedure.input(
    getHabitsPaginatedSchema
);

export const getHabitsPaginatedHandler = getHabitsPaginatedBase.handler(
    async ({
        context,
        input,
    }): Promise<PaginatedResponse<HabitWithCompletions>> => {
        try {
            const { db, session } = context;
            const userId = session.user.id;
            const {
                page,
                limit,
                sortBy,
                sortOrder,
                search,
                showInactive = false,
            } = input;
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

            const habitsWithCompletions: HabitWithCompletions[] =
                habitsData.map((habit) => {
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
                });

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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch paginated habits",
            });
        }
    }
);
