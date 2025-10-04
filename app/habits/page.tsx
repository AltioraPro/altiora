"use client";

import { Suspense } from "react";
import { HabitsProvider } from "@/components/habits/HabitsProvider";
import { HabitsDashboard } from "@/components/habits/HabitsDashboard";
import { HabitsLoadingSkeleton } from "@/components/habits/HabitsLoadingSkeleton";
import { QuickStats } from "@/components/habits/QuickStats";
import { Header } from "@/components/layout/Header";

export default function HabitsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-pure-black text-pure-white">
      {/* Main Content */}
      <div className="relative w-full mx-auto">
        <HabitsProvider>
          {/* Header */}
          <div className="relative border-b border-white/10 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold font-argesta tracking-tight">
                    Habits Tracker
                  </h1>
                  <p className="text-white/60 text-sm mt-2">
                    Forge your discipline. Build your legacy.
                  </p>
                </div>
                
                {/* Quick Stats Preview */}
                <QuickStats />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<HabitsLoadingSkeleton />}>
              <HabitsDashboard />
            </Suspense>
          </div>
        </HabitsProvider>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.002] rounded-full blur-3xl" />
      </div>
    </div>
  </>
  );
} 