"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TradingChartsSkeleton() {
    return (
        <div className="mb-8 space-y-6">
            <div className="mb-4 flex flex-col">
                <Skeleton className="mb-2 h-8 w-48 rounded bg-white/10" />
                <Skeleton className="h-4 w-64 rounded bg-white/10" />
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white tracking-wide">
                                <Skeleton className="h-6 w-32 rounded bg-white/10" />
                            </CardTitle>
                            <CardDescription className="text-white/70">
                                <Skeleton className="mt-2 h-4 w-40 rounded bg-white/10" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative flex items-center justify-center">
                                <Skeleton className="h-[220px] w-full rounded bg-white/10" />
                            </div>
                            <div className="mt-6 flex justify-center space-x-8">
                                <Skeleton className="h-4 w-20 rounded bg-white/10" />
                                <Skeleton className="h-4 w-20 rounded bg-white/10" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white tracking-wide">
                                <Skeleton className="h-6 w-48 rounded bg-white/10" />
                            </CardTitle>
                            <CardDescription className="text-white/70">
                                <Skeleton className="mt-2 h-4 w-48 rounded bg-white/10" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full pr-4">
                                <Skeleton className="h-full w-full rounded bg-white/10" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white tracking-wide">
                            <Skeleton className="h-6 w-56 rounded bg-white/10" />
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            <Skeleton className="mt-2 h-4 w-52 rounded bg-white/10" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="h-[250px] w-full pr-4">
                                <Skeleton className="h-full w-full rounded bg-white/10" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="mb-2 h-4 w-32 rounded bg-white/10" />
                                    <Skeleton className="h-8 w-24 rounded bg-white/10" />
                                </div>
                                <div className="text-right">
                                    <Skeleton className="mb-2 h-4 w-20 rounded bg-white/10" />
                                    <Skeleton className="h-8 w-16 rounded bg-white/10" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
