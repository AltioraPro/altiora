"use client";

import {
    RiAddLine,
    RiBugLine,
    RiLightbulbFlashLine,
    RiStarLine,
} from "@remixicon/react";
import { useState } from "react";

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

const ITEMS_PER_PAGE = 10;

interface ChangelogListProps {
    releases: Release[];
}

export function ChangelogList({ releases }: ChangelogListProps) {
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

    const displayedReleases = releases.slice(0, displayedCount);
    const hasMore = displayedCount < releases.length;

    const loadMore = () => {
        setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "feature":
                return <RiAddLine className="size-4 text-green-400" />;
            case "improvement":
                return (
                    <RiLightbulbFlashLine className="size-4 text-blue-400" />
                );
            case "fix":
                return <RiBugLine className="size-4 text-red-400" />;
            default:
                return <RiStarLine className="size-4 text-white/60" />;
        }
    };

    const getVersionBadgeColor = (type: string) => {
        switch (type) {
            case "major":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "minor":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "patch":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            default:
                return "bg-white/10 text-white/60 border-white/20";
        }
    };

    return (
        <>
            <div className="space-y-8">
                {displayedReleases.map((release) => (
                    <div
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                        key={release.version}
                    >
                        {/* Release Header */}
                        <div className="border-white/10 border-b p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span
                                        className={`rounded-full border px-3 py-1 font-bold text-xs ${getVersionBadgeColor(release.type)}`}
                                    >
                                        v{release.version}
                                    </span>
                                    <span className="text-sm text-white/50">
                                        {new Date(
                                            release.date
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            <h2 className="font-bold text-white text-xl">
                                {release.title}
                            </h2>
                        </div>

                        {/* Changes List */}
                        <div className="p-6">
                            <div className="space-y-3">
                                {release.changes.map((change, index) => (
                                    <div
                                        className="flex items-start space-x-3"
                                        key={`${release.version}-${change.prNumber || index}-${change.text}`}
                                    >
                                        {getTypeIcon(change.type)}
                                        <span className="flex-1 text-sm text-white/80 leading-relaxed">
                                            {change.text}
                                            {change.prUrl && (
                                                <a
                                                    className="ml-2 text-white/50 transition-colors hover:text-white/80"
                                                    href={change.prUrl}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    #{change.prNumber}
                                                </a>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/20"
                        onClick={loadMore}
                        type="button"
                    >
                        Load More ({releases.length - displayedCount} remaining)
                    </button>
                </div>
            )}
        </>
    );
}
