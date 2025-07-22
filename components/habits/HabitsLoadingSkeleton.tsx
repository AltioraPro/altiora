"use client";

export function HabitsLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Actions Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-48 bg-white/5 rounded-xl" />
        </div>
        <div className="h-10 w-40 bg-white/5 rounded-xl" />
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Habits Card Skeleton */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="h-8 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white/10 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="h-6 w-6 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Chart Skeleton */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="h-6 w-40 bg-white/10 rounded mb-6" />
            <div className="h-64 bg-white/10 rounded-xl" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Overview Skeleton */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="h-6 w-32 bg-white/10 rounded mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-12 bg-white/10 rounded mx-auto mb-2" />
                  <div className="h-3 w-16 bg-white/5 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Habits Manager Skeleton */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="h-6 w-40 bg-white/10 rounded mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-white/10 rounded-lg" />
                    <div className="h-4 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-6 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 