import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
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
        <div>
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
