import { ORPCError } from "@orpc/client";
import { and, eq, gte } from "drizzle-orm";

import { habitCompletions } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getHabitHeatmapBase = protectedProcedure;

export const getHabitHeatmapHandler = getHabitHeatmapBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        try {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const startDate = oneYearAgo.toISOString().split("T")[0];

            const completions = await db
                .select({
                    completionDate: habitCompletions.completionDate,
                    isCompleted: habitCompletions.isCompleted,
                })
                .from(habitCompletions)
                .where(
                    and(
                        eq(habitCompletions.userId, session.user.id),
                        gte(habitCompletions.completionDate, startDate),
                        eq(habitCompletions.isCompleted, true)
                    )
                );

            const heatmapData = completions.reduce(
                (acc, completion) => {
                    const date = completion.completionDate;
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            );

            return heatmapData;
        } catch (error) {
            if (error instanceof ORPCError) {
                throw error;
            }

            console.error("Error retrieving habit heatmap:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Error retrieving habit heatmap",
            });
        }
    }
);
