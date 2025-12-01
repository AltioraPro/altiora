"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RankInfo } from "./rank-system";

interface CurrentRankCardProps {
    rank: RankInfo;
}

export const CurrentRankCard = memo(function CurrentRankCard({
    rank,
}: CurrentRankCardProps) {
    const RankIcon = rank.icon;

    return (
        <div
            className={cn(
                "relative overflow-hidden border p-6 transition-all duration-300",   
                rank.bgColor,
                rank.borderColor
            )}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                "flex h-14 w-14 items-center justify-center bg-black border border-white/10 shadow-inner",
                                rank.borderColor
                            )}
                        >
                            <RankIcon className={cn("h-7 w-7", rank.color)} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                Current Rank
                            </div>
                            <h3 className={cn("font-bold text-2xl tracking-tight text-white")}>
                                {rank.name}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-white/60 font-medium">
                    {rank.description}
                </p>

                {/* Divider */}
                <div className="h-px w-full bg-white/5" />

                {/* Details */}
                <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between bg-white/[0.02] p-3 border border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Role
                        </span>
                        <span className={cn("font-semibold text-sm", rank.color)}>
                            {rank.discordRole}
                        </span>
                    </div>

                    <div>
                        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Benefits
                        </div>
                        <ul className="space-y-2">
                            {rank.benefits.map((benefit) => (
                                <li
                                    className="flex items-start gap-3 text-sm text-white/80"
                                    key={benefit}
                                >
                                    <div
                                        className={cn(
                                            "mt-2 h-1 w-1 shrink-0",
                                            rank.color.replace("text-", "bg-")
                                        )}
                                    />
                                    <span className="leading-relaxed text-xs">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
});
