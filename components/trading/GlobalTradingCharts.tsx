"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface GlobalTradingChartsProps {
  sessions?: Array<{ id: string; name: string }>;
  trades?: Array<{
    id: string;
    tradeDate: string;
    profitLossPercentage: string | null;
    sessionId: string | null;
  }>;
}

export function GlobalTradingCharts({ trades }: GlobalTradingChartsProps) {
      // Monthly performance (sum of PnL per month)
  const monthlyPerformanceData = (() => {
    if (!trades) return [];
      const monthStats = new Map<string, { key: string; label: string; totalPnL: number }>();
    trades.forEach((trade) => {
      const date = new Date(trade.tradeDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const label = `${date.toLocaleString('en-US', { month: 'short' })}. ${String(year).slice(-2)}`;
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      const existing = monthStats.get(key);
      if (existing) existing.totalPnL += pnl; else monthStats.set(key, { key, label, totalPnL: pnl });
    });
    return Array.from(monthStats.values())
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .map((item) => ({ name: item.label, pnl: item.totalPnL }));
  })();

  // Cumulative performance
  const cumulativeData = trades
    ?.sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime())
    .reduce((acc, trade, index) => {
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      const previousCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      
      // Calcul simple : addition des pourcentages PnL
      const cumulative = previousCumulative + pnl;
      
      acc.push({
        date: new Date(trade.tradeDate).toLocaleDateString('en-US'),
        pnl: pnl,
        cumulative: cumulative,
        tradeNumber: index + 1
      });
      return acc;
    }, [] as Array<{ date: string; pnl: number; cumulative: number; tradeNumber: number }>) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Performance */}
        <Card className="border border-white/10 bg-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white font-argesta">Cumulative Performance (%)</CardTitle>
            <CardDescription className="text-white/60">Performance evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis dataKey="tradeNumber" stroke="#ffffff" strokeOpacity={0.6} fontSize={10} />
                <YAxis stroke="#ffffff" strokeOpacity={0.6} fontSize={10} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [ `${value.toFixed(2)}%`, name === 'cumulative' ? 'Cumulative PnL' : 'Trade PnL' ]}
                  labelFormatter={(label: string) => `Trade #${label}`}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#ffffff" fill="#ffffff" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="border border-white/10 bg-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Monthly Performance</CardTitle>
            <CardDescription className="text-white/60">Sum of PnL per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#ffffff" strokeOpacity={0.6} fontSize={10} height={30} />
                <YAxis stroke="#ffffff" strokeOpacity={0.6} fontSize={10} tickFormatter={(value) => `${value}%`} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  formatter={(value: number) => [ `${value}%`, 'Total PnL' ]}
                  labelFormatter={(label: string) => label}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]} fill="#ffffff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


