"use client";

import {
    RiArrowDownLine,
    RiFireLine,
    RiInformationLine,
} from "@remixicon/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface TradingStatsWidgetProps {
    stats: RouterOutput["trading"]["getStats"];
}

function InfoTooltip({ content }: { content: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <RiInformationLine className="h-3.5 w-3.5 cursor-help text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />
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
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 font-medium text-base">
                        Trading Stats
                        <InfoTooltip content="Detailed breakdown of your trading performance including exit strategies and streaks." />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Trades Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                            Total trades
                        </span>
                        <span className="font-bold text-lg">
                            {stats.totalTrades}
                        </span>
                    </div>

                    {/* Exit Strategy Breakdown */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">
                                Exit Strategy
                            </span>
                            <InfoTooltip content="How your trades were closed: TP (Take Profit) = target hit, BE (Break Even) = no gain/loss, SL (Stop Loss) = loss limit hit." />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                <span className="font-medium text-sm">
                                    TP {stats.tpTrades}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <span className="font-medium text-sm">
                                    BE {stats.beTrades}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-rose-500" />
                                <span className="font-medium text-sm">
                                    SL {stats.slTrades}
                                </span>
                            </div>
                        </div>
                        {/* Visual Bar */}
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                            {stats.totalTrades > 0 && (
                                <>
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{
                                            width: `${(stats.tpTrades / stats.totalTrades) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-amber-500"
                                        style={{
                                            width: `${(stats.beTrades / stats.totalTrades) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-full bg-rose-500"
                                        style={{
                                            width: `${(stats.slTrades / stats.totalTrades) * 100}%`,
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Trade Expectancy */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">
                                Trade expectancy
                            </span>
                            <InfoTooltip content="Average profit/loss per trade. Positive expectancy means you make money on average per trade. Calculated as: Average of all trade P&L percentages." />
                        </div>
                        <span
                            className={cn(
                                "font-bold text-lg",
                                Number(avgPnL) >= 0
                                    ? "text-emerald-500"
                                    : "text-rose-500"
                            )}
                        >
                            {Number(avgPnL) >= 0 ? "+" : ""}
                            {Number(avgPnL).toFixed(2)}%
                        </span>
                    </div>

                    {/* Streaks */}
                    <div className="grid grid-cols-2 gap-4 border-border/50 border-t pt-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs">
                                    Win streak
                                </span>
                                <InfoTooltip content="Current consecutive winning trades / Maximum winning streak ever achieved." />
                            </div>
                            <div className="flex items-center gap-1">
                                <RiFireLine className="h-4 w-4 text-emerald-500" />
                                <span className="font-bold text-emerald-500 text-lg">
                                    {stats.currentWinningStreak ?? 0}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    / {stats.maxWinningStreak ?? 0}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs">
                                    Loss streak
                                </span>
                                <InfoTooltip content="Current consecutive losing trades / Maximum losing streak ever. Lower is better." />
                            </div>
                            <div className="flex items-center gap-1">
                                <RiArrowDownLine className="h-4 w-4 text-rose-500" />
                                <span className="font-bold text-lg text-rose-500">
                                    {stats.currentLosingStreak ?? 0}
                                </span>
                                <span className="text-muted-foreground text-xs">
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
