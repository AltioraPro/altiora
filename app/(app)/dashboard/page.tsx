import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/orpc/server";
import { JournalFilter } from "./_components/journal-filter";
import { OnboardingContent } from "./_components/onboarding";

export default async function GlobalDashboardPage() {
    const journals = await api.trading.getJournals({ input: {} });

    if (journals?.length === 0) {
        return <OnboardingContent />;
    }

    const [sessions, trades, stats] = await Promise.all([
        api.trading.getSessions({}),
        api.trading.getTrades({}),
        api.trading.getStats({}),
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Navigation */}
            <div className="mb-6 flex items-center space-x-4">
                <Link href="/trading/journals">
                    <Button
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                        size="sm"
                        variant="ghost"
                    >
                        <RiArrowLeftLine className="mr-2 h-4 w-4" />
                        Journals
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-argesta font-bold text-3xl text-white">
                        Global Dashboard
                    </h1>
                    <p className="text-white/60">
                        Overview of all your statistics. Select journals to
                        filter.
                    </p>
                </div>
            </div>

            <JournalFilter journals={journals} />

            {stats && <GlobalTradingStats className="mb-8" stats={stats} />}

            {/* Charts */}
            {stats && sessions && trades && (
                <div className="mb-8">
                    <Card className="border border-white/10 bg-black/20">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Performance Charts
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Visual analysis of your overall performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlobalTradingCharts
                                sessions={sessions}
                                trades={trades}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <DiscordWelcomeChecker />
        </div>
    );
}
