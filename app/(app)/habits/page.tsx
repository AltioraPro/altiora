"use client";

import { Suspense } from "react";
import { HabitsDashboard } from "@/components/habits/HabitsDashboard";
import { HabitsLoadingSkeleton } from "@/components/habits/HabitsLoadingSkeleton";
import { HabitsProvider } from "@/components/habits/HabitsProvider";

export default function HabitsPage() {
    return (
        <HabitsProvider>
            <Suspense fallback={<HabitsLoadingSkeleton />}>
                <HabitsDashboard />
            </Suspense>
        </HabitsProvider>
    );
}
