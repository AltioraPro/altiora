import type { Habit, HabitCompletion } from "@/server/db/schema";

// Type for a habit with its completions
export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  completionRate?: number;
}

// Type for daily statistics
export interface DailyHabitStats {
  date: string; // Format YYYY-MM-DD
  totalHabits: number;
  completedHabits: number;
  completionPercentage: number;
  habits: Array<{
    id: string;
    title: string;
    emoji: string;
    isCompleted: boolean;
    notes?: string;
  }>;
}

// Type for global statistics
export interface HabitStatsOverview {
  totalActiveHabits: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionRate: number;
  weeklyStats: DailyHabitStats[];
  monthlyProgress: Array<{
    date: string;
    completionPercentage: number;
  }>;
}

// Type for dashboard response
export interface HabitsDashboardData {
  todayStats: DailyHabitStats;
  habits: HabitWithCompletions[];
  stats: HabitStatsOverview;
  recentActivity: Array<{
    date: string;
    completionPercentage: number;
  }>;
} 