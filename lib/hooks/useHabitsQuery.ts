import { api } from "@/trpc/client";
import { useMemo } from "react";

// OPTIMIZATION: Custom hook for habits queries with optimized cache
export function useHabitsDashboard(viewMode: 'today' | 'week' | 'month') {
  const { data, isLoading, error, refetch } = api.habits.getDashboard.useQuery({
    viewMode
  }, {
    // OPTIMIZATION: Specific configuration for habits
    staleTime: 5 * 60 * 1000, // 5 minutes - habits change little
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Smart retry based on error type
      if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as { code?: string }).code;
        // Don't retry on authentication errors
        if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // OPTIMIZATION: Memoization of calculated data
  const memoizedData = useMemo(() => {
    if (!data) return null;
    
    return {
      ...data,
      // Pre-calculate habits by status
      habitsByStatus: {
        completed: data.todayStats.habits.filter(h => h.isCompleted),
        pending: data.todayStats.habits.filter(h => !h.isCompleted),
      }
    };
  }, [data]);

  return {
    data: memoizedData,
    isLoading,
    error,
    refetch,
    // OPTIMIZATION: Utility methods
    isTodayComplete: memoizedData?.todayStats.completionPercentage === 100,
    hasHabits: memoizedData?.todayStats.habits.length && memoizedData.todayStats.habits.length > 0,
  };
}

// OPTIMIZATION: Hook for mutations with optimistic updates
export function useHabitsMutations() {
  const utils = api.useUtils();
  
  const toggleCompletion = api.habits.toggleCompletion.useMutation({
    onMutate: async ({ habitId, isCompleted }) => {
      // Cancel ongoing queries
      await utils.habits.getDashboard.cancel();
      
      // Save previous state
      const previousData = utils.habits.getDashboard.getData();
      
      // Optimistic update
      if (previousData) {
        utils.habits.getDashboard.setData(undefined, {
          ...previousData,
          todayStats: {
            ...previousData.todayStats,
            habits: previousData.todayStats.habits.map(habit => 
              habit.id === habitId 
                ? { ...habit, isCompleted }
                : habit
            )
          }
        });
      }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Restore previous state on error
      if (context?.previousData) {
        utils.habits.getDashboard.setData(undefined, context.previousData);
      }
      console.error("Error toggling habit completion:", error);
    },
    onSettled: () => {
      // Invalidate cache to force refresh
      utils.habits.getDashboard.invalidate();
    },
  });

  return {
    toggleCompletion,
    isPending: toggleCompletion.isPending,
  };
} 