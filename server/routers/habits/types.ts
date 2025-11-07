import type { Habit, HabitCompletion } from "@/server/db/schema";

export interface HabitWithCompletions extends Habit {
    completions: HabitCompletion[];
    completionRate?: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: "title" | "createdAt" | "sortOrder";
    sortOrder?: "asc" | "desc";
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface DailyHabitStats {
    date: string;
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

export interface HabitStatsOverview {
    totalActiveHabits: number;
    currentStreak: number;
    longestStreak: number;
    worstDay: {
        date: string;
        percentage: number;
    };
    averageCompletionRate: number;
    weeklyStats: DailyHabitStats[];
    monthlyProgress: Array<{
        date: string;
        completionPercentage: number;
    }>;
}

export interface HabitsDashboardData {
    todayStats: DailyHabitStats;
    habits: HabitWithCompletions[];
    stats: HabitStatsOverview;
    recentActivity: Array<{
        date: string;
        completionPercentage: number;
    }>;
}
