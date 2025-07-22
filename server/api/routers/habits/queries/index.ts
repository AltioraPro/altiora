import { TRPCError } from "@trpc/server";
import { eq, and, gte, desc, asc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { habits, habitCompletions } from "@/server/db/schema";
import { getHabitStatsValidator } from "../validators";
import type { 
  HabitWithCompletions, 
  DailyHabitStats, 
  HabitStatsOverview,
  HabitsDashboardData 
} from "../types";


export const getUserHabits = async (userId: string): Promise<HabitWithCompletions[]> => {
  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(asc(habits.sortOrder), asc(habits.createdAt));

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const habitsWithCompletions: HabitWithCompletions[] = await Promise.all(
      userHabits.map(async (habit) => {
        const completions = await db
          .select()
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.userId, userId),
              eq(habitCompletions.habitId, habit.id),
              gte(habitCompletions.completionDate, thirtyDaysAgo.toISOString().split('T')[0]!)
            )
          )
          .orderBy(desc(habitCompletions.completionDate));

        const completedCount = completions.filter(c => c.isCompleted).length;
        const completionRate = completions.length > 0 ? (completedCount / completions.length) * 100 : 0;

        return {
          ...habit,
          completions,
          completionRate,
        };
      })
    );

    return habitsWithCompletions;
  } catch (error) {
    console.error("Error getUserHabits:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch habits",
    });
  }
};

export const getDailyStats = async (userId: string, date: string): Promise<DailyHabitStats> => {
  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)));

    const completions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.completionDate, date)
        )
      );

    const habitStats = userHabits.map(habit => {
      const completion = completions.find(c => c.habitId === habit.id);
      return {
        id: habit.id,
        title: habit.title,
        emoji: habit.emoji,
        isCompleted: completion?.isCompleted ?? false,
        notes: completion?.notes ?? undefined,
      };
    });

    const completedHabits = habitStats.filter(h => h.isCompleted).length;
    const totalHabits = habitStats.length;
    const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return {
      date,
      totalHabits,
      completedHabits,
      completionPercentage,
      habits: habitStats,
    };
  } catch (error) {
    console.error("Error getDailyStats:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch daily statistics",
    });
  }
};

export const getHabitStats = async (
  userId: string,
  input: z.infer<typeof getHabitStatsValidator>
): Promise<HabitStatsOverview> => {
  try {
    const { period } = input;

    const today = new Date();
    let startDate: Date;
    let daysToFetch: number;

    switch (period) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        daysToFetch = 7;
        break;
      case "month":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        daysToFetch = 30;
        break;
      case "quarter":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        daysToFetch = 90;
        break;
      case "year":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 365);
        daysToFetch = 365;
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        daysToFetch = 30;
    }

    const activeHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)));

    const totalActiveHabits = activeHabits.length;

    const completions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          gte(habitCompletions.completionDate, startDate.toISOString().split('T')[0]!)
        )
      )
      .orderBy(desc(habitCompletions.completionDate));

    const weeklyStats: DailyHabitStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;
      
      const dailyStats = await getDailyStats(userId, dateStr);
      weeklyStats.push(dailyStats);
    }

    const totalPossibleCompletions = daysToFetch * totalActiveHabits;
    const totalCompletions = completions.filter(c => c.isCompleted).length;
    const averageCompletionRate = totalPossibleCompletions > 0 
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100) 
      : 0;

    const { currentStreak, longestStreak } = calculateStreaks(weeklyStats);

    const monthlyProgress: Array<{ date: string; completionPercentage: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;
      
      const dailyStats = await getDailyStats(userId, dateStr);
      monthlyProgress.push({
        date: dateStr,
        completionPercentage: dailyStats.completionPercentage,
      });
    }

    return {
      totalActiveHabits,
      currentStreak,
      longestStreak,
      averageCompletionRate,
      weeklyStats,
      monthlyProgress,
    };
  } catch (error) {
    console.error("Error getHabitStats:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch statistics",
    });
  }
};

export const getHabitsDashboard = async (userId: string): Promise<HabitsDashboardData> => {
  try {
    const today = new Date().toISOString().split('T')[0]!;
    
    const [todayStats, habits, stats] = await Promise.all([
      getDailyStats(userId, today),
      getUserHabits(userId),
      getHabitStats(userId, { period: "month" }),
    ]);

    const recentActivity: Array<{ date: string; completionPercentage: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;
      
      const dailyStats = await getDailyStats(userId, dateStr);
      recentActivity.push({
        date: dateStr,
        completionPercentage: dailyStats.completionPercentage,
      });
    }

    return {
      todayStats,
      habits,
      stats,
      recentActivity,
    };
  } catch (error) {
    console.error("Error getHabitsDashboard:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch dashboard",
    });
  }
};

function calculateStreaks(dailyStats: DailyHabitStats[]): { currentStreak: number; longestStreak: number } {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = dailyStats.length - 1; i >= 0; i--) {
    if (dailyStats[i]!.completionPercentage === 100) {
      currentStreak++;
    } else {
      break;
    }
  }

  for (const day of dailyStats) {
    if (day.completionPercentage === 100) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
} 