"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, TrendingDown, Flame } from "lucide-react";
import type { RouterOutput } from "@/orpc/client";
import { cn } from "@/lib/utils";

interface TradingStatsWidgetProps {
    stats: RouterOutput["trading"]["getStats"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground opacity-50 cursor-help hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}

export function TradingStatsWidget({ stats }: TradingStatsWidgetProps) {
    const avgPnL = stats.avgPnL ?? 0;

    return (
        <TooltipProvider delayDuration={100}>
            <Card className="h-full border-none bg-white dark:bg-secondary/20 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        Trading Stats
                        <InfoTooltip content="Detailed breakdown of your trading performance including exit strategies and streaks." />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Trades Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total trades</span>
                        <span className="text-lg font-bold">{stats.totalTrades}</span>
                    </div>

                    {/* Exit Strategy Breakdown */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Exit Strategy</span>
                            <InfoTooltip content="How your trades were closed: TP (Take Profit) = target hit, BE (Break Even) = no gain/loss, SL (Stop Loss) = loss limit hit." />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-medium">TP {stats.tpTrades}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-sm font-medium">BE {stats.beTrades}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <span className="text-sm font-medium">SL {stats.slTrades}</span>
                            </div>
                        </div>
                        {/* Visual Bar */}
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                            {stats.totalTrades > 0 && (
                                <>
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${(stats.tpTrades / stats.totalTrades) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-amber-500"
                                        style={{ width: `${(stats.beTrades / stats.totalTrades) * 100}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-rose-500"
                                        style={{ width: `${(stats.slTrades / stats.totalTrades) * 100}%` }}
                                    ></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Trade Expectancy */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Trade expectancy</span>
                            <InfoTooltip content="Average profit/loss per trade. Positive expectancy means you make money on average per trade. Calculated as: Average of all trade P&L percentages." />
                        </div>
                        <span className={cn(
                            "text-lg font-bold",
                            avgPnL >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {avgPnL >= 0 ? "+" : ""}{Number(avgPnL).toFixed(2)}%
                        </span>
                    </div>

                    {/* Streaks */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Win streak</span>
                                <InfoTooltip content="Current consecutive winning trades / Maximum winning streak ever achieved." />
                            </div>
                            <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-emerald-500" />
                                <span className="text-lg font-bold text-emerald-500">
                                    {stats.currentWinningStreak ?? 0}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / {stats.maxWinningStreak ?? 0}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Loss streak</span>
                                <InfoTooltip content="Current consecutive losing trades / Maximum losing streak ever. Lower is better." />
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                                <span className="text-lg font-bold text-rose-500">
                                    {stats.currentLosingStreak ?? 0}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / {stats.maxLosingStreak ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
