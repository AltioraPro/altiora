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

  optimisticUpdates: Record<string, boolean>;
  setOptimisticUpdate: (habitId: string, isCompleted: boolean) => void;
  clearOptimisticUpdates: () => void;
  clearOptimisticUpdate: (habitId: string) => void;
  
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

  const setSelectedDate = (date: string) => {
    
    console.log("Selected date:", date);
  };

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

      if (todayHabits) {
        const updatedHabits = todayHabits.map(habit => ({
          ...habit,
          isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted
        }));
        
        const completedHabits = updatedHabits.filter(h => h.isCompleted).length;
        const totalHabits = updatedHabits.length;
        const todayCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
        
        const realTotalActiveHabits = totalHabits;
        
        const weeklyStats = data.weeklyStats || [];
        const today = new Date().toISOString().split('T')[0]!;
        
        const updatedWeeklyStats = weeklyStats.map(stat => 
          stat.date === today 
            ? { ...stat, completionPercentage: todayCompletionRate }
            : stat
        );
        
        const totalCompletionRates = updatedWeeklyStats.reduce((sum, stat) => sum + stat.completionPercentage, 0);
        const newAverageCompletionRate = updatedWeeklyStats.length > 0 
          ? Math.round(totalCompletionRates / updatedWeeklyStats.length) 
          : todayCompletionRate;
        
        const worstDay = updatedWeeklyStats.reduce((worst, stat) => 
          stat.completionPercentage < worst.percentage 
            ? { date: stat.date, percentage: stat.completionPercentage }
            : worst
        , { date: '', percentage: 100 });
        
        const todayCompletedHabits = updatedHabits.filter(h => h.isCompleted).length;
        const hasValidatedToday = todayCompletedHabits > 0;
        
        const todayStatsFromServer = updatedWeeklyStats.find(stat => stat.date === today);
        const todayWasAlreadyCounted = todayStatsFromServer && todayStatsFromServer.completionPercentage > 0;
        

        const optimisticCurrentStreak = hasValidatedToday
          ? (todayWasAlreadyCounted ? data.currentStreak : Math.max(data.currentStreak + 1, 1))
          : data.currentStreak;
        
        const optimisticLongestStreak = Math.max(data.longestStreak, optimisticCurrentStreak);
        
        return {
          ...data,
          totalActiveHabits: realTotalActiveHabits,
          averageCompletionRate: newAverageCompletionRate,
          weeklyStats: updatedWeeklyStats,
          worstDay,
         
          currentStreak: optimisticCurrentStreak,
          longestStreak: optimisticLongestStreak
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