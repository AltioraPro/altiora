import { api } from "@/trpc/client";

export function useOptimizedInvalidation() {
    const utils = api.useUtils();

    const invalidateGoalsData = () => {
        Promise.all([
            utils.goals.getPaginated.invalidate(),
            utils.goals.getStats.invalidate(),
            utils.goals.getAll.invalidate(),
        ]);
    };

    const invalidateGoalsAndLimits = () => {
        Promise.all([
            utils.goals.getPaginated.invalidate(),
            utils.goals.getStats.invalidate(),
            utils.goals.getAll.invalidate(),
        ]);
    };

    const invalidateGoalsOnly = () => {
        Promise.all([
            utils.goals.getPaginated.invalidate(),
            utils.goals.getStats.invalidate(),
            utils.goals.getAll.invalidate(),
        ]);
    };

    return {
        invalidateGoalsData,
        invalidateGoalsAndLimits,
        invalidateGoalsOnly,
    };
}
