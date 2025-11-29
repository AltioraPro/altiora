"use client";

import { RiAddLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { orpc } from "@/orpc/client";
import { Button } from "../../../components/ui/button";
import { CreateHabitModal } from "./_components/create-habit-modal";
import { EditHabitModal } from "./_components/edit-habit-modal";
import {
    HabitsDashboardSkeleton,
    ViewModeToggle,
} from "./_components/habit-dashboard";
import { HabitsManager } from "./_components/habit-manager";
import { HabitsProgressChart } from "./_components/habits-progress-chart";
import { useHabits } from "./_components/habits-provider";
import { HabitsStats } from "./_components/stats/habits-stats";
import { TodayHabitsCard } from "./_components/today-habit-card";
import { habitsSearchParams } from "./search-params";

export function HabitsPageClient() {
    const { openCreateModal } = useHabits();

    const [viewMode] = useQueryState("viewMode", habitsSearchParams.viewMode);

    const { data, isLoading, error, refetch } = useQuery(
        orpc.habits.getDashboard.queryOptions({
            input: {
                viewMode,
            },
        })
    );

    if (error) {
        return (
            <div className="py-12 text-center">
                <div className="mb-4 text-red-400">Error loading habits</div>
                <button
                    className="rounded-lg bg-white/10 px-4 py-2 transition-colors hover:bg-white/20"
                    onClick={() => refetch()}
                    type="button"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="mb-16 space-y-6 px-6 py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <ViewModeToggle />
                </div>

                <Button onClick={openCreateModal}>
                    <RiAddLine />
                    New Habit
                </Button>
            </div>

            {isLoading ? (
                <HabitsDashboardSkeleton />
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left column: Today's Habits + Progress */}
                    <div className="space-y-6 lg:col-span-8">
                        <TodayHabitsCard data={data?.todayStats} />
                        <HabitsProgressChart
                            data={data?.recentActivity}
                            habits={data?.todayStats.habits}
                            viewMode={viewMode}
                        />
                    </div>

                    {/* Right column: Statistics + Habits Manager */}
                    <div className="space-y-6 lg:col-span-4">
                        <HabitsStats
                            data={data?.stats}
                            todayHabits={data?.todayStats.habits}
                        />
                        <HabitsManager />
                    </div>
                </div>
            )}

            <CreateHabitModal />
            <EditHabitModal />
        </div>
    );
}
