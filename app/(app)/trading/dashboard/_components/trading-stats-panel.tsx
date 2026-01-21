"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TradingStatsPanelProps {
    calendarStats: {
        positiveDays: number;
        negativeDays: number;
        neutralDays: number;
        totalDays: number;
    };
    activityPerDay: {
        day: string;
        count: number;
        percentage: number;
        totalPnL: number;
        wins: number;
        losses: number;
        winRate: number;
    }[];
    tradeStats: {
        bestTrade: number;
        worstTrade: number;
        maxDrawdown: number;
        closedTrades: number;
    };
}

export function TradingStatsPanel({
    calendarStats,
    activityPerDay,
    tradeStats,
}: TradingStatsPanelProps) {
    const dayWinRate =
        calendarStats.totalDays > 0
            ? (calendarStats.positiveDays / calendarStats.totalDays) * 100
            : 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border border-zinc-800/50 bg-background p-0 overflow-hidden ring-1 ring-white/2 rounded-none">
                <div className="p-5 space-y-5">
                    {/* Trade Stats - 2x2 grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-none">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                Best trade
                            </div>
                            <div className="font-bold text-lg text-emerald-400">
                                +{tradeStats.bestTrade.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-none">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                Worst trade
                            </div>
                            <div className="font-bold text-lg text-red-400">
                                {tradeStats.worstTrade.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-none">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                Max drawdown
                            </div>
                            <div className="font-bold text-lg text-red-400">
                                {tradeStats.maxDrawdown.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-none">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                Closed trades
                            </div>
                            <div className="font-bold text-lg text-white">
                                {tradeStats.closedTrades}
                            </div>
                        </div>
                    </div>

                    {/* Activity Per Day - Vertical bars with tooltips */}
                    <div className="bg-zinc-900/30 border border-zinc-800/40 p-4 rounded-none">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <RiCalendarCheckLine className="size-3.5 text-zinc-500" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                    Activity Per Day
                                </span>
                            </div>
                            <span className="text-[8px] text-zinc-600 italic">
                                Hover for details
                            </span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {activityPerDay.map((day) => (
                                <Tooltip key={day.day}>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
                                            <div className="relative h-12 w-full flex items-end justify-center">
                                                <div
                                                    className={cn(
                                                        "w-full rounded-none transition-all duration-300",
                                                        day.count > 0
                                                            ? day.totalPnL > 0
                                                                ? "bg-emerald-400/30 group-hover:bg-emerald-400/50"
                                                                : day.totalPnL <
                                                                    0
                                                                  ? "bg-red-400/30 group-hover:bg-red-400/50"
                                                                  : "bg-white/20 group-hover:bg-white/40"
                                                            : "bg-zinc-800/30"
                                                    )}
                                                    style={{
                                                        height: `${day.count > 0 ? Math.max(day.percentage, 15) : 8}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                                                {day.day}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        className="bg-black border-zinc-800 p-3 ring-1 ring-white/10"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="font-bold text-sm text-white">
                                                {day.day}
                                            </div>
                                            {day.count > 0 ? (
                                                <>
                                                    <div className="flex justify-between gap-4 text-xs">
                                                        <span className="text-zinc-500">
                                                            Trades:
                                                        </span>
                                                        <span className="font-bold text-white">
                                                            {day.count}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4 text-xs">
                                                        <span className="text-zinc-500">
                                                            P&L:
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "font-bold",
                                                                day.totalPnL >=
                                                                    0
                                                                    ? "text-emerald-400"
                                                                    : "text-red-400"
                                                            )}
                                                        >
                                                            {day.totalPnL >= 0
                                                                ? "+"
                                                                : ""}
                                                            {day.totalPnL.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4 text-xs">
                                                        <span className="text-zinc-500">
                                                            Win/Loss:
                                                        </span>
                                                        <span>
                                                            <span className="text-emerald-400">
                                                                {day.wins}
                                                            </span>
                                                            {" / "}
                                                            <span className="text-red-400">
                                                                {day.losses}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4 text-xs">
                                                        <span className="text-zinc-500">
                                                            Win rate:
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "font-bold",
                                                                day.winRate >=
                                                                    50
                                                                    ? "text-emerald-400"
                                                                    : "text-red-400"
                                                            )}
                                                        >
                                                            {day.winRate.toFixed(
                                                                0
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-zinc-600 text-xs">
                                                    No trades
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Trading Days - Compact row */}
                    <div className="bg-zinc-900/30 border border-zinc-800/40 p-4 rounded-none">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                Trading Days (all time)
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500/60">
                                    Day Win Rate
                                </span>
                                <span
                                    className={cn(
                                        "font-bold text-sm",
                                        dayWinRate >= 50
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    )}
                                >
                                    {dayWinRate.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-emerald-400">
                                    {calendarStats.positiveDays}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/70">
                                    Green
                                </div>
                            </div>
                            <div className="w-px bg-zinc-800/50" />
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-red-400">
                                    {calendarStats.negativeDays}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-red-400/70">
                                    Red
                                </div>
                            </div>
                            <div className="w-px bg-zinc-800/50" />
                            <div className="flex-1 text-center">
                                <div className="font-bold text-xl text-white">
                                    {calendarStats.neutralDays}
                                </div>
                                <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                    Even
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
}
