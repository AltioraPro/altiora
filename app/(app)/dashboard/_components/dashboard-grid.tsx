"use client";

import type { RouterOutput } from "@/orpc/client";
import { DeepworkWidget } from "./widgets/deepwork-widget";
import { GoalWidget } from "./widgets/goal-widget";
import { HabitWidget } from "./widgets/habit-widget";

interface DashboardGridProps {
    habitsDashboard: RouterOutput["habits"]["getDashboard"];
    goals: RouterOutput["goals"]["getAll"];
    profileStats: RouterOutput["profile"]["getUserStats"];
}

export function DashboardGrid({
    habitsDashboard,
    goals,
    profileStats,
}: DashboardGridProps) {
    return (
        <div className="space-y-6">
            {/* Dev Modules: Habits, Goals, Deepwork */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <HabitWidget data={habitsDashboard} />
                <GoalWidget goals={goals} />
                <DeepworkWidget profileStats={profileStats} />
            </div>
        </div>
    );
}
