"use client";

import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";

export function QuickStats() {
  const { getOptimisticTodayStats, getOptimisticStats } = useHabits();

  const { data: dashboardData, isLoading } = api.habits.getDashboard.useQuery({
    viewMode: "today"
  });

  // Calculer les statistiques optimistes
  const optimisticTodayStats = getOptimisticTodayStats(dashboardData?.todayStats);
  const optimisticStats = getOptimisticStats(dashboardData?.stats, dashboardData?.todayStats.habits);

  // Extraire les valeurs pour l'affichage
  const todayCompleted = optimisticTodayStats?.completedHabits ?? 0;
  const todayTotal = optimisticTodayStats?.totalHabits ?? 0;
  const currentStreak = optimisticStats?.currentStreak ?? 0;

  // Afficher des valeurs par défaut pendant le chargement
  if (isLoading) {
    return (
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-2xl font-bold font-argesta">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              --
            </span>
          </div>
          <div className="text-xs text-white/50 font-argesta">Today</div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-bold font-argesta">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              --
            </span>
          </div>
          <div className="text-xs text-white/50 font-argesta">SÉRIE</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-6">
      <div className="text-center">
        <div className="text-2xl font-bold font-argesta">
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            {todayTotal > 0 ? `${todayCompleted}/${todayTotal}` : "--"}
          </span>
        </div>
        <div className="text-xs text-white/50 font-argesta">Today</div>
      </div>
      <div className="w-px h-8 bg-white/20" />
      <div className="text-center">
        <div className="text-2xl font-bold font-argesta">
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            {currentStreak > 0 ? currentStreak : "--"}
          </span>
        </div>
        <div className="text-xs text-white/50 font-argesta">SÉRIE</div>
      </div>
    </div>
  );
} 