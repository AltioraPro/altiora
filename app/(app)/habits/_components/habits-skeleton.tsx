export function HabitsLoadingSkeleton() {
    return (
        <div className="mb-16 animate-pulse space-y-6 px-6 py-8">
            {/* Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-8">
                    {/* Today's Habits Card Skeleton */}
                    <div className="overflow-hidden border border-neutral-800 bg-neutral-900">
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="h-6 w-48 rounded bg-white/10" />
                                <div className="h-8 w-20 rounded-full bg-white/10" />
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        className="flex items-center space-x-4 border border-white/10 bg-white/5 p-4"
                                        key={i}
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-white/10" />
                                        <div className="flex-1">
                                            <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                                            <div className="h-3 w-24 rounded bg-white/5" />
                                        </div>
                                        <div className="h-6 w-6 rounded-full border-2 border-white/20 bg-white/5" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Progress Chart Skeleton */}
                    <div className="overflow-hidden border border-neutral-800 bg-neutral-900 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-6 w-40 rounded bg-white/10" />
                            <div className="h-8 w-24 rounded bg-white/10" />
                        </div>
                        <div className="h-80 rounded-xl bg-white/5" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-4">
                    {/* Stats Overview Skeleton */}
                    <div className="relative overflow-hidden border border-neutral-800 bg-neutral-900 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-6 w-32 rounded bg-white/10" />
                            <div className="h-7 w-24 rounded border border-white/10 bg-white/5" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div className="text-center" key={i}>
                                    <div className="mx-auto mb-2 h-8 w-12 rounded bg-white/10" />
                                    <div className="mx-auto h-3 w-20 rounded bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habits Manager Skeleton */}
                    <div className="overflow-hidden border border-neutral-800 bg-neutral-900 p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-6 w-40 rounded bg-white/10" />
                            <div className="h-9 w-9 rounded bg-white/10" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
                                    key={i}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-lg bg-white/10" />
                                        <div className="h-4 w-28 rounded bg-white/10" />
                                    </div>
                                    <div className="h-5 w-5 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
