"use client";

import {
    RiCalendarLine,
    RiCheckboxLine,
    RiDashboardLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
} from "@remixicon/react";
import { ArrowRight, Check, Layers, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "./section";

interface AdvantagesSectionProps {
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

// Centralized Tools Illustration
function CentralizedToolsIllustration() {
    const moduleIcons = [
        {
            Icon: RiTargetLine,
            label: "Goals",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 12,
        },
        {
            Icon: RiCheckboxLine,
            label: "Habits",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 8,
        },
        {
            Icon: RiStockLine,
            label: "Trading",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 47,
        },
        {
            Icon: RiCalendarLine,
            label: "Calendar",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 30,
        },
        {
            Icon: RiDashboardLine,
            label: "Dashboard",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 5,
        },
        {
            Icon: RiTrophyLine,
            label: "Leaderboard",
            bgClass: "bg-neutral-700/50",
            textClass: "text-neutral-400",
            count: 142,
        },
    ];

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card devant - Centralized dashboard */}
            <MiniCard className="relative min-h-[280px] translate-x-4 p-4 shadow-2xl shadow-black/50 sm:translate-x-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center bg-neutral-700/50">
                                <Layers className="h-4 w-4 text-neutral-400" />
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                Altiora Platform
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-700/50 px-1.5 py-0.5">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                            <span className="text-[8px] text-neutral-400">
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-neutral-100 text-xl">
                            All-in-One Hub
                        </span>
                        <p className="text-neutral-400 text-xs leading-relaxed">
                            6 powerful modules seamlessly integrated in one
                            unified platform.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-neutral-700 border-t pt-2">
                        {moduleIcons.slice(0, 4).map((module) => (
                            <div
                                className="flex items-center gap-1.5"
                                key={module.label}
                            >
                                <div
                                    className={cn(
                                        "flex h-5 w-5 items-center justify-center",
                                        module.bgClass
                                    )}
                                >
                                    <module.Icon
                                        className={cn(
                                            "h-2.5 w-2.5",
                                            module.textClass
                                        )}
                                    />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <span className="font-medium text-[10px] text-neutral-100">
                                        {module.label}
                                    </span>
                                    <span className="text-[8px] text-neutral-500">
                                        {module.count} items
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1.5">
                        <Zap className="h-3 w-3 text-neutral-400" />
                        <span className="text-[9px] text-neutral-400">
                            Real-time sync across all modules
                        </span>
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

// Modern Interface Illustration
function ModernInterfaceIllustration() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card devant - Desktop view with rich UI */}
            <MiniCard className="relative min-h-[280px] w-[120%] translate-x-4 p-4 shadow-2xl shadow-black/50 sm:translate-x-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                Responsive Design
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <div className="h-2 w-2 rounded-full bg-neutral-500" />
                            <div className="h-2 w-2 rounded-full bg-neutral-500" />
                            <div className="h-2 w-2 rounded-full bg-neutral-500" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Sidebar */}
                        <div className="flex w-14 flex-col gap-2 bg-neutral-800 p-2">
                            <div className="flex flex-col gap-1.5">
                                <div className="h-2 w-full bg-neutral-700" />
                                <div className="h-2 w-full bg-neutral-600" />
                                <div className="h-2 w-3/4 bg-neutral-700" />
                            </div>
                            <div className="mt-auto flex flex-col gap-1">
                                <div className="h-1.5 w-full bg-neutral-700" />
                                <div className="h-1.5 w-2/3 bg-neutral-700" />
                            </div>
                        </div>
                        {/* Main content */}
                        <div className="flex flex-1 flex-col gap-2">
                            {/* Header */}
                            <div className="flex items-center justify-between bg-neutral-800 p-2">
                                <div className="h-2.5 w-24 bg-neutral-700" />
                                <div className="flex gap-1">
                                    <div className="h-4 w-4 bg-neutral-700" />
                                    <div className="h-4 w-4 bg-neutral-700" />
                                </div>
                            </div>
                            {/* Chart area */}
                            <div className="flex flex-col gap-1.5 bg-neutral-800 p-2">
                                <div className="h-2 w-16 bg-neutral-700" />
                                <div className="relative h-16 w-full">
                                    {/* Mini chart */}
                                    <svg
                                        className="h-full w-full"
                                        viewBox="0 0 100 40"
                                    >
                                        <title>Performance Chart</title>
                                        <path
                                            d="M 5 35 L 15 30 L 25 25 L 35 20 L 45 22 L 55 18 L 65 15 L 75 12 L 85 10 L 95 8"
                                            fill="none"
                                            stroke="#737373"
                                            strokeLinecap="round"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M 5 35 L 15 30 L 25 25 L 35 20 L 45 22 L 55 18 L 65 15 L 75 12 L 85 10 L 95 8"
                                            fill="url(#gradient)"
                                            opacity="0.2"
                                        />
                                        <defs>
                                            <linearGradient
                                                id="gradient"
                                                x1="0%"
                                                x2="0%"
                                                y1="0%"
                                                y2="100%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#737373"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#737373"
                                                    stopOpacity="0"
                                                />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                        <span className="text-[8px] text-neutral-500">
                                            +12.4%
                                        </span>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-neutral-600" />
                                </div>
                            </div>
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-1.5">
                                <div className="bg-neutral-800 p-1.5">
                                    <div className="h-1.5 w-8 bg-neutral-700" />
                                    <div className="mt-1 h-2.5 w-12 bg-neutral-500" />
                                </div>
                                <div className="bg-neutral-800 p-1.5">
                                    <div className="h-1.5 w-8 bg-neutral-700" />
                                    <div className="mt-1 h-2.5 w-12 bg-neutral-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

// Best Value Illustration
function BestValueIllustration() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Card devant - Altiora pricing with rich details */}
            <MiniCard className="relative min-h-[280px] w-[120%] translate-x-4 p-4 shadow-2xl shadow-black/50 sm:translate-x-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                Altiora
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-neutral-700/50 px-2 py-0.5">
                            <Star className="h-2.5 w-2.5 fill-neutral-400 text-neutral-400" />
                            <span className="text-[9px] text-neutral-400">
                                Best Value
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-3xl text-neutral-100">
                                $9
                            </span>
                            <span className="text-neutral-500 text-xs">
                                /month
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    className="h-2 w-2 fill-neutral-400 text-neutral-400"
                                    key={i}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Features list */}
                    <div className="grid grid-cols-2 gap-1.5 border-neutral-700 border-t pt-6">
                        {[
                            "Unlimited trades",
                            "All features unlocked",
                            "No hidden fees",
                            "Priority support",
                        ].map((feature) => (
                            <div
                                className="flex items-center gap-2"
                                key={feature}
                            >
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-700/50">
                                    <Check className="h-3 w-3 text-neutral-400" />
                                </div>
                                <span className="text-neutral-400 text-xs">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </MiniCard>
        </div>
    );
}

interface Feature {
    title: string;
    description: string;
    illustration: React.ReactNode;
}

const features: Feature[] = [
    {
        title: "Centralized Tools",
        description:
            "Everything you need in one place. Trading journal, habits, and goals all together.",
        illustration: <CentralizedToolsIllustration />,
    },
    {
        title: "Modern and Responsive Interface",
        description:
            "Modern design, smooth usage. Altiora makes your tools pleasant to use.",
        illustration: <ModernInterfaceIllustration />,
    },
    {
        title: "Best Value for Money",
        description:
            "No add-ons, no hidden fees. A fair price for all features.",
        illustration: <BestValueIllustration />,
    },
];

export function AdvantagesSection({ id }: AdvantagesSectionProps) {
    return (
        <Section id={id}>
            <h2 className="flex flex-col font-normal text-2xl sm:text-3xl">
                <span>Why Altiora ?</span>
                <span className="text-neutral-400">
                    It's the modern platform for traders.
                </span>
            </h2>
            <div className="mx-auto w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            className="flex flex-1 flex-col justify-between gap-4 bg-neutral-900 p-4"
                            key={feature.title}
                        >
                            <div>
                                <h3 className="font-medium">{feature.title}</h3>
                                <p className="text-neutral-400">
                                    {feature.description}
                                </p>
                            </div>
                            <figure className="relative mt-2 flex h-[378px] w-full items-center justify-center overflow-hidden bg-neutral-800">
                                {feature.illustration}
                            </figure>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
}
