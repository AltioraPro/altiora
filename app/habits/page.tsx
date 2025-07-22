"use client";

import { Suspense } from "react";
import { HabitsProvider } from "@/components/habits/HabitsProvider";
import { HabitsDashboard } from "@/components/habits/HabitsDashboard";
import { HabitsLoadingSkeleton } from "@/components/habits/HabitsLoadingSkeleton";
import { Footer } from "@/components/layout/Footer";

export default function HabitsPage() {
  return (
    <>
      <div className="min-h-screen bg-pure-black text-pure-white">
      {/* Header */}
      <div className="relative border-b border-white/10 mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-argesta tracking-tight">
                Habits Tracker
              </h1>
              <p className="text-white/60 font-argesta text-sm mt-2">
                Forge your discipline. Build your legacy.
              </p>
            </div>
            
            {/* Quick Stats Preview */}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <HabitsProvider>
          <Suspense fallback={<HabitsLoadingSkeleton />}>
            <HabitsDashboard />
          </Suspense>
        </HabitsProvider>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.002] rounded-full blur-3xl" />
      </div>
    </div>

    {/* Footer */}
    <Footer />
  </>
  );
} 