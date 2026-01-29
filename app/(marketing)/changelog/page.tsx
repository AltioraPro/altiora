import { Header } from "@/components/header";
import { getWebsiteUrl } from "@/lib/urls";
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
    } catch {
        // Silently fail and use fallback
        return fallbackReleases;
    }
}

export default async function ChangelogPage() {
    const releases = await getChangelogData();

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-neutral-800 selection:text-neutral-100">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden border-zinc-800/50 border-b py-20 lg:py-28">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 bg-zinc-900/10 blur-[120px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:border-zinc-800/50 lg:border-r lg:border-l lg:px-8">
                        <div className="max-w-3xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                                Product Updates
                            </span>
                            <h1 className="font-bold font-serif text-5xl text-white tracking-tight sm:text-6xl">
                                Changelog
                            </h1>
                            <p className="mt-6 text-balance text-lg text-zinc-400 leading-relaxed sm:text-xl max-w-2xl">
                                Stay up to date with the latest improvements,
                                features, and fixes we&apos;ve made to Altiora.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Changelog Content */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:border-zinc-800/50 lg:border-r lg:border-l lg:px-8">
                    <div className="py-12 lg:py-20">
                        <ChangelogList releases={releases} />
                    </div>
                </section>
            </main>

            <footer className="h-24 border-zinc-800/50 border-t" />
        </div>
    );
}
