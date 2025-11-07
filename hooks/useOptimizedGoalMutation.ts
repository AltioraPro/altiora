import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function useOptimizedGoalMutation() {
    const createGoalMutation = useMutation(
        orpc.goals.create.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );

    const updateGoalMutation = useMutation(
        orpc.goals.update.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );

    const deleteGoalMutation = useMutation(
        orpc.goals.delete.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );
    const markCompletedMutation = useMutation(
        orpc.goals.markCompleted.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );
    const updateProgressMutation = useMutation(
        orpc.goals.updateProgress.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );

    return {
        createGoal: createGoalMutation.mutate,
        updateGoal: updateGoalMutation.mutate,
        deleteGoal: deleteGoalMutation.mutate,
        markCompleted: markCompletedMutation.mutate,
        updateProgress: updateProgressMutation.mutate,
        isCreating: createGoalMutation.isPending,
        isUpdating: updateGoalMutation.isPending,
        isDeleting: deleteGoalMutation.isPending,
        isMarkingCompleted: markCompletedMutation.isPending,
        isUpdatingProgress: updateProgressMutation.isPending,
        createError: createGoalMutation.error,
        updateError: updateGoalMutation.error,
        deleteError: deleteGoalMutation.error,
    };
}
