"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type { DailyHabitStats, HabitStatsOverview } from "@/server/api/routers/habits/types";

interface HabitsContextValue {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingHabit: string | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (habitId: string) => void;
  closeEditModal: () => void;
  
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  viewMode: "today" | "week" | "month";
  setViewMode: (mode: "today" | "week" | "month") => void;

  // Optimistic updates management
  optimisticUpdates: Record<string, boolean>;
  setOptimisticUpdate: (habitId: string, isCompleted: boolean) => void;
  clearOptimisticUpdates: () => void;
  clearOptimisticUpdate: (habitId: string) => void;
  
  // Optimistic data calculation
  getOptimisticTodayStats: (data?: DailyHabitStats) => DailyHabitStats | undefined;
  getOptimisticStats: (data?: HabitStatsOverview, todayHabits?: Array<{ id: string; isCompleted: boolean }>) => HabitStatsOverview | undefined;
  getOptimisticRecentActivity: (data?: Array<{ date: string; completionPercentage: number }>, habits?: Array<{ id: string; isCompleted: boolean }>) => Array<{ date: string; completionPercentage: number }> | undefined;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}

interface HabitsProviderProps {
  children: ReactNode;
}

export function HabitsProvider({ children }: HabitsProviderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [viewMode, setViewMode] = useState<"today" | "week" | "month">("today");
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const openEditModal = (habitId: string) => {
    setEditingHabit(habitId);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingHabit(null);
    setIsEditModalOpen(false);
  };

  // Fonction pour changer la date (pour l'instant statique sur aujourd'hui)  
  const setSelectedDate = (date: string) => {
    // Pour l'instant on garde la date d'aujourd'hui
    // Cette fonction sera utile plus tard pour la navigation temporelle
    console.log("Date sélectionnée:", date);
  };

  // Optimistic updates management
  const setOptimisticUpdate = (habitId: string, isCompleted: boolean) => {
    setOptimisticUpdates(prev => ({ ...prev, [habitId]: isCompleted }));
  };

  const clearOptimisticUpdates = () => {
    setOptimisticUpdates({});
  };

  const clearOptimisticUpdate = (habitId: string) => {
    setOptimisticUpdates(prev => {
      const newState = { ...prev };
      delete newState[habitId];
      return newState;
    });
  };

  // Optimistic data calculation functions
  const getOptimisticTodayStats = useMemo(() => {
    return (data?: DailyHabitStats) => {
      if (!data) return data;

      const updatedHabits = data.habits.map(habit => ({
        ...habit,
        isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted
      }));

      const completedHabits = updatedHabits.filter(h => h.isCompleted).length;
      const totalHabits = updatedHabits.length;
      const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

      return {
        ...data,
        habits: updatedHabits,
        completedHabits,
        totalHabits,
        completionPercentage
      };
    };
  }, [optimisticUpdates]);

  const getOptimisticStats = useMemo(() => {
    return (data?: HabitStatsOverview, todayHabits?: Array<{ id: string; isCompleted: boolean }>) => {
      if (!data) return data;

      // Recalculer les statistiques basées sur les optimistic updates
      if (todayHabits) {
        const updatedHabits = todayHabits.map(habit => ({
          ...habit,
          isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted
        }));
        
        const completedHabits = updatedHabits.filter(h => h.isCompleted).length;
        const totalHabits = updatedHabits.length;
        const todayCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
        
        // Utiliser le nombre réel d'habitudes d'aujourd'hui
        const realTotalActiveHabits = totalHabits;
        
        // Recalculer le taux de completion moyen en incluant aujourd'hui
        const weeklyStats = data.weeklyStats || [];
        const today = new Date().toISOString().split('T')[0]!;
        
        const updatedWeeklyStats = weeklyStats.map(stat => 
          stat.date === today 
            ? { ...stat, completionPercentage: todayCompletionRate }
            : stat
        );
        
        // Calculer le nouveau taux moyen
        const totalCompletionRates = updatedWeeklyStats.reduce((sum, stat) => sum + stat.completionPercentage, 0);
        const newAverageCompletionRate = updatedWeeklyStats.length > 0 
          ? Math.round(totalCompletionRates / updatedWeeklyStats.length) 
          : todayCompletionRate;
        
        return {
          ...data,
          totalActiveHabits: realTotalActiveHabits,
          averageCompletionRate: newAverageCompletionRate,
          weeklyStats: updatedWeeklyStats
        };
      }
      
      return data;
    };
  }, [optimisticUpdates]);

  const getOptimisticRecentActivity = useMemo(() => {
    return (data?: Array<{ date: string; completionPercentage: number }>, habits?: Array<{ id: string; isCompleted: boolean }>) => {
      if (!data) return data;

      const today = new Date().toISOString().split('T')[0]!;
      
      return data.map(activity => {
        if (activity.date === today && habits) {
          // Recalculer le pourcentage pour aujourd'hui basé sur les optimistic updates
          const updatedHabits = habits.map(habit => ({
            ...habit,
            isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted
          }));
          
          const completedHabits = updatedHabits.filter(h => h.isCompleted).length;
          const totalHabits = updatedHabits.length;
          const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
          
          return {
            ...activity,
            completionPercentage
          };
        }
        return activity;
      });
    };
  }, [optimisticUpdates]);

  const value: HabitsContextValue = {
    isCreateModalOpen,
    isEditModalOpen,
    editingHabit,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    optimisticUpdates,
    setOptimisticUpdate,
    clearOptimisticUpdates,
    clearOptimisticUpdate,
    getOptimisticTodayStats,
    getOptimisticStats,
    getOptimisticRecentActivity,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
} 