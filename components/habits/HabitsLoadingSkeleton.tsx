"use client";

export function HabitsLoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
            {/* Top Actions Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-48 rounded-xl bg-white/5" />
                </div>
                <div className="h-10 w-40 rounded-xl bg-white/5" />
            </div>

            {/* Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-8">
                    {/* Today's Habits Card Skeleton */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-6 w-48 rounded bg-white/10" />
                            <div className="h-8 w-16 rounded-full bg-white/10" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    className="flex items-center space-x-4"
                                    key={i}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-white/10" />
                                    <div className="flex-1">
                                        <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                                        <div className="h-3 w-24 rounded bg-white/5" />
                                    </div>
                                    <div className="h-6 w-6 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress Chart Skeleton */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 h-6 w-40 rounded bg-white/10" />
                        <div className="h-64 rounded-xl bg-white/10" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-4">
                    {/* Stats Overview Skeleton */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 h-6 w-32 rounded bg-white/10" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div className="text-center" key={i}>
                                    <div className="mx-auto mb-2 h-8 w-12 rounded bg-white/10" />
                                    <div className="mx-auto h-3 w-16 rounded bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habits Manager Skeleton */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6 h-6 w-40 rounded bg-white/10" />
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    className="flex items-center justify-between"
                                    key={i}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/10" />
                                        <div className="h-4 w-24 rounded bg-white/10" />
                                    </div>
                                    <div className="h-6 w-6 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
