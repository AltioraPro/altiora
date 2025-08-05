import { api } from "@/trpc/client";

export function useOptimizedInvalidation() {
  const utils = api.useUtils();

  const invalidateGoalsData = () => {
    // Invalidation optimisée en batch pour toutes les données goals
    Promise.all([
      utils.goals.getPaginated.invalidate(),
      utils.goals.getStats.invalidate(),
      utils.goals.getAll.invalidate(),
      utils.goals.getAllGoalLimits.invalidate(),
    ]);
  };

  const invalidateGoalsAndLimits = () => {
    // Invalidation spécifique pour les goals et leurs restrictions
    Promise.all([
      utils.goals.getPaginated.invalidate(),
      utils.goals.getStats.invalidate(),
      utils.goals.getAll.invalidate(),
      utils.goals.getAllGoalLimits.invalidate(),
    ]);
  };

  const invalidateGoalsOnly = () => {
    // Invalidation pour les goals seulement (sans les restrictions)
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