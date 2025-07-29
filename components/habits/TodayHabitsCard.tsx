"use client";

import { useCallback, useRef, useMemo } from "react";
import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";
import { useToast } from "@/components/ui/toast";
import { Circle, Check } from "lucide-react";
import type { DailyHabitStats } from "@/server/api/routers/habits/types";
import { memo } from "react";

interface TodayHabitsCardProps {
  data?: DailyHabitStats;
}

interface HabitItemProps {
  habit: { 
    id: string; 
    title: string; 
    emoji: string; 
    isCompleted: boolean; 
    notes?: string 
  }; 
  isOptimistic: boolean; 
  onToggle: () => void; 
}

// OPTIMIZATION: Memoized component for each habit with proper prop types
const HabitItem = memo<HabitItemProps>(({ 
  habit, 
  isOptimistic, 
  onToggle 
}) => {
  const handleClick = useCallback(() => {
    if (!habit.id.startsWith('temp-')) {
      onToggle();
    }
  }, [habit.id, onToggle]);

  const isTempHabit = habit.id.startsWith('temp-');

  return (
    <div
      className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${
        habit.isCompleted
          ? "bg-green-500/10 border-green-500/30"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      } ${isOptimistic ? "opacity-80" : ""}`}
    >
      {/* Emoji */}
      <div className="relative">
        <div className={`text-2xl select-none transition-all duration-200 ${
          habit.isCompleted ? "scale-110" : ""
        }`}>
          {habit.emoji}
        </div>
        {habit.isCompleted && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Habit Info */}
      <div className="flex-1">
        <h4 className={`font-argesta font-medium transition-all duration-200 ${
          habit.isCompleted ? "text-green-300 line-through" : "text-white"
        }`}>
          {habit.title}
        </h4>
        {habit.notes && (
          <p className="text-sm text-white/60 mt-1">{habit.notes}</p>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleClick}
        disabled={isTempHabit}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
          isTempHabit
            ? "border-white/20 bg-white/5 cursor-not-allowed"
            : habit.isCompleted
            ? "bg-green-500 border-green-500 text-white"
            : "border-white/30 hover:border-white/60"
        }`}
      >
        {isTempHabit ? (
          <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
        ) : (
          habit.isCompleted && <Check className="w-4 h-4" />
        )}
      </button>
    </div>
  );
});

HabitItem.displayName = "HabitItem";

export function TodayHabitsCard({ data }: TodayHabitsCardProps) {
  const { 
    setOptimisticUpdate, 
    clearOptimisticUpdate, 
    getOptimisticTodayStats,
    getOptimisticStats,
    getOptimisticRecentActivity,
    optimisticUpdates
  } = useHabits();
  const { addToast } = useToast();
  
  const lastClickTimes = useRef<Map<string, number>>(new Map());

  const utils = api.useUtils();

  // Optimistic data calculation
  const optimisticData = useMemo(() => {
    return getOptimisticTodayStats(data);
  }, [data, getOptimisticTodayStats]);

  const toggleCompletion = api.habits.toggleCompletion.useMutation({
    onMutate: async ({ habitId, isCompleted }) => {
      // Set optimistic update
      setOptimisticUpdate(habitId, isCompleted);
      
      // Cancel any outgoing refetches
      await utils.habits.getDashboard.cancel();
      
      // Snapshot the previous value
      const previousData = utils.habits.getDashboard.getData();
      
      if (previousData) {
        // Optimistically update the dashboard data
        const optimisticTodayStats = getOptimisticTodayStats(previousData.todayStats);
        const optimisticStats = getOptimisticStats(previousData.stats, optimisticTodayStats?.habits);
        const optimisticRecentActivity = getOptimisticRecentActivity(previousData.recentActivity, optimisticTodayStats?.habits);
        
        utils.habits.getDashboard.setData(undefined, {
          ...previousData,
          todayStats: optimisticTodayStats || previousData.todayStats,
          stats: optimisticStats || previousData.stats,
          recentActivity: optimisticRecentActivity || previousData.recentActivity,
        });
      }
      
      return { previousData };
    },
    onSuccess: () => {
      // Optimistic updates are cleared automatically by the context
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      clearOptimisticUpdate(variables.habitId);
      
      // Revert the optimistic data
      if (context?.previousData) {
        utils.habits.getDashboard.setData(undefined, context.previousData);
      }
      
      addToast({
        type: "error",
        title: "Erreur",
        message: error.message || "Impossible de mettre à jour l'habitude",
      });
    },
    onSettled: () => {
      utils.habits.getDashboard.invalidate();
    },
  });

  // OPTIMIZATION: Memoization of toggle handler with debouncing to avoid rapid clicks
  const handleToggleHabit = useCallback(async (habitId: string, currentStatus: boolean) => {
    if (habitId.startsWith('temp-')) {
      return;
    }
    
    // Avoid multiple clicks on the same habit in a short time
    const now = Date.now();
    const lastClick = lastClickTimes.current.get(habitId) || 0;
    
    if (now - lastClick < 300) { // 300ms protection
      return;
    }
    
    lastClickTimes.current.set(habitId, now);
    
    const today = new Date().toISOString().split('T')[0]!;
    
    toggleCompletion.mutate({
      habitId,
      completionDate: today,
      isCompleted: !currentStatus,
    });
  }, [toggleCompletion]);

  // Memoize the habits list to prevent unnecessary re-renders
  const habitsList = useMemo(() => {
    if (!optimisticData?.habits) return [];
    
    return optimisticData.habits.map((habit) => ({
      ...habit,
      isOptimistic: optimisticUpdates[habit.id] !== undefined
    }));
  }, [optimisticData?.habits, optimisticUpdates]);

  if (!optimisticData) {
    return <TodayHabitsCardSkeleton />;
  }

  const { completionPercentage, completedHabits, totalHabits } = optimisticData;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-argesta tracking-tight">
              TODAY&apos;S HABITS
            </h3>
            <p className="text-white/60 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-bold font-argesta">
                <span className={`${
                  completionPercentage === 100 
                    ? "text-green-400" 
                    : completionPercentage >= 50 
                    ? "text-white" 
                    : "text-white/70"
                }`}>
                  {completionPercentage}%
                </span>
              </div>
              <div className="text-xs text-white/50 font-argesta">
                {completedHabits}/{totalHabits} COMPLETED
              </div>
            </div>
            
            <div className="relative w-16 h-16">
              {/* Progress Ring */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.1"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={completionPercentage === 100 ? "#4ade80" : "white"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                {completionPercentage === 100 ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <span className="text-sm font-bold font-argesta">
                    {Math.round(completionPercentage)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {habitsList.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-argesta">No habits configured</p>
              <p className="text-sm mt-1">Create your first habit to get started</p>
            </div>
          ) : (
            habitsList.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isOptimistic={habit.isOptimistic}
                onToggle={() => handleToggleHabit(habit.id, habit.isCompleted)}
              />
            ))
          )}
        </div>

        {/* Quick Actions */}
        {habitsList.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-sm text-white/60">
            <span className="font-argesta">
              {completionPercentage === 100 
                ? "🎉 Perfect! All habits completed" 
                : completedHabits > 0
                ? `✅ ${completedHabits} validated - Your streak continues!`
                : `${totalHabits} habits - Validate at least one to maintain your streak`
              }
            </span>
            
            {completionPercentage === 100 && (
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-argesta">GOAL ACHIEVED</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function TodayHabitsCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-48 bg-white/10 rounded mb-2" />
          <div className="h-4 w-32 bg-white/5 rounded" />
        </div>
        <div className="w-16 h-16 bg-white/10 rounded-full" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-8 h-8 bg-white/10 rounded" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
} 