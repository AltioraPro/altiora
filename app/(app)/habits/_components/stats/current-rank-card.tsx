"use client";

import { cn } from "@/lib/utils";
import type { RankInfo } from "./rank-system";

interface CurrentRankCardProps {
    rank: RankInfo;
}

export function CurrentRankCard({ rank }: CurrentRankCardProps) {
    const RankIcon = rank.icon;

    return (
        <div className={cn("mb-4 p-4", rank.bgColor, rank.borderColor)}>
            <div className="mb-3 flex items-center space-x-3">
                <RankIcon className={`h-6 w-6 ${rank.color}`} />
                <h3 className={`font-bold text-lg ${rank.color}`}>
                    YOUR CURRENT RANK: {rank.name}
                </h3>
            </div>
            <p className="mb-3 text-sm">{rank.description}</p>
            <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                    <span className="text-white/60">Discord Role:</span>
                    <span className={rank.color}>{rank.discordRole}</span>
                </div>
                <div className="text-sm text-white/60">Benefits:</div>
                <ul className="ml-4 space-y-1">
                    {rank.benefits.map((benefit) => (
                        <li
                            className="flex items-center space-x-2 text-sm text-white/80"
                            key={benefit}
                        >
                            <div className="h-1 w-1 rounded-full bg-white/40" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
