"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";
import { X } from "lucide-react";

const HABIT_EMOJIS = [
  "🎯", "💪", "📚", "🏃", "🧘", "💧", "🌱", "⚡", "🔥", "⭐",
  "🌅", "🛏️", "🥗", "🏋️", "📝", "🎨", "🎵", "💻", "📱", "🧠",
  "☀️", "🌙", "❤️", "🦷", "👥", "🚀", "🎪", "🏆", "💎", "🌈"
];

const HABIT_COLORS = [
  "#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db",
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"
];

export function EditHabitModal() {
  const { isEditModalOpen, editingHabit, closeEditModal, openEditModal } = useHabits();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [targetFrequency, setTargetFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isActive, setIsActive] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const utils = api.useUtils();

  // Récupérer toutes les habitudes pour l'édition (sans pagination)
  const { data: habits } = api.habits.getAll.useQuery(undefined, {
    enabled: isEditModalOpen && !!editingHabit,
  });

  const updateHabit = api.habits.update.useMutation({
    onMutate: async (updatedHabit) => {
      await utils.habits.getDashboard.cancel();
      await utils.habits.getPaginated.cancel();
      const previousData = utils.habits.getDashboard.getData();
      
      closeEditModal();
      
      if (previousData) {
        const updatedHabits = previousData.habits.map(habit =>
          habit.id === updatedHabit.id
            ? { ...habit, ...updatedHabit, updatedAt: new Date() }
            : habit
        );
        
        const updatedTodayStats = {
          ...previousData.todayStats,
          habits: previousData.todayStats.habits.map(habit =>
            habit.id === updatedHabit.id
              ? { ...habit, title: updatedHabit.title || habit.title, emoji: updatedHabit.emoji || habit.emoji }
              : habit
          )
        };
        
        const oldHabit = previousData.habits.find(h => h.id === updatedHabit.id);
        let totalActiveHabits = previousData.stats.totalActiveHabits;
        
        if (oldHabit && updatedHabit.isActive !== undefined) {
          if (oldHabit.isActive && !updatedHabit.isActive) {
            totalActiveHabits -= 1;
            
            const updatedTodayStatsForDeactivation = {
              ...updatedTodayStats,
              habits: updatedTodayStats.habits.filter(h => h.id !== updatedHabit.id)
            };
            
            updatedTodayStatsForDeactivation.totalHabits = updatedTodayStatsForDeactivation.habits.length;
            const completedHabits = updatedTodayStatsForDeactivation.habits.filter(h => h.isCompleted).length;
            updatedTodayStatsForDeactivation.completedHabits = completedHabits;
            updatedTodayStatsForDeactivation.completionPercentage = updatedTodayStatsForDeactivation.totalHabits > 0 
              ? Math.round((completedHabits / updatedTodayStatsForDeactivation.totalHabits) * 100) 
              : 0;
              
            Object.assign(updatedTodayStats, updatedTodayStatsForDeactivation);
            
          } else if (!oldHabit.isActive && updatedHabit.isActive) {
            totalActiveHabits += 1;
            
            const newTodayHabit = {
              id: updatedHabit.id,
              title: updatedHabit.title || oldHabit.title,
              emoji: updatedHabit.emoji || oldHabit.emoji,
              isCompleted: false,
              notes: undefined,
            };
            
            updatedTodayStats.habits.push(newTodayHabit);
            updatedTodayStats.totalHabits = updatedTodayStats.habits.length;
            const completedHabits = updatedTodayStats.habits.filter(h => h.isCompleted).length;
            updatedTodayStats.completedHabits = completedHabits;
            updatedTodayStats.completionPercentage = updatedTodayStats.totalHabits > 0 
              ? Math.round((completedHabits / updatedTodayStats.totalHabits) * 100) 
              : 0;
          }
        }
        
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
      
      if (variables.id) {
        openEditModal(variables.id);
      }
      
      console.error("Error updating habit:", error);
    },
    onSettled: () => {
      utils.habits.getDashboard.invalidate();
      utils.habits.getPaginated.invalidate();
    },
  });

  useEffect(() => {
    if (isEditModalOpen && editingHabit && habits) {
      const habit = habits.find(h => h.id === editingHabit);
      if (habit) {
        setTitle(habit.title);
        setEmoji(habit.emoji);
        setDescription(habit.description || "");
        setColor(habit.color || "#ffffff");
        setTargetFrequency(habit.targetFrequency as "daily" | "weekly" | "monthly");
        setIsActive(habit.isActive);
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(false);
    }
  }, [isEditModalOpen, editingHabit, habits]);

  const resetForm = useCallback(() => {
    setTitle("");
    setEmoji("🎯");
    setDescription("");
    setColor("#ffffff");
    setTargetFrequency("daily");
    setIsActive(true);
    setIsLoaded(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !editingHabit) return;

    updateHabit.mutate({
      id: editingHabit,
      title: title.trim(),
      emoji,
      description: description.trim() || undefined,
      color,
      targetFrequency,
      isActive,
    });
  };

  const handleClose = useCallback(() => {
    closeEditModal();
    resetForm();
  }, [closeEditModal, resetForm]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        handleClose();
      }
    };

    if (isEditModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen, handleClose]);

  if (!isEditModalOpen || !isLoaded) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-pure-black border border-white/20 rounded-2xl w-full max-w-md max-h-[90vh] relative overflow-hidden pointer-events-auto">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-2rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-argesta tracking-tight">
                EDIT HABIT
              </h2>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h4 className="font-argesta text-white text-sm">Habit status</h4>
                  <p className="text-xs text-white/60">
                    {isActive ? "Active habit" : "Inactive habit"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                    isActive ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
                      isActive ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Emoji Selection */}
              <div>
                <label className="block text-xs font-argesta text-white/80 mb-2">
                  EMOJI
                </label>
                <div className="grid grid-cols-10 gap-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  {HABIT_EMOJIS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => setEmoji(emojiOption)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-lg transition-all duration-200 ${
                        emoji === emojiOption
                          ? "bg-white/20 border-2 border-white/40"
                          : "hover:bg-white/10 border-2 border-transparent"
                      }`}
                    >
                      {emojiOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-argesta text-white/80 mb-2">
                  TITLE
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">
                    {emoji}
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Wake up 5:30am, Meditation..."
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                    required
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-argesta text-white/80 mb-2">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this habit important to you..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 resize-none"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-argesta text-white/80 mb-2">
                  ACCENT COLOR
                </label>
                <div className="grid grid-cols-10 gap-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  {HABIT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        color === colorOption
                          ? "border-white/60 scale-110"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{ backgroundColor: colorOption }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">{emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-argesta font-medium text-white text-sm">
                      {title || "Habit title"}
                    </h4>
                    {description && (
                      <p className="text-xs text-white/60 mt-1">{description}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-white/40 font-argesta">
                        {targetFrequency === "daily" ? "DAILY" : 
                         targetFrequency === "weekly" ? "WEEKLY" : "MONTHLY"}
                      </span>
                      {!isActive && (
                        <span className="text-xs text-red-400/80 font-argesta">INACTIVE</span>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 font-argesta text-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || updateHabit.isPending}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg text-white font-argesta transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {updateHabit.isPending ? "UPDATING..." : "UPDATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 