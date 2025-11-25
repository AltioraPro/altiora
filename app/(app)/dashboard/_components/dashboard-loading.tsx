import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
    return (
        <div className="px-6 py-8">
            {/* Journal Filter Skeleton */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-48 rounded-md" />
                </div>
            </div>

            {/* Global Trading Stats Skeleton */}
            <div className="mb-8 space-y-6">
                {/* Main Metrics - 4 cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            className="rounded-lg border border-white/10 bg-black/20 p-5"
                            key={i}
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 rounded bg-white/10" />
                                <Skeleton className="h-8 w-20 rounded bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Exit Strategy Card Skeleton */}
                <div className="flex justify-center">
                    <div className="w-fit rounded-lg border border-white/10 bg-black/20 p-2">
                        <div className="flex items-center gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div className="text-center" key={i}>
                                    <Skeleton className="mb-1 h-3 w-8 rounded bg-white/10" />
                                    <Skeleton className="h-6 w-12 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Skeleton */}
            <div className="mb-8">
                <div className="rounded-lg border border-white/10 bg-black/20 p-6">
                    {/* Card Header */}
                    <div className="mb-6 space-y-2">
                        <Skeleton className="h-6 w-48 rounded bg-white/10" />
                        <Skeleton className="h-4 w-64 rounded bg-white/10" />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Cumulative Performance Chart Skeleton */}
                        <div className="rounded-lg border border-white/10 bg-black/20 p-6">
                            <div className="mb-4 space-y-2">
                                <Skeleton className="h-5 w-40 rounded bg-white/10" />
                                <Skeleton className="h-4 w-32 rounded bg-white/10" />
                            </div>
                            <Skeleton className="h-64 w-full rounded bg-white/10" />
                        </div>

                        {/* Monthly Performance Chart Skeleton */}
                        <div className="rounded-lg border border-white/20 bg-black/40 p-6">
                            <div className="mb-4 space-y-2">
                                <Skeleton className="h-5 w-48 rounded bg-white/10" />
                                <Skeleton className="h-4 w-36 rounded bg-white/10" />
                            </div>
                            <Skeleton className="h-[250px] w-full rounded bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
