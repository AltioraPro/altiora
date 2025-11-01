import { ORPCError } from "@orpc/client";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getDashboardSchema } from "../validators";
import type { DailyHabitStats, HabitsDashboardData } from "../types";
import { getDailyStatsHandler } from "./get-daily-stats";
import { getUserHabitsHandler } from "./get-user-habits";
import { getHabitStatsHandler } from "./get-habit-stats";

export const getHabitsDashboardBase =
    protectedProcedure.input(getDashboardSchema);

export const getHabitsDashboardHandler = getHabitsDashboardBase.handler(
    async ({ context, input }): Promise<HabitsDashboardData> => {
        try {
            const { viewMode = "today" } = input;

            const today = new Date().toISOString().split("T")[0];

            const [todayStats, habits, stats] = await Promise.all([
                getDailyStatsHandler.handler({
                    context,
                    input: { date: today },
                }),
                getUserHabitsHandler.handler({ context }),
                getHabitStatsHandler.handler({
                    context,
                    input: { period: "month" },
                }),
            ]);

            const recentActivityPromises: Promise<DailyHabitStats>[] = [];
            const daysToFetch =
                viewMode === "today" ? 1 : viewMode === "week" ? 7 : 30;

            for (let i = daysToFetch - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];

                recentActivityPromises.push(
                    getDailyStatsHandler.handler({
                        context,
                        input: { date: dateStr },
                    })
                );
            }

            const recentActivityResults = await Promise.all(
                recentActivityPromises
            );
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch dashboard",
            });
        }
    }
);
