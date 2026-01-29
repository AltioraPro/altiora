"use client";

import {
    RiAddLine,
    RiArrowDownLine,
    RiBugLine,
    RiExternalLinkLine,
    RiLightbulbFlashLine,
} from "@remixicon/react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChangelogEntry {
    type: "feature" | "improvement" | "fix";
    text: string;
    prNumber?: number;
    prUrl?: string;
}

interface Release {
    version: string;
    date: string;
    type: "major" | "minor" | "patch";
    title: string;
    changes: ChangelogEntry[];
}

const ITEMS_PER_PAGE = 5;

interface ChangelogListProps {
    releases: Release[];
}

const categories = [
    {
        type: "feature",
        label: "New Features",
        icon: RiAddLine,
        color: "text-white",
        bgColor: "bg-zinc-100",
    },
    {
        type: "improvement",
        label: "Improvements",
        icon: RiLightbulbFlashLine,
        color: "text-zinc-400",
        bgColor: "bg-zinc-800",
    },
    {
        type: "fix",
        label: "Fixes",
        icon: RiBugLine,
        color: "text-zinc-500",
        bgColor: "bg-zinc-900",
    },
] as const;

export function ChangelogList({ releases }: ChangelogListProps) {
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

    const displayedReleases = releases.slice(0, displayedCount);
    const hasMore = displayedCount < releases.length;

    const loadMore = () => {
        setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
    };

    return (
        <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[20px] top-4 bottom-4 w-px bg-zinc-800 lg:left-0" />

            <div className="space-y-32">
                {displayedReleases.map((release, releaseIdx) => (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        key={release.version}
                        transition={{ duration: 0.5, delay: releaseIdx * 0.1 }}
                    >
                        {/* Timeline Connector */}
                        <div className="absolute top-[12px] left-[16px] z-10 lg:-left-1">
                            <div className="h-2 w-2 rounded-full bg-zinc-700 ring-[6px] ring-background" />
                        </div>

                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-16">
                            {/* Version & Date Column */}
                            <div className="pl-12 lg:col-span-1 lg:pl-10">
                                <div className="sticky top-28 flex flex-col gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                        {new Date(
                                            release.date
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-3xl text-white tracking-tight">
                                            v{release.version}
                                        </h3>
                                        {release.type === "major" && (
                                            <span className="rounded-sm bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
                                                Major
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Release Content Column */}
                            <div className="pl-12 lg:col-span-3 lg:pl-0">
                                <div className="space-y-16">
                                    <h4 className="max-w-3xl font-serif text-3xl text-zinc-100 leading-tight tracking-tight sm:text-4xl">
                                        {release.title}
                                    </h4>

                                    <div className="space-y-16">
                                        {categories.map((category) => {
                                            const categoryChanges =
                                                release.changes.filter(
                                                    (c) =>
                                                        c.type === category.type
                                                );

                                            if (categoryChanges.length === 0)
                                                return null;

                                            return (
                                                <div
                                                    className="group/cat space-y-6"
                                                    key={category.type}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "flex h-5 w-5 items-center justify-center rounded-[2px]",
                                                                category.bgColor
                                                            )}
                                                        >
                                                            <category.icon
                                                                className={cn(
                                                                    "size-3",
                                                                    category.color ===
                                                                        "text-white"
                                                                        ? "text-black"
                                                                        : category.color
                                                                )}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover/cat:text-zinc-200 transition-colors">
                                                            {category.label}
                                                        </span>
                                                    </div>

                                                    <ul className="space-y-6 border-zinc-800/80 border-l pl-8">
                                                        {categoryChanges.map(
                                                            (
                                                                change,
                                                                changeIdx
                                                            ) => (
                                                                <li
                                                                    className="group flex items-start gap-4"
                                                                    key={`${release.version}-${change.text}-${changeIdx}`}
                                                                >
                                                                    <div className="max-w-2xl">
                                                                        <p className="text-zinc-400 text-lg leading-relaxed transition-colors group-hover:text-zinc-100 sm:text-xl">
                                                                            {
                                                                                change.text
                                                                            }
                                                                            {change.prUrl && (
                                                                                <a
                                                                                    className="ml-3 inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-400"
                                                                                    href={
                                                                                        change.prUrl
                                                                                    }
                                                                                    rel="noopener noreferrer"
                                                                                    target="_blank"
                                                                                >
                                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                                        #{
                                                                                            change.prNumber
                                                                                        }
                                                                                    </span>
                                                                                    <RiExternalLinkLine className="size-3" />
                                                                                </a>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {hasMore && (
                <div className="mt-40 flex justify-center pb-20">
                    <button
                        className="group flex flex-col items-center gap-6 transition-all"
                        onClick={loadMore}
                        type="button"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 transition-colors group-hover:text-zinc-200">
                            Previous updates (
                            {releases.length - displayedCount})
                        </span>
                        <div className="flex h-12 w-12 items-center justify-center border border-zinc-800 bg-zinc-900/50 transition-all ring-1 ring-white/5 group-hover:bg-zinc-800 group-hover:ring-white/10">
                            <RiArrowDownLine className="size-4 text-zinc-400 transition-colors group-hover:text-white" />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
