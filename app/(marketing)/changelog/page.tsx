import { Header } from "@/components/header";
import { getWebsiteUrl } from "@/lib/urls";
import {
    RiAddLine,
    RiBugLine,
    RiLightbulbFlashLine
} from "@remixicon/react";
import { ChangelogList } from "./_components/changelog-list";

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

// Fallback releases if no GitHub data
const fallbackReleases: Release[] = [
    {
        version: "2.1.0",
        date: "2024-01-15",
        type: "major",
        title: "Discord Integration & Advanced Analytics",
        changes: [
            {
                type: "feature",
                text: "Discord bot integration for Pomodoro sessions",
            },
            {
                type: "feature",
                text: "Advanced trading analytics dashboard",
            },
            {
                type: "feature",
                text: "Habit streak analytics and insights",
            },
            {
                type: "improvement",
                text: "Improved performance across all modules",
            },
            {
                type: "fix",
                text: "Fixed timezone issues in habit tracking",
            },
        ],
    },
    {
        version: "2.0.0",
        date: "2024-01-01",
        type: "major",
        title: "Major Platform Overhaul",
        changes: [
            {
                type: "feature",
                text: "Complete UI/UX redesign with glassmorphism effects",
            },
            { type: "feature", text: "New goal planning system with OKRs" },
            {
                type: "feature",
                text: "Enhanced trading journal with emotion tracking",
            },
            {
                type: "improvement",
                text: "Faster load times and better mobile experience",
            },
            {
                type: "improvement",
                text: "Improved accessibility features",
            },
        ],
    },
    {
        version: "1.8.2",
        date: "2023-12-20",
        type: "patch",
        title: "Bug Fixes & Performance",
        changes: [
            {
                type: "fix",
                text: "Fixed habit completion not saving properly",
            },
            { type: "fix", text: "Resolved trading journal export issues" },
            {
                type: "improvement",
                text: "Optimized database queries for better performance",
            },
        ],
    },
    {
        version: "1.8.0",
        date: "2023-12-10",
        type: "minor",
        title: "Enhanced Habit Tracking",
        changes: [
            { type: "feature", text: "Calendar view for habit tracking" },
            { type: "feature", text: "Habit templates and suggestions" },
            {
                type: "improvement",
                text: "Better habit statistics and insights",
            },
            { type: "fix", text: "Fixed notification timing issues" },
        ],
    },
    {
        version: "1.7.0",
        date: "2023-11-25",
        type: "minor",
        title: "Trading Journal Enhancements",
        changes: [
            {
                type: "feature",
                text: "AI-powered trade analysis suggestions",
            },
            { type: "feature", text: "Custom tags and filtering system" },
            {
                type: "feature",
                text: "Trade performance visualization charts",
            },
            {
                type: "improvement",
                text: "Enhanced data export capabilities",
            },
        ],
    },
];

async function getChangelogData(): Promise<Release[]> {
    try {
        const baseUrl = getWebsiteUrl();
        const response = await fetch(`${baseUrl}/api/changelog`, {
            next: { revalidate: 300 }, // Revalidate every 5 minutes
        });

        if (!response.ok) {
            console.error("Failed to fetch changelog:", response.statusText);
            return fallbackReleases;
        }

        const data = await response.json();
        const githubReleases = data.releases || [];
        return githubReleases.length > 0 ? githubReleases : fallbackReleases;
    } catch (error) {
        console.error("Error fetching changelog:", error);
        return fallbackReleases;
    }
}

export default async function ChangelogPage() {
    const releases = await getChangelogData();

    return (
        <>
            <Header />
            <div className="min-h-screen pt-20 text-pure-white">
                <div className="mx-auto max-w-4xl px-6 py-16">
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 bg-linear-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent">
                            CHANGELOG
                        </h1>
                        <div className="mx-auto h-px w-24 bg-linear-to-r from-transparent via-white to-transparent opacity-50" />
                        <p className="mt-6 text-white/60">
                            Track all updates, improvements, and new features
                        </p>
                    </div>

                    <ChangelogList releases={releases} />

                    {/* Legend */}
                    <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="mb-4 font-bold text-lg text-white">
                            Legend
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex items-center space-x-3">
                                <RiAddLine className="size-4 text-green-400" />
                                <span className="text-sm text-white/70">
                                    New Feature
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <RiLightbulbFlashLine className="size-4 text-blue-400" />
                                <span className="text-sm text-white/70">
                                    Improvement
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <RiBugLine className="size-4 text-red-400" />
                                <span className="text-sm text-white/70">
                                    Bug Fix
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Subscribe to Updates */}
                    <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                        <h3 className="mb-4 font-bold text-white text-xl">
                            Stay Updated
                        </h3>
                        <p className="mb-6 text-white/60">
                            Get notified about new releases and features
                        </p>
                        <a
                            className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/20"
                            href="mailto:updates@altiora.app?subject=Subscribe to Updates"
                        >
                            Subscribe to Updates
                        </a>
                    </div>
                </div>
            </div>

        </>
    );
}
