"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { api } from "@/trpc/client";
import { Clock, User, Calendar } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type Period = "all" | "week" | "month" | "year";

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const { data: leaderboard, isLoading } = api.leaderboard.getLeaderboard.useQuery(
        { period },
        {
            refetchOnWindowFocus: false,
            staleTime: 30000,
        }
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
    }, [period]);

    return (
        <>
            <Header />

            <div className="min-h-screen bg-pure-black text-pure-white mb-20">
                <div className="relative w-full mx-auto">
                    <div className="relative border-b border-white/10 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="relative max-w-7xl mx-auto px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold font-argesta tracking-tight">
                                        Leaderboard
                                    </h1>
                                    <p className="text-white/60 text-sm mt-2">
                                        Top performers ranked by total deep work hours.
                                    </p>
                                </div>

                                {/* Period Filter */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-white/40" />
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value as Period)}
                                        className="bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-6 bg-black/20 rounded-lg border border-white/10 animate-pulse"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/10 rounded" />
                                            <div className="w-12 h-12 bg-white/10 rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-6 bg-white/10 rounded w-48 mb-2" />
                                            </div>
                                            <div className="h-8 bg-white/10 rounded w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : currentItems && currentItems.length > 0 ? (
                            <div className="space-y-2">
                                {currentItems.map((entry) => (
                                    <Card
                                        key={entry.userId}
                                        className="border border-white/10 bg-black/20 transition-all duration-300 hover:border-white/20"
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 flex items-center justify-center">
                                                    <span className="text-white/40 text-sm font-bold font-mono">
                                                        #{entry.rank}
                                                    </span>
                                                </div>

                                                <div className="relative">
                                                    {entry.rank === 1 && (
                                                        <div className="absolute -top-2 left-5 transform z-10">
                                                            <Image
                                                                src="/img/crown.png"
                                                                alt="Crown"
                                                                width={70}
                                                                height={70}
                                                                className="drop-shadow-lg"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className={`w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden ${entry.rank === 1 ? 'mt-2' : ''}`}>
                                                        {entry.discordAvatar && entry.discordId ? (
                                                            <Image
                                                                src={`https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.discordAvatar}.png`}
                                                                alt={entry.name}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : entry.image ? (
                                                            <Image
                                                                src={entry.image}
                                                                alt={entry.name}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-6 h-6 text-white/40" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-argesta text-white">
                                                            {entry.name}
                                                        </h3>
                                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 font-medium uppercase tracking-wider">
                                                            {entry.userRank}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-right">
                                                    <Clock className="w-4 h-4 text-white/40" />
                                                    <div>
                                                        <p className="text-xl font-light text-white leading-none font-mono">
                                                            {entry.totalWorkHours}h
                                                            {entry.totalWorkMinutes > 0 && (
                                                                <span className="text-base text-white/60 ml-1">
                                                                    {entry.totalWorkMinutes}m
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
                            <div className="text-center py-20">
                                <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                <h3 className="text-xl font-argesta text-white/60 mb-2">
                                    No public rankings yet
                                </h3>
                                <p className="text-white/40 text-sm">
                                    Be the first to share your deep work progress on the leaderboard!
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    Précédent
                                </button>

                                <span className="text-white/60 text-sm">
                                    Page {currentPage} sur {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
                </div>
            </div>
        </>
    );
}

