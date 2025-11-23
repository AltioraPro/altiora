import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { RouterOutput } from "@/orpc/client";

interface DashboardChartsProps {
    sessions: Array<{ id: string; name: string }>;
    trades: RouterOutput["trading"]["getTrades"];
}

export function DashboardCharts({ sessions, trades }: DashboardChartsProps) {
    return (
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
                    <GlobalTradingCharts sessions={sessions} trades={trades} />
                </CardContent>
            </Card>
        </div>
    );
}
