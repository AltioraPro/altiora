"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  Cell
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
  const monthlyPerformanceData = (() => {
    if (!trades) return [];
    const monthStats = new Map<string, {
      key: string;
      label: string;
      totalPnL: number;
      count: number;
      winningTrades: number;
    }>();
    trades.forEach((trade) => {
      const date = new Date(trade.tradeDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const label = `${date.toLocaleString('en-US', { month: 'short' })}. ${String(year).slice(-2)}`;
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      const existing = monthStats.get(key);

      if (existing) {
        existing.totalPnL += pnl;
        existing.count += 1;
        if (pnl > 0) {
          existing.winningTrades += 1;
        }
      } else {
        monthStats.set(key, {
          key,
          label,
          totalPnL: pnl,
          count: 1,
          winningTrades: pnl > 0 ? 1 : 0
        });
      }
    });
    return Array.from(monthStats.values())
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .map((item) => ({
        name: item.label,
        pnl: item.totalPnL,
        count: item.count,
        winRate: item.count > 0 ? (item.winningTrades / item.count) * 100 : 0
      }));
  })();


  const cumulativeData = trades
    ?.sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime())
    .reduce((acc, trade, index) => {
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      const previousCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;


      const cumulative = previousCumulative + pnl;

      acc.push({
        date: new Date(trade.tradeDate).toLocaleDateString('en-US'),
        pnl: pnl,
        cumulative: cumulative,
        tradeNumber: index + 1
      });
      return acc;
    }, [] as Array<{ date: string; pnl: number; cumulative: number; tradeNumber: number }>) || [];

  const finalCumulative = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1]?.cumulative : 0;
  const isPositive = finalCumulative >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Performance */}
        <Card className="border border-white/10 bg-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white ">Cumulative Performance (%)</CardTitle>
            <CardDescription className="text-white/60">Performance evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="global-cumulative-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis
                    dataKey="tradeNumber"
                    tickLine={false}
                    axisLine={false}
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    fill="url(#global-cumulative-gradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card className="border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white  tracking-wide">MONTHLY PERFORMANCE</CardTitle>
            <CardDescription className="text-white/70 ">
              Performance by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformanceData} margin={{ right: 20 }}>
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    fontSize={10}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-black/85 border border-white/20 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-medium mb-1">{label}</p>
                            <p className="text-white text-sm">
                              PnL: <span className="font-semibold">{data.pnl.toFixed(1)}%</span>
                            </p>
                            <p className="text-white text-sm">
                              Win Rate: <span className="font-semibold">{data.winRate.toFixed(1)}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 4, 4]} stroke="rgba(255,255,255,0.1)" strokeWidth={1}>
                    {monthlyPerformanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#10B981" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


