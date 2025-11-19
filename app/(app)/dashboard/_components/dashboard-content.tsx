import { useSuspenseQuery } from "@tanstack/react-query";
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
import { orpc } from "@/orpc/client";

export function DashboardContent() {
    const { data: stats } = useSuspenseQuery(
        orpc.trading.getStats.queryOptions({ input: {} })
    );

    const { data: sessions } = useSuspenseQuery(
        orpc.trading.getSessions.queryOptions({ input: {} })
    );

    const { data: trades } = useSuspenseQuery(
        orpc.trading.getTrades.queryOptions({ input: {} })
    );

    return (
        <>
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
        </>
    );
}
