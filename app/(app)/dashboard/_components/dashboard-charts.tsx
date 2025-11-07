import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface DashboardChartsProps {
    sessions: Array<{ id: string; name: string }>;
    trades: Array<{
        id: string;
        tradeDate: string;
        profitLossPercentage: string | null;
        sessionId: string | null;
    }>;
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
