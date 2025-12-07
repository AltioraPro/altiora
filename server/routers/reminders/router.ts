import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    cancelRemindersBase,
    cancelRemindersHandler,
    processRemindersBase,
    processRemindersHandler,
    scheduleReminderBase,
    scheduleReminderHandler,
} from "./mutations";
import { getStatsBase, getStatsHandler } from "./queries/get-stats";

export const remindersRouter = base.router({
    // Queries
    getStats: getStatsBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getStatsHandler, undefined, { context })
        ),

    // Mutations
    scheduleReminder: scheduleReminderBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(scheduleReminderHandler, input, { context })
        ),

    cancelReminders: cancelRemindersBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(cancelRemindersHandler, input, { context })
        ),

    processReminders: processRemindersBase
        .route({ method: "POST" })
        .handler(
            async ({ context }) =>
                await call(processRemindersHandler, undefined, { context })
        ),
});
