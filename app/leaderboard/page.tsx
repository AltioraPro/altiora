"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { orpc } from "@/orpc/client";

type Period = "all" | "week" | "month" | "year";

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data: leaderboard, isLoading } = useQuery(
        orpc.leaderboard.getLeaderboard.queryOptions({ input: { period } })
    );

    // Pagination logic
    const totalItems = leaderboard?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = leaderboard?.slice(startIndex, endIndex) || [];

    // Reset to page 1 when period changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, []);

    return (
        <>
            <Header />

            <div className="mb-20 min-h-screen bg-pure-black text-pure-white">
                <div className="relative mx-auto w-full">
                    <div className="relative mb-8 border-white/10 border-b">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="relative mx-auto max-w-7xl px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="font-argesta font-bold text-3xl tracking-tight">
                                        Leaderboard
                                    </h1>
                                    <p className="mt-2 text-sm text-white/60">
                                        Top performers ranked by total deep work
                                        hours.
                                    </p>
                                </div>

                                {/* Period Filter */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-white/40" />
                                    <select
                                        className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white transition-colors focus:border-white/40 focus:outline-none"
                                        onChange={(e) =>
                                            setPeriod(e.target.value as Period)
                                        }
                                        value={period}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="week">This Week</option>
                                        <option value="month">
                                            This Month
                                        </option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl px-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {new Array(10).map((_, i) => (
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
                        ) : currentItems.length > 0 ? (
                            <div className="space-y-2">
                                {currentItems.map((entry) => (
                                    <Card
                                        className="border border-white/10 bg-black/20 transition-all duration-300 hover:border-white/20"
                                        key={entry.userId}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-6">
                                                <div className="flex w-12 items-center justify-center">
                                                    <span className="font-bold font-mono text-sm text-white/40">
                                                        #{entry.rank}
                                                    </span>
                                                </div>

                                                <div className="relative">
                                                    {entry.rank === 1 && (
                                                        <div className="-top-2 absolute left-5 z-10 transform">
                                                            <Image
                                                                alt="Crown"
                                                                className="drop-shadow-lg"
                                                                height={70}
                                                                src="/img/crown.png"
                                                                width={70}
                                                            />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 ${entry.rank === 1 ? "mt-2" : ""}`}
                                                    >
                                                        {entry.discordAvatar &&
                                                        entry.discordId ? (
                                                            <Image
                                                                alt={entry.name}
                                                                className="h-full w-full object-cover"
                                                                height={48}
                                                                src={`https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.discordAvatar}.png`}
                                                                width={48}
                                                            />
                                                        ) : entry.image ? (
                                                            <Image
                                                                alt={entry.name}
                                                                className="h-full w-full object-cover"
                                                                height={48}
                                                                src={
                                                                    entry.image
                                                                }
                                                                width={48}
                                                            />
                                                        ) : (
                                                            <User className="h-6 w-6 text-white/40" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-argesta text-lg text-white">
                                                            {entry.name}
                                                        </h3>
                                                        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-medium text-white/60 text-xs uppercase tracking-wider">
                                                            {entry.userRank}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-right">
                                                    <Clock className="h-4 w-4 text-white/40" />
                                                    <div>
                                                        <p className="font-light font-mono text-white text-xl leading-none">
                                                            {
                                                                entry.totalWorkHours
                                                            }
                                                            h
                                                            {entry.totalWorkMinutes >
                                                                0 && (
                                                                <span className="ml-1 text-base text-white/60">
                                                                    {
                                                                        entry.totalWorkMinutes
                                                                    }
                                                                    m
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <Clock className="mx-auto mb-4 h-16 w-16 text-white/20" />
                                <h3 className="mb-2 font-argesta text-white/60 text-xl">
                                    No public rankings yet
                                </h3>
                                <p className="text-sm text-white/40">
                                    Be the first to share your deep work
                                    progress on the leaderboard!
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.max(1, currentPage - 1)
                                        )
                                    }
                                    type="button"
                                >
                                    Précédent
                                </button>

                                <span className="text-sm text-white/60">
                                    Page {currentPage} sur {totalPages}
                                </span>

                                <button
                                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                totalPages,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    type="button"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/[0.01] blur-3xl" />
                    <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/[0.005] blur-3xl" />
                </div>
            </div>
        </>
    );
}
