"use client";

import { useHabits } from "./HabitsProvider";
import { TodayHabitsCard } from "./TodayHabitsCard";
import { HabitsProgressChart } from "./HabitsProgressChart";
import { HabitsStats } from "./HabitsStats";
import { HabitsManager } from "./HabitsManager";
import { CreateHabitModal } from "./CreateHabitModal";
import { EditHabitModal } from "./EditHabitModal";
import { Plus } from "lucide-react";
import { memo } from "react";
import { useHabitsDashboard } from "@/lib/hooks/useHabitsQuery";
import { LimitsBanner } from "@/components/subscription/LimitsBanner";

// OPTIMIZATION: Memoized component to avoid unnecessary re-renders
const ViewModeToggle = memo(({ 
  viewMode, 
  setViewMode 
}: { 
  viewMode: "today" | "week" | "month"; 
  setViewMode: (mode: "today" | "week" | "month") => void; 
}) => (
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
));

ViewModeToggle.displayName = "ViewModeToggle";

// OPTIMIZATION: Memoized component for creation button
const CreateHabitButton = memo(({ 
  onClick 
}: { 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-6 py-3 transition-all duration-300 group"
  >
    <Plus className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
    <span className="font-argesta text-sm">NEW HABIT</span>
  </button>
));

CreateHabitButton.displayName = "CreateHabitButton";

export function HabitsDashboard() {
  const { 
    openCreateModal, 
    viewMode, 
    setViewMode,
  } = useHabits();

  // OPTIMIZATION: Using optimized custom hook
  const { data: dashboardData, isLoading, error } = useHabitsDashboard(viewMode);

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
    <div className="space-y-6 mb-16">
      {/* Limits Banner */}
      <LimitsBanner />
      
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* Create Habit Button */}
        <CreateHabitButton onClick={openCreateModal} />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Today's Habits + Progress */}
        <div className="lg:col-span-8 space-y-6">
          <TodayHabitsCard data={dashboardData?.todayStats} />
          <HabitsProgressChart 
            data={dashboardData?.recentActivity} 
            viewMode={viewMode} 
            habits={dashboardData?.todayStats.habits}
          />
        </div>

        {/* Right column: Statistics + Habits Manager */}
        <div className="lg:col-span-4 space-y-6">
          <HabitsStats 
            data={dashboardData?.stats} 
            todayHabits={dashboardData?.todayStats.habits}
          />
          <HabitsManager />
        </div>
      </div>

      {/* Modals */}
      <CreateHabitModal />
      <EditHabitModal />
    </div>
    </>
  );
}


function HabitsDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Actions Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-10 w-40 bg-white/5 rounded-xl" />
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Today's Habits + Progress */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-80 bg-white/5 rounded-2xl" />
        </div>

        {/* Right column: Statistics + Habits Manager */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-80 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
} 