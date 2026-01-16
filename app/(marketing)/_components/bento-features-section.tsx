"use client";

import {
    BarChart3,
    BookOpen,
    Camera,
    Flame,
    PenLine,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "./section";

interface BentoFeaturesSectionProps {
    id?: string;
}

// Mini card component for cascade effect
function MiniCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "border border-neutral-700 bg-neutral-900",
                className
            )}
        >
            {children}
        </div>
    );
}

// Helper function for heatmap colors
function getHeatmapColor(color: string) {
    if (color === "emerald") {
        return "bg-neutral-600";
    }
    if (color === "rose") {
        return "bg-neutral-600";
    }
    return "bg-neutral-700";
}

// Stats Cascade Illustration
function StatsIllustration() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card arrière - Win Rate Gauge */}
            <MiniCard className="-translate-x-16 -translate-y-8 sm:-translate-x-20 -rotate-6 absolute p-3 opacity-50 blur-[1px]">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Win Rate
                    </span>
                    <div className="relative h-12 w-24">
                        <svg className="h-full w-full" viewBox="0 0 100 50">
                            <title>Win Rate Gauge</title>
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#404040"
                                strokeLinecap="round"
                                strokeWidth="8"
                            />
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#737373"
                                strokeDasharray="126"
                                strokeDashoffset="40"
                                strokeLinecap="round"
                                strokeWidth="8"
                            />
                        </svg>
                        <span className="absolute inset-x-0 bottom-0 text-center font-bold text-neutral-100 text-sm">
                            68%
                        </span>
                    </div>
                </div>
            </MiniCard>

            {/* Card milieu - Exit Strategy */}
            <MiniCard className="-translate-x-6 -translate-y-3 sm:-translate-x-8 -rotate-3 absolute p-3 opacity-70">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Exit Strategy
                    </span>
                    <div className="flex h-3 w-32 overflow-hidden sm:w-40">
                        <div className="h-full w-[60%] bg-neutral-600" />
                        <div className="h-full w-[15%] bg-neutral-500" />
                        <div className="h-full w-[25%] bg-neutral-500" />
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-500">
                        <span>TP 28</span>
                        <span>BE 7</span>
                        <span>SL 12</span>
                    </div>
                </div>
            </MiniCard>

            {/* Card devant - Main KPI */}
            <MiniCard className="relative translate-x-4 translate-y-4 p-4 shadow-2xl shadow-black/50 sm:translate-x-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                            Net P&L
                        </span>
                        <TrendingUp className="h-3 w-3 text-neutral-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl text-neutral-100">
                            +2,450.00 €
                        </span>
                        <span className="text-neutral-400 text-xs">+12.4%</span>
                    </div>
                    <div className="flex items-center gap-3 border-neutral-700 border-t pt-2">
                        <div className="flex flex-col">
                            <span className="font-semibold text-neutral-100 text-sm">
                                47
                            </span>
                            <span className="text-[9px] text-neutral-500">
                                Trades
                            </span>
                        </div>
                        <div className="h-6 w-px bg-neutral-700" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-neutral-100 text-sm">
                                32
                            </span>
                            <span className="text-[9px] text-neutral-500">
                                Wins
                            </span>
                        </div>
                        <div className="h-6 w-px bg-neutral-700" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-neutral-100 text-sm">
                                15
                            </span>
                            <span className="text-[9px] text-neutral-500">
                                Losses
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1 text-[10px] text-neutral-400">
                        <Flame className="h-3 w-3" />
                        <span>12 winning streak</span>
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

// Automated Journaling Illustration
function JournalingIllustration() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card arrière - Trade source */}
            <MiniCard className="-translate-x-12 -translate-y-6 sm:-translate-x-16 -rotate-3 absolute p-3 opacity-40 blur-[1px]">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center bg-neutral-800">
                        <span className="font-medium text-[10px]">EU</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-neutral-100 text-xs">
                            EUR/USD
                        </span>
                        <span className="text-[10px] text-neutral-400">
                            +1.2%
                        </span>
                    </div>
                </div>
            </MiniCard>

            {/* Card devant - Auto Journal Entry */}
            <MiniCard className="relative max-w-[280px] translate-x-4 translate-y-2 p-4 shadow-2xl shadow-black/50 sm:max-w-xs sm:translate-x-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center bg-neutral-700/50">
                            <PenLine className="h-3 w-3 text-neutral-400" />
                        </div>
                        <span className="font-medium text-neutral-400 text-xs">
                            Auto Journal Entry
                        </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Trade opened at 08:30, long position on breakout of
                        Asian range. TP1 reached at 10:15, profit of +1.2%.
                        <span className="text-neutral-300">
                            {" "}
                            Setup: H4 support, entry on engulfing confirmation.
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="bg-neutral-800 px-2 py-0.5 text-[9px] text-neutral-500">
                            Breakout
                        </span>
                        <span className="bg-neutral-800 px-2 py-0.5 text-[9px] text-neutral-500">
                            London Session
                        </span>
                        <span className="bg-neutral-700/50 px-2 py-0.5 text-[9px] text-neutral-400">
                            Discipline ✓
                        </span>
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

// Trading Journal Illustration
function TradingJournalIllustration() {
    const heatmapColors = [
        "emerald",
        "emerald",
        "neutral",
        "rose",
        "emerald",
        "neutral",
        "emerald",
    ];

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card arrière - Mini heatmap */}
            <MiniCard className="-translate-x-4 -translate-y-6 sm:-translate-x-6 -rotate-3 absolute p-2 opacity-50 blur-[0.5px]">
                <div className="grid grid-cols-7 gap-0.5">
                    {heatmapColors.map((color, i) => (
                        <div
                            className={`h-2.5 w-2.5 ${getHeatmapColor(color)}`}
                            key={i}
                        />
                    ))}
                </div>
            </MiniCard>

            {/* Card devant - Journal Entry */}
            <MiniCard className="relative max-w-[200px] translate-x-2 translate-y-2 p-3 shadow-2xl shadow-black/50 sm:translate-x-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-neutral-100 text-xs">
                                EUR/USD
                            </span>
                            <span className="bg-neutral-700/50 px-1.5 py-0.5 font-medium text-[9px] text-neutral-400">
                                TP
                            </span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg text-neutral-100">
                            +125.00 €
                        </span>
                        <span className="text-[10px] text-neutral-400">
                            +1.5%
                        </span>
                    </div>
                    <p className="line-clamp-2 text-[10px] text-neutral-500 leading-relaxed">
                        Setup A+ sur support weekly. Confirmation avec engulfing
                        H4...
                    </p>
                    <div className="flex items-center justify-between border-neutral-700 border-t pt-2">
                        <div className="flex gap-1">
                            <span className="bg-neutral-800 px-1.5 py-0.5 text-[8px] text-neutral-500">
                                London
                            </span>
                            <span className="bg-neutral-800 px-1.5 py-0.5 text-[8px] text-neutral-500">
                                Trend
                            </span>
                        </div>
                        <Camera className="h-3 w-3 text-neutral-600" />
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

export function BentoFeaturesSection({ id }: BentoFeaturesSectionProps) {
    return (
        <Section id={id}>
            <h2 className="flex flex-col font-normal text-2xl sm:text-3xl">
                <span>Powerful Features</span>
                <span className="text-neutral-400">
                    Tools designed to elevate your trading.
                </span>
            </h2>

            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {/* Top block - Full width */}
                    <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6 sm:flex-row lg:col-span-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex h-12 w-12 items-center justify-center bg-neutral-800">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-medium text-xl">
                                Automated Statistics
                            </h3>
                            <p className="max-w-2xl text-neutral-400">
                                Get instant insights into your trading
                                performance. Profit/loss tracking, win rate,
                                risk metrics, and more — all calculated
                                automatically.
                            </p>
                        </div>
                        <figure className="relative mt-2 flex h-[220px] w-full flex-col items-center justify-center overflow-hidden bg-neutral-800 sm:h-[240px] sm:w-xl sm:flex-row">
                            <StatsIllustration />
                        </figure>
                    </div>

                    {/* Bottom left - 2/3 width */}
                    <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6 lg:col-span-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex h-12 w-12 items-center justify-center bg-neutral-800">
                                <PenLine className="h-6 w-6 text-white" />
                            </div>

                            <h3 className="font-medium text-xl">
                                Automated Journaling
                            </h3>
                            <p className="max-w-xl text-neutral-400">
                                Automatically generate detailed journal entries
                                from your trades. Understand your patterns,
                                emotions, and decision-making process without
                                manual input.
                            </p>
                        </div>
                        <figure className="relative mt-2 flex h-[220px] w-full items-center justify-center overflow-hidden bg-neutral-800 sm:h-[240px]">
                            <JournalingIllustration />
                        </figure>
                    </div>

                    {/* Bottom right - 1/3 width */}
                    <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex h-12 w-12 items-center justify-center bg-neutral-800">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-medium text-xl">
                                Trading Journal
                            </h3>
                            <p className="text-neutral-400">
                                Document every trade with context. Notes,
                                screenshots, and tags to build your personal
                                playbook.
                            </p>
                        </div>
                        <figure className="relative mt-2 flex h-[220px] w-full items-center justify-center overflow-hidden bg-neutral-800 sm:h-[240px]">
                            <TradingJournalIllustration />
                        </figure>
                    </div>
                </div>
            </div>
        </Section>
    );
}
