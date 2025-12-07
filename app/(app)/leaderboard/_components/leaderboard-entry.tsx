import { RiTimerLine, RiUserLine } from "@remixicon/react";
import Image from "next/image";
import { getRankByName } from "@/app/(app)/habits/_components/stats/rank-system";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface LeaderboardEntryProps {
    entry: RouterOutput["leaderboard"]["getLeaderboard"][number];
}

export function LeaderboardEntry({ entry }: LeaderboardEntryProps) {
    const rankInfo = getRankByName(entry.userRank);

    return (
        <Card className="border border-white/10 bg-black/20 transition-all duration-300 hover:border-white/20">
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
                            {entry.image ? (
                                <Image
                                    alt={entry.name}
                                    className="size-full object-cover"
                                    height={48}
                                    src={entry.image}
                                    width={48}
                                />
                            ) : (
                                <RiUserLine className="h-6 w-6 text-white/40" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-argesta text-lg text-white">
                                {entry.name}
                            </h3>
                            <span
                                className={cn(
                                    "rounded border px-2 py-0.5 font-medium text-xs uppercase tracking-wider",
                                    rankInfo.bgColor,
                                    rankInfo.borderColor,
                                    rankInfo.color
                                )}
                            >
                                {entry.userRank}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                        <RiTimerLine className="h-4 w-4 text-white/40" />
                        <div>
                            <p className="font-light font-mono text-white text-xl leading-none">
                                {entry.totalWorkHours}h
                                {entry.totalWorkMinutes > 0 && (
                                    <span className="ml-1 text-base text-white/60">
                                        {entry.totalWorkMinutes}m
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
