"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TradingStatsSkeletonProps extends React.ComponentProps<"div"> {}

export function TradingStatsSkeleton({
    className,
    ...props
}: TradingStatsSkeletonProps) {
    return (
        <div className={cn("mb-8 space-y-8", className)} {...props}>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-neutral-800 bg-neutral-900 p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <Skeleton className="h-4 w-20 rounded bg-white/10" />
                        <Skeleton className="size-4 rounded bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <Skeleton className="h-9 w-24 rounded bg-white/10" />
                        <Skeleton className="h-4 w-32 rounded bg-white/10" />
                    </CardContent>
                </Card>

                <Card className="border border-neutral-800 bg-neutral-900 p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <Skeleton className="h-4 w-20 rounded bg-white/10" />
                        <Skeleton className="size-4 rounded bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <Skeleton className="h-9 w-24 rounded bg-white/10" />
                        <Skeleton className="h-4 w-32 rounded bg-white/10" />
                    </CardContent>
                </Card>

                <Card className="border border-neutral-800 bg-neutral-900 p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <Skeleton className="h-4 w-16 rounded bg-white/10" />
                        <Skeleton className="size-4 rounded bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <Skeleton className="h-9 w-16 rounded bg-white/10" />
                        <Skeleton className="h-4 w-32 rounded bg-white/10" />
                    </CardContent>
                </Card>

                <Card className="border border-neutral-800 bg-neutral-900 p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-3">
                        <Skeleton className="h-4 w-24 rounded bg-white/10" />
                        <Skeleton className="size-4 rounded bg-white/10" />
                    </CardHeader>
                    <CardContent className="space-y-2 px-0 pb-0">
                        <Skeleton className="h-9 w-16 rounded bg-white/10" />
                        <Skeleton className="h-4 w-24 rounded bg-white/10" />
                    </CardContent>
                </Card>
            </div>

            {/* Exit Strategy & Streaks */}
            <div className="flex justify-center">
                <div className="flex items-center gap-8">
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                        <Skeleton className="mb-1 h-3 w-20 rounded bg-white/10" />
                        <Skeleton className="h-5 w-8 rounded bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <Skeleton className="mb-1 h-3 w-8 rounded bg-white/10" />
                            <Skeleton className="h-5 w-8 rounded bg-white/10" />
                        </div>
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <Skeleton className="mb-1 h-3 w-8 rounded bg-white/10" />
                            <Skeleton className="h-5 w-8 rounded bg-white/10" />
                        </div>
                        <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                            <Skeleton className="mb-1 h-3 w-8 rounded bg-white/10" />
                            <Skeleton className="h-5 w-8 rounded bg-white/10" />
                        </div>
                    </div>
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-center">
                        <Skeleton className="mb-1 h-3 w-20 rounded bg-white/10" />
                        <Skeleton className="h-5 w-8 rounded bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
