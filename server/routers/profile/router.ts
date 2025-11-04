import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    getHabitHeatmapBase,
    getHabitHeatmapHandler,
} from "./queries/get-habit-heatmap";
import {
    getUserStatsBase,
    getUserStatsHandler,
} from "./queries/get-user-stats";

export const profileRouter = base.router({
    // Queries
    getUserStats: getUserStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getUserStatsHandler, undefined, { context })
        ),

    getHabitHeatmap: getHabitHeatmapBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getHabitHeatmapHandler, undefined, { context })
        ),
});
