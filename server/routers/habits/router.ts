import { call } from "@orpc/server";
import { base } from "@/server/context";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import {
    createHabitBase,
    createHabitHandler,
    deleteHabitBase,
    deleteHabitHandler,
    toggleHabitCompletionBase,
    toggleHabitCompletionHandler,
    updateHabitBase,
    updateHabitHandler,
    updateUserRankBase,
    updateUserRankHandler,
} from "./mutations";
import {
    getDailyStatsBase,
    getDailyStatsHandler,
} from "./queries/get-daily-stats";
import {
    getHabitStatsBase,
    getHabitStatsHandler,
} from "./queries/get-habit-stats";
import {
    getHabitsDashboardBase,
    getHabitsDashboardHandler,
} from "./queries/get-habits-dashboard";
import {
    getHabitsPaginatedBase,
    getHabitsPaginatedHandler,
} from "./queries/get-habits-paginated";
import {
    getUserHabitsBase,
    getUserHabitsHandler,
} from "./queries/get-user-habits";
import { reorderHabitsSchema } from "./validators";

// Helper for reorder mutation (inline implementation)
const reorderHabitsBase = protectedProcedure.input(reorderHabitsSchema);

export const habitsRouter = base.router({
    // Queries
    getAll: getUserHabitsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getUserHabitsHandler, undefined, { context })
        ),

    getPaginated: getHabitsPaginatedBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getHabitsPaginatedHandler, input, { context })
        ),

    getDashboard: getHabitsDashboardBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getHabitsDashboardHandler, input, { context })
        ),

    getDailyStats: getDailyStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getDailyStatsHandler, input, { context })
        ),

    getStats: getHabitStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getHabitStatsHandler, input, { context })
        ),

    // Mutations
    create: createHabitBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createHabitHandler, input, { context })
        ),

    update: updateHabitBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateHabitHandler, input, { context })
        ),

    delete: deleteHabitBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteHabitHandler, input, { context })
        ),

    toggleCompletion: toggleHabitCompletionBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(toggleHabitCompletionHandler, input, { context })
        ),

    reorder: reorderHabitsBase
        .route({ method: "POST" })
        .handler(async ({ context, input }) => {
            const { habitIds } = input;

            const updatePromises = habitIds.map((habitId, index) =>
                call(
                    updateHabitHandler,
                    { id: habitId, sortOrder: index },
                    { context }
                )
            );

            await Promise.all(updatePromises);

            return { success: true, message: "Habit order updated" };
        }),

    updateRank: updateUserRankBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(updateUserRankHandler, undefined, { context })
        ),
});
