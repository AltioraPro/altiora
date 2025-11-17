"use client";

import { RiAddLine } from "@remixicon/react";
import { memo } from "react";
import { useHabitsDashboard } from "@/lib/hooks/useHabitsQuery";
import { CreateHabitModal } from "./CreateHabitModal";
import { EditHabitModal } from "./EditHabitModal";
import { HabitsManager } from "./HabitsManager";
import { HabitsProgressChart } from "./HabitsProgressChart";
import { useHabits } from "./HabitsProvider";
import { HabitsStats } from "./HabitsStats";
import { TodayHabitsCard } from "./TodayHabitsCard";

const ViewModeToggle = memo(
    ({
        viewMode,
        setViewMode,
    }: {
        viewMode: "today" | "week" | "month";
        setViewMode: (mode: "today" | "week" | "month") => void;
    }) => (
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            {(["today", "week", "month"] as const).map((mode) => (
                <button
                    className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                        viewMode === mode
                            ? "border border-white/20 bg-white/15 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                    }`}
                    key={mode}
                    onClick={() => setViewMode(mode)}
                >
                    {mode === "today" && "TODAY"}
                    {mode === "week" && "WEEK"}
                    {mode === "month" && "MONTH"}
                </button>
            ))}
        </div>
    )
);

ViewModeToggle.displayName = "ViewModeToggle";

const CreateHabitButton = memo(({ onClick }: { onClick: () => void }) => (
    <button
        className="group flex items-center space-x-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 transition-all duration-300 hover:border-white/40 hover:bg-white/20"
        onClick={onClick}
        type="button"
    >
        <RiAddLine className="size-5 text-white/80 transition-colors group-hover:text-white" />
        <span className="text-sm">NEW HABIT</span>
    </button>
));

CreateHabitButton.displayName = "CreateHabitButton";

export function HabitsDashboard() {
    const { openCreateModal, viewMode, setViewMode } = useHabits();

    const {
        data: dashboardData,
        isLoading,
        error,
    } = useHabitsDashboard(viewMode);

    if (isLoading) {
        return <HabitsDashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="py-12 text-center">
                <div className="mb-4 text-red-400">Error loading habits</div>
                <button
                    className="rounded-lg bg-white/10 px-4 py-2 transition-colors hover:bg-white/20"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="mb-16 space-y-6">
                {/* Limits Banner */}
                {/* <LimitsBanner /> */}

                {/* Top Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* View Mode Toggle */}
                        <ViewModeToggle
                            setViewMode={setViewMode}
                            viewMode={viewMode}
                        />
                    </div>
                    {/* Create Habit Button */}
                    <CreateHabitButton onClick={openCreateModal} />
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left column: Today's Habits + Progress */}
                    <div className="space-y-6 lg:col-span-8">
                        <TodayHabitsCard data={dashboardData?.todayStats} />
                        <HabitsProgressChart
                            data={dashboardData?.recentActivity}
                            habits={dashboardData?.todayStats.habits}
                            viewMode={viewMode}
                        />
                    </div>

                    {/* Right column: Statistics + Habits Manager */}
                    <div className="space-y-6 lg:col-span-4">
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
        <div className="animate-pulse space-y-6">
            {/* Top Actions Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-10 w-48 rounded-xl bg-white/5" />
                <div className="h-10 w-40 rounded-xl bg-white/5" />
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left column: Today's Habits + Progress */}
                <div className="space-y-6 lg:col-span-8">
                    <div className="h-64 rounded-2xl bg-white/5" />
                    <div className="h-80 rounded-2xl bg-white/5" />
                </div>

                {/* Right column: Statistics + Habits Manager */}
                <div className="space-y-6 lg:col-span-4">
                    <div className="h-64 rounded-2xl bg-white/5" />
                    <div className="h-80 rounded-2xl bg-white/5" />
                </div>
            </div>
        </div>
    );
}
