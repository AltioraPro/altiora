"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { habitsSearchParams, viewModes } from "../search-params";

export function ViewModeToggle() {
    const [viewMode, setViewMode] = useQueryState(
        "viewMode",
        habitsSearchParams.viewMode
    );

    return (
        <Tabs value={viewMode}>
            <TabsList>
                {viewModes.map((mode) => (
                    <TabsTrigger
                        className="uppercase"
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        value={mode}
                    >
                        {mode}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}

export function HabitsDashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
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
