import { api } from "@/trpc/client";
import { useOptimizedInvalidation } from "./useOptimizedInvalidation";

export function useOptimizedGoalMutation() {
  const utils = api.useUtils();
  const { invalidateGoalsAndLimits, invalidateGoalsOnly } = useOptimizedInvalidation();

  const createGoalMutation = api.goals.create.useMutation({
    onSuccess: (data) => {
      // Invalidation optimisée avec batch
      invalidateGoalsAndLimits();
      return data;
    },
    onError: (error) => {
      console.error("Error creating goal:", error);
      throw error;
    },
  });

  const updateGoalMutation = api.goals.update.useMutation({
    onSuccess: () => {
      // Invalidation optimisée
      invalidateGoalsOnly();
    },
  });

  const deleteGoalMutation = api.goals.delete.useMutation({
    onSuccess: () => {
      // Invalidation optimisée avec mise à jour des limites
      invalidateGoalsAndLimits();
    },
  });

  const markCompletedMutation = api.goals.markCompleted.useMutation({
    onSuccess: () => {
      // Invalidation optimisée
      invalidateGoalsOnly();
    },
  });

  const updateProgressMutation = api.goals.updateProgress.useMutation({
    onSuccess: () => {
      // Invalidation optimisée
      invalidateGoalsOnly();
    },
  });

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