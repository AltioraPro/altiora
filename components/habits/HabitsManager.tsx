"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";
import { Edit2, Trash2, MoreVertical, GripVertical } from "lucide-react";
import type { HabitWithCompletions } from "@/server/api/routers/habits/types";

interface HabitsManagerProps {
  habits?: HabitWithCompletions[];
}

export function HabitsManager({ habits = [] }: HabitsManagerProps) {
  const { openEditModal, openCreateModal } = useHabits();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const utils = api.useUtils();

  const deleteHabit = api.habits.delete.useMutation({
    onMutate: async (variables) => {
      await utils.habits.getDashboard.cancel();
      
      const previousData = utils.habits.getDashboard.getData();
      
      setActiveDropdown(null);
      
      if (previousData) {
        const habitToDelete = previousData.habits.find(h => h.id === variables.id);
        
        const updatedHabits = previousData.habits.filter(habit => habit.id !== variables.id);
        
        const updatedTodayStats = {
          ...previousData.todayStats,
          habits: previousData.todayStats.habits.filter(habit => habit.id !== variables.id)
        };
        
        updatedTodayStats.totalHabits = updatedTodayStats.habits.length;
        const completedHabits = updatedTodayStats.habits.filter(h => h.isCompleted).length;
        updatedTodayStats.completedHabits = completedHabits;
        updatedTodayStats.completionPercentage = updatedTodayStats.totalHabits > 0 
          ? Math.round((completedHabits / updatedTodayStats.totalHabits) * 100) 
          : 0;
        
        const totalActiveHabits = habitToDelete?.isActive 
          ? previousData.stats.totalActiveHabits - 1 
          : previousData.stats.totalActiveHabits;
        
        const today = new Date().toISOString().split('T')[0]!;
        const updatedRecentActivity = previousData.recentActivity.map(activity => 
          activity.date === today 
            ? { ...activity, completionPercentage: updatedTodayStats.completionPercentage }
            : activity
        );
        
        const updatedWeeklyStats = previousData.stats.weeklyStats.map(stat => 
          stat.date === today 
            ? { ...stat, ...updatedTodayStats }
            : stat
        );
        
        utils.habits.getDashboard.setData(undefined, {
          ...previousData,
          habits: updatedHabits,
          todayStats: updatedTodayStats,
          recentActivity: updatedRecentActivity,
          stats: {
            ...previousData.stats,
            totalActiveHabits,
            weeklyStats: updatedWeeklyStats,
          }
        });
      }
      
      return { previousData };
    },
    onSuccess: () => {
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.habits.getDashboard.setData(undefined, context.previousData);
      }
      console.error("Error deleting habit:", error);
    },
    onSettled: () => {    
      utils.habits.getDashboard.invalidate();
    },
  });

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit.mutate({ id: habitId });
    }
  };

  const handleEditHabit = (habitId: string) => {
    openEditModal(habitId);
    setActiveDropdown(null);
  };

  const toggleDropdown = (habitId: string) => {
    setActiveDropdown(activeDropdown === habitId ? null : habitId);
  };

  if (!habits) {
    return <HabitsManagerSkeleton />;
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-argesta tracking-tight">
            HABITS MANAGER
          </h3>
          
          <div className="text-sm text-white/60 font-argesta">
            {habits.length} habit{habits.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <div className="w-16 h-16 bg-white/5 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <GripVertical className="w-8 h-8 opacity-30" />
              </div>
              <p className="font-argesta mb-2">No habits</p>
              <p className="text-sm mb-4">Create your first habit to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-argesta transition-all duration-300"
              >
                Create a habit
              </button>
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              >
                {/* Drag Handle */}
                <div className="flex items-center space-x-3">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-white/40 hover:text-white/60" />
                  </button>
                  
                  {/* Habit Info */}    
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl select-none">
                      {habit.emoji}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-argesta font-medium text-white">
                          {habit.title}
                        </h4>
                        {habit.id.startsWith('temp-') && (
                          <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      
                      {/* Completion Rate */}
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="text-xs text-white/60 font-argesta">
                          {habit.id.startsWith('temp-') 
                            ? "Creating..." 
                            : `${Math.round(habit.completionRate || 0)}% this month`
                          }
                        </div>
                        
                        {!habit.id.startsWith('temp-') && (
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (habit.completionRate || 0) >= 80 ? "bg-green-400" :
                                (habit.completionRate || 0) >= 60 ? "bg-white" : "bg-white/50"
                              }`}
                              style={{ width: `${habit.completionRate || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => !habit.id.startsWith('temp-') && toggleDropdown(habit.id)}
                    disabled={habit.id.startsWith('temp-')}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 group ${
                      habit.id.startsWith('temp-')
                        ? "border-white/10 bg-white/5 cursor-not-allowed opacity-50"
                        : "border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <MoreVertical className={`w-4 h-4 ${
                      habit.id.startsWith('temp-') 
                        ? "text-white/30" 
                        : "text-white/60 group-hover:text-white"
                    }`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeDropdown === habit.id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveDropdown(null)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-pure-black/95 backdrop-blur-sm border border-white/20 rounded-xl py-2 z-20 shadow-xl">
                        <button
                          onClick={() => handleEditHabit(habit.id)}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="font-argesta">Edit</span>
                        </button>
                        
                        <div className="h-px bg-white/10 my-1 mx-4" />
                        
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          disabled={deleteHabit.isPending}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-argesta">
                            {deleteHabit.isPending ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Add Button */}
        {habits.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={openCreateModal}
              className="w-full p-4 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl text-white/60 hover:text-white transition-all duration-300 group"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all duration-300">
                  <span className="text-xl">+</span>
                </div>
                <span className="font-argesta text-sm">ADD A HABIT</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function HabitsManagerSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-40 bg-white/10 rounded" />
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="w-8 h-8 bg-white/10 rounded" />
              <div>
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="h-16 bg-white/5 border-2 border-dashed border-white/20 rounded-xl" />
      </div>
    </div>
  );
} 