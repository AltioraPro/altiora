"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Check, Circle } from "lucide-react";
import type { DailyHabitStats } from "@/server/api/routers/habits/types";

interface TodayHabitsCardProps {
  data?: DailyHabitStats;
}

export function TodayHabitsCard({ data }: TodayHabitsCardProps) {
  const utils = api.useUtils();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, boolean>>({});

  const toggleCompletion = api.habits.toggleCompletion.useMutation({
    onMutate: async ({ habitId, isCompleted }) => {
      await utils.habits.getDashboard.cancel();
      
      const previousData = utils.habits.getDashboard.getData();
      
      setOptimisticUpdates(prev => ({ ...prev, [habitId]: isCompleted }));
      
        if (previousData) {
          const updatedTodayStats = {
            ...previousData.todayStats,
            habits: previousData.todayStats.habits.map(habit => 
              habit.id === habitId 
                ? { ...habit, isCompleted }
                : habit
            )
          };
          
          const completedHabits = updatedTodayStats.habits.filter(h => h.isCompleted).length;
          const totalHabits = updatedTodayStats.habits.length;
          const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
          
          updatedTodayStats.completedHabits = completedHabits;
          updatedTodayStats.completionPercentage = completionPercentage;
          
          const updatedHabits = previousData.habits.map(habit => {
            if (habit.id === habitId) {
              const currentCompletions = habit.completions || [];
              const today = new Date().toISOString().split('T')[0]!;
              
              const todayCompletionIndex = currentCompletions.findIndex(c => c.completionDate === today);
              
              let updatedCompletions;
              if (todayCompletionIndex >= 0) {
                updatedCompletions = currentCompletions.map(c => 
                  c.completionDate === today 
                    ? { ...c, isCompleted }
                    : c
                );
              } else {
                updatedCompletions = [
                  ...currentCompletions,
                  {
                    id: `temp-completion-${Date.now()}`,
                    userId: habit.userId,
                    habitId: habit.id,
                    completionDate: today,
                    isCompleted,
                    notes: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }
                ];
              }
              
              const completedCount = updatedCompletions.filter(c => c.isCompleted).length;
              const newCompletionRate = updatedCompletions.length > 0 ? (completedCount / updatedCompletions.length) * 100 : 0;
              
              return {
                ...habit,
                completions: updatedCompletions,
                completionRate: newCompletionRate,
              };
            }
            return habit;
          });
          
          const today = new Date().toISOString().split('T')[0]!;
          const updatedRecentActivity = previousData.recentActivity.map(activity => 
            activity.date === today 
              ? { ...activity, completionPercentage }
              : activity
          );
          
          const updatedWeeklyStats = previousData.stats.weeklyStats.map(stat => 
            stat.date === today 
              ? { ...stat, completedHabits, totalHabits, completionPercentage }
              : stat
          );

        const newData = {
          ...previousData,
          habits: updatedHabits,
          todayStats: updatedTodayStats,
          recentActivity: updatedRecentActivity,
          stats: {
            ...previousData.stats,
            weeklyStats: updatedWeeklyStats
          }
        };
        
        utils.habits.getDashboard.setData(undefined, newData);
        }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[variables.habitId];
        return newState;
      });
      
      if (context?.previousData) {
        utils.habits.getDashboard.setData(undefined, context.previousData);
      }
      
      console.error("Error toggle completion:", error);
    },
    onSettled: () => {
      utils.habits.getDashboard.invalidate();
    },
  });

  const handleToggleHabit = async (habitId: string, currentStatus: boolean) => {
    if (habitId.startsWith('temp-')) {
      return;
    }
    
    const today = new Date().toISOString().split('T')[0]!;
    
    toggleCompletion.mutate({
      habitId,
      completionDate: today,
      isCompleted: !currentStatus,
    });
  };

  if (!data) {
    return <TodayHabitsCardSkeleton />;
  }

  const { habits, completionPercentage, completedHabits, totalHabits } = data;

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
                  className="transition-all duration-500 ease-out"
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
          {habits.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-argesta">No habits configured</p>
              <p className="text-sm mt-1">Create your first habit to get started</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = optimisticUpdates[habit.id] ?? habit.isCompleted;
              
              return (
                <div
                  key={habit.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Emoji */}
                  <div className="relative">
                    <div className={`text-2xl select-none transition-all duration-300 ${
                      isCompleted ? "scale-110" : ""
                    }`}>
                      {habit.emoji}
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1">
                    <h4 className={`font-argesta font-medium transition-all duration-300 ${
                      isCompleted ? "text-green-300 line-through" : "text-white"
                    }`}>
                      {habit.title}
                    </h4>
                    {habit.notes && (
                      <p className="text-sm text-white/60 mt-1">{habit.notes}</p>
                    )}
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleHabit(habit.id, isCompleted)}
                    disabled={toggleCompletion.isPending || habit.id.startsWith('temp-')}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
                      habit.id.startsWith('temp-')
                        ? "border-white/20 bg-white/5 cursor-not-allowed"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    {habit.id.startsWith('temp-') ? (
                      <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      isCompleted && <Check className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        {habits.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-sm text-white/60">
            <span className="font-argesta">
              {completionPercentage === 100 
                ? "🎉 Perfect! All habits completed" 
                : `${totalHabits - completedHabits} habit(s) remaining`
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