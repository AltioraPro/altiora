"use client";

import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";
import { TodayHabitsCard } from "./TodayHabitsCard";
import { HabitsProgressChart } from "./HabitsProgressChart";
import { HabitsStats } from "./HabitsStats";
import { HabitsManager } from "./HabitsManager";
import { CreateHabitModal } from "./CreateHabitModal";
import { EditHabitModal } from "./EditHabitModal";
import { Plus } from "lucide-react";

import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";

export function HabitsDashboard() {
  const { 
    openCreateModal, 
    viewMode, 
    setViewMode,
  } = useHabits();

  const { data: dashboardData, isLoading, error } = api.habits.getDashboard.useQuery();

  if (isLoading) {
    return <HabitsDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          Error loading habits
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="space-y-8 mb-16">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            {(["today", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-argesta rounded-lg transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {mode === "today" && "TODAY"}
                {mode === "week" && "WEEK"}
                {mode === "month" && "MONTH"}
              </button>
            ))}
          </div>
        </div>

        {/* Create Habit Button */}
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-6 py-3 transition-all duration-300 group"
        >
          <Plus className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
          <span className="font-argesta text-sm">NEW HABIT</span>
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Today's Habits */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Habits Card */}
          <TodayHabitsCard data={dashboardData?.todayStats} />
          
          {/* Progress Chart */}
          <HabitsProgressChart data={dashboardData?.recentActivity} />
        </div>

        {/* Right Column - Stats & Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Overview */}
          <HabitsStats data={dashboardData?.stats} />
          
          {/* Habits Manager */}
          <HabitsManager habits={dashboardData?.habits} />
        </div>
      </div>

      {/* Modals */}
      <CreateHabitModal />
      <EditHabitModal />
    </div>
    <Footer />
    </>
  );
}


function HabitsDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Actions Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-10 w-40 bg-white/5 rounded-xl" />
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-80 bg-white/5 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
} 