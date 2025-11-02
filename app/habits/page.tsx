"use client";

import { Suspense } from "react";
import { HabitsDashboard } from "@/components/habits/HabitsDashboard";
import { HabitsLoadingSkeleton } from "@/components/habits/HabitsLoadingSkeleton";
import { HabitsProvider } from "@/components/habits/HabitsProvider";
import { QuickStats } from "@/components/habits/QuickStats";
import { Header } from "@/components/layout/Header";

export default function HabitsPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-pure-black text-pure-white">
                {/* Main Content */}
                <div className="relative mx-auto w-full">
                    <HabitsProvider>
                        {/* Header */}
                        <div className="relative mb-8 border-white/10 border-b">
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent" />
                            <div className="relative mx-auto max-w-7xl px-6 py-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="font-argesta font-bold text-3xl tracking-tight">
                                            Habits Tracker
                                        </h1>
                                        <p className="mt-2 text-sm text-white/60">
                                            Forge your discipline. Build your
                                            legacy.
                                        </p>
                                    </div>

                                    {/* Quick Stats Preview */}
                                    <QuickStats />
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto max-w-7xl">
                            <Suspense fallback={<HabitsLoadingSkeleton />}>
                                <HabitsDashboard />
                            </Suspense>
                        </div>
                    </HabitsProvider>
                </div>

                {/* Background decoration */}
                <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/1 blur-3xl" />
                    <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/0.5 blur-3xl" />
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[800px] w-[800px] transform rounded-full bg-white/[0.002] blur-3xl" />
                </div>
            </div>
        </>
    );
}
