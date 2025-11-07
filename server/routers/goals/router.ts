import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    createGoalBase,
    createGoalHandler,
    createGoalsBase,
    createGoalsHandler,
    createGoalTaskBase,
    createGoalTaskHandler,
    createSubGoalBase,
    createSubGoalHandler,
    deleteGoalBase,
    deleteGoalHandler,
    deleteGoalTaskBase,
    deleteGoalTaskHandler,
    deleteSubGoalBase,
    deleteSubGoalHandler,
    markGoalCompletedBase,
    markGoalCompletedHandler,
    markTaskCompletedBase,
    markTaskCompletedHandler,
    reorderGoalsBase,
    reorderGoalsHandler,
    updateGoalBase,
    updateGoalHandler,
    updateGoalProgressBase,
    updateGoalProgressHandler,
    updateGoalTaskBase,
    updateGoalTaskHandler,
    updateSubGoalBase,
    updateSubGoalHandler,
} from "./mutations";
import { getGoalByIdBase, getGoalByIdHandler } from "./queries/get-goal-by-id";
import {
    getGoalStatsBase,
    getGoalStatsHandler,
} from "./queries/get-goal-stats";
import {
    getGoalWithDetailsBase,
    getGoalWithDetailsHandler,
} from "./queries/get-goal-with-details";
import {
    getGoalsByTypeBase,
    getGoalsByTypeHandler,
} from "./queries/get-goals-by-type";
import {
    getGoalsPaginatedBase,
    getGoalsPaginatedHandler,
} from "./queries/get-goals-paginated";
import {
    getUpcomingDeadlinesBase,
    getUpcomingDeadlinesHandler,
} from "./queries/get-upcoming-deadlines";
import {
    getUserGoalsBase,
    getUserGoalsHandler,
} from "./queries/get-user-goals";

export const goalsRouter = base.router({
    // Queries
    getAll: getUserGoalsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getUserGoalsHandler, undefined, { context })
        ),

    getPaginated: getGoalsPaginatedBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getGoalsPaginatedHandler, input, { context })
        ),

    getById: getGoalByIdBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getGoalByIdHandler, input, { context })
        ),

    getWithDetails: getGoalWithDetailsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getGoalWithDetailsHandler, input, { context })
        ),

    getStats: getGoalStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getGoalStatsHandler, input, { context })
        ),

    getByType: getGoalsByTypeBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getGoalsByTypeHandler, input, { context })
        ),

    getUpcomingDeadlines: getUpcomingDeadlinesBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getUpcomingDeadlinesHandler, input, { context })
        ),

    // Mutations
    create: createGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createGoalHandler, input, { context })
        ),

    batchCreate: createGoalsBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createGoalsHandler, input, { context })
        ),

    update: updateGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateGoalHandler, input, { context })
        ),

    delete: deleteGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteGoalHandler, input, { context })
        ),

    markCompleted: markGoalCompletedBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(markGoalCompletedHandler, input, { context })
        ),

    updateProgress: updateGoalProgressBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateGoalProgressHandler, input, { context })
        ),

    reorder: reorderGoalsBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(reorderGoalsHandler, input, { context })
        ),

    createSubGoal: createSubGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createSubGoalHandler, input, { context })
        ),

    updateSubGoal: updateSubGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateSubGoalHandler, input, { context })
        ),

    deleteSubGoal: deleteSubGoalBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteSubGoalHandler, input, { context })
        ),

    createTask: createGoalTaskBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createGoalTaskHandler, input, { context })
        ),

    updateTask: updateGoalTaskBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateGoalTaskHandler, input, { context })
        ),

    deleteTask: deleteGoalTaskBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteGoalTaskHandler, input, { context })
        ),

    markTaskCompleted: markTaskCompletedBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(markTaskCompletedHandler, input, { context })
        ),
});
