export function ActivityStatsLoading() {
    return (
        <div className="space-y-8">
            {/* General Stats Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {new Array(6).map((_, i) => (
                    <div
                        className="animate-pulse rounded-lg bg-black/20 p-6"
                        key={i}
                    >
                        <div className="mb-3 h-6 rounded bg-white/10" />
                        <div className="mb-2 h-8 rounded bg-white/10" />
                        <div className="h-4 rounded bg-white/10" />
                    </div>
                ))}
            </div>

            {/* Pomodoro Section Skeleton */}
            <div className="animate-pulse rounded-xl border border-white/20 bg-black/40">
                <div className="mb-6 flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-white/10" />
                    <div className="flex-1">
                        <div className="mb-2 h-5 w-32 rounded bg-white/10" />
                        <div className="h-3 w-48 rounded bg-white/10" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {new Array(3).map((_, i) => (
                        <div
                            className="rounded-lg border border-white/10 bg-white/5 p-5"
                            key={i}
                        >
                            <div className="mb-3 h-8 rounded bg-white/10" />
                            <div className="mb-2 h-8 rounded bg-white/10" />
                            <div className="h-4 w-20 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
