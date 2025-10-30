import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
    createHabit,
    deleteHabit,
    toggleHabitCompletion,
    updateHabit,
} from "./mutations";
import { updateUserRank } from "./mutations/updateUserRank";
import {
    getDailyStats,
    getHabitStats,
    getHabitsDashboard,
    getHabitsPaginated,
    getUserHabits,
} from "./queries";
import {
    createHabitValidator,
    deleteHabitValidator,
    getDashboardValidator,
    getHabitStatsValidator,
    getHabitsPaginatedValidator,
    toggleHabitCompletionValidator,
    updateHabitValidator,
} from "./validators";

export const habitsRouter = createTRPCRouter({
    getAll: protectedProcedure.query(
        async ({ ctx }) => await getUserHabits(ctx.session.userId)
    ),

    getPaginated: protectedProcedure
        .input(getHabitsPaginatedValidator)
        .query(
            async ({ ctx, input }) =>
                await getHabitsPaginated(ctx.session.userId, input)
        ),

    getDashboard: protectedProcedure
        .input(getDashboardValidator)
        .query(
            async ({ ctx, input }) =>
                await getHabitsDashboard(ctx.session.userId, input)
        ),

    getDailyStats: protectedProcedure
        .input(
            z.object({
                date: z
                    .string()
                    .regex(
                        /^\d{4}-\d{2}-\d{2}$/,
                        "Invalid date format (YYYY-MM-DD)"
                    ),
            })
        )
        .query(
            async ({ ctx, input }) =>
                await getDailyStats(ctx.session.userId, input.date)
        ),

    getStats: protectedProcedure
        .input(getHabitStatsValidator)
        .query(
            async ({ ctx, input }) =>
                await getHabitStats(ctx.session.userId, input)
        ),

    create: protectedProcedure
        .input(createHabitValidator)
        .mutation(
            async ({ ctx, input }) =>
                await createHabit(input, ctx.session.userId)
        ),

    update: protectedProcedure
        .input(updateHabitValidator)
        .mutation(
            async ({ ctx, input }) =>
                await updateHabit(input, ctx.session.userId)
        ),

    delete: protectedProcedure
        .input(deleteHabitValidator)
        .mutation(
            async ({ ctx, input }) =>
                await deleteHabit(input, ctx.session.userId)
        ),

    toggleCompletion: protectedProcedure
        .input(toggleHabitCompletionValidator)
        .mutation(
            async ({ ctx, input }) =>
                await toggleHabitCompletion(input, ctx.session.userId)
        ),

    reorder: protectedProcedure
        .input(
            z.object({
                habitIds: z
                    .array(z.string())
                    .min(1, "At least one habit required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { habitIds } = input;

            const updatePromises = habitIds.map((habitId, index) =>
                updateHabit(
                    { id: habitId, sortOrder: index },
                    ctx.session.userId
                )
            );

            await Promise.all(updatePromises);

            return { success: true, message: "Habit order updated" };
        }),

    updateRank: protectedProcedure.mutation(
        async ({ ctx }) => await updateUserRank(ctx.session.userId)
    ),
});
