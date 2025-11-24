"use client";

import { isDefinedError } from "@orpc/client";
import { RiUserLine } from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ActivityStats } from "@/app/(app)/profile/_components/activity-stats";
import { HabitHeatmap } from "@/app/(app)/profile/_components/habit-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";
import { DeepworkStats } from "./_components/deepwork-stats";

export function ProfilePageClient() {
    const { data: user, error } = useSuspenseQuery(
        orpc.auth.getCurrentUser.queryOptions()
    );

    if (isDefinedError(error) && error.code === "UNAUTHORIZED") {
        return redirect(PAGES.SIGN_IN);
    }

    return (
        <div className="min-h-screen px-6 py-8 text-pure-white">
            <div className="relative mx-auto w-full">
                {/* Profile Card */}

                <Card className="mb-8 border border-white/10 bg-black/20">
                    <CardContent className="p-8">
                        <div className="flex justify-between gap-8">
                            {/* Left Side - Avatar + Info + Heatmap */}
                            <div className="flex-1 space-y-6">
                                {/* Avatar + Info */}
                                <div className="flex items-center gap-8 md:items-start">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/5">
                                            {user?.image ? (
                                                <Image
                                                    alt={user?.name}
                                                    className="h-full w-full object-cover"
                                                    height={128}
                                                    src={user.image}
                                                    width={128}
                                                />
                                            ) : (
                                                <RiUserLine className="h-16 w-16 text-white/40" />
                                            )}
                                        </div>
                                        {user?.discordProfile
                                            ?.discordConnected && (
                                            <div className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#5865F2]">
                                                <div className="h-3 w-3 rounded-full bg-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1">
                                        <div className="mb-4">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h2 className="font-argesta font-bold text-3xl text-white">
                                                    {user?.name}
                                                </h2>
                                                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 font-medium text-white/60 text-xs uppercase tracking-wider">
                                                    {user?.rank}
                                                </span>
                                            </div>
                                            <p className="text-white/60">
                                                {user?.email}
                                            </p>
                                        </div>

                                        {/* Member Since */}
                                        <div className="mt-4">
                                            <p className="text-sm text-white/40">
                                                Member since{" "}
                                                {format(
                                                    user?.createdAt,
                                                    "MMMM d, yyyy"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Habit Heatmap */}
                                <div>
                                    <Suspense
                                        fallback={
                                            <div className="animate-pulse">
                                                <div className="mb-4 h-6 w-40 rounded bg-white/10" />
                                                <div className="h-32 rounded bg-white/10" />
                                            </div>
                                        }
                                    >
                                        <HabitHeatmap />
                                    </Suspense>
                                </div>
                            </div>

                            {/* Right Side - Deepwork Stats */}
                            <div className="w-56">
                                <Suspense
                                    fallback={
                                        <div className="h-full animate-pulse rounded-lg bg-black/5 p-4">
                                            <div className="h-20 rounded bg-white/5" />
                                        </div>
                                    }
                                >
                                    <DeepworkStats />
                                </Suspense>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Stats */}
                <div className="mb-8">
                    <h2 className="mb-6 font-argesta font-bold text-2xl text-white">
                        Activity Overview
                    </h2>
                    <Suspense
                        fallback={
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {new Array(6).map((_, i) => (
                                    <div
                                        className="animate-pulse rounded-lg border border-white/10 bg-black/20 p-6"
                                        key={i}
                                    >
                                        <div className="mb-3 h-6 rounded bg-white/10" />
                                        <div className="mb-2 h-8 rounded bg-white/10" />
                                        <div className="h-4 rounded bg-white/10" />
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <ActivityStats />
                    </Suspense>
                </div>
            </div>

            {/* Background decoration */}
            <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/1 blur-3xl" />
                <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/0.5 blur-3xl" />
            </div>
        </div>
    );
}
