import { api } from "@/trpc/client";
import { useMemo } from "react";

// OPTIMISATION: Hook personnalisé pour les requêtes habits avec cache optimisé
export function useHabitsDashboard(viewMode: 'today' | 'week' | 'month') {
  const { data, isLoading, error, refetch } = api.habits.getDashboard.useQuery({
    viewMode
  }, {
    // OPTIMISATION: Configuration spécifique pour les habitudes
    staleTime: 5 * 60 * 1000, // 5 minutes - les habitudes changent peu
    gcTime: 15 * 60 * 1000, // 15 minutes de cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Retry intelligent basé sur le type d'erreur
      if (error && typeof error === 'object' && 'code' in error) {
        const code = (error as any).code;
        // Ne pas retry sur les erreurs d'authentification
        if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // OPTIMISATION: Memoization des données calculées
  const memoizedData = useMemo(() => {
    if (!data) return null;
    
    return {
      ...data,
      // Pré-calculer les statistiques fréquemment utilisées
      todayStats: {
        ...data.todayStats,
        // Calculer le pourcentage une seule fois
        completionPercentage: data.todayStats.totalHabits > 0 
          ? Math.round((data.todayStats.completedHabits / data.todayStats.totalHabits) * 100)
          : 0
      },
      // Pré-calculer les habitudes par statut
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
    // OPTIMISATION: Méthodes utilitaires
    isTodayComplete: memoizedData?.todayStats.completionPercentage === 100,
    hasHabits: memoizedData?.todayStats.habits.length > 0,
  };
}

// OPTIMISATION: Hook pour les mutations avec optimistic updates
export function useHabitsMutations() {
  const utils = api.useUtils();
  
  const toggleCompletion = api.habits.toggleCompletion.useMutation({
    onMutate: async ({ habitId, isCompleted }) => {
      // Annuler les requêtes en cours
      await utils.habits.getDashboard.cancel();
      
      // Sauvegarder l'état précédent
      const previousData = utils.habits.getDashboard.getData();
      
      // Mise à jour optimiste
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
      // Restaurer l'état précédent en cas d'erreur
      if (context?.previousData) {
        utils.habits.getDashboard.setData(undefined, context.previousData);
      }
      console.error("Error toggling habit completion:", error);
    },
    onSettled: () => {
      // Invalider le cache pour forcer un refresh
      utils.habits.getDashboard.invalidate();
    },
  });

  return {
    toggleCompletion,
    isPending: toggleCompletion.isPending,
  };
} 