export function LeaderboardLoadingSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    className="animate-pulse rounded-lg border border-white/10 bg-black/20 p-6"
                    key={i}
                >
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded bg-white/10" />
                        <div className="h-12 w-12 rounded-full bg-white/10" />
                        <div className="flex-1">
                            <div className="mb-2 h-6 w-48 rounded bg-white/10" />
                        </div>
                        <div className="h-8 w-32 rounded bg-white/10" />
                    </div>
                </div>
            ))}
        </div>
    );
}
