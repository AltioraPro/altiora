"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceDot
} from "recharts";

interface TradingChartsProps {
  stats: {
    totalTrades: number;
    closedTrades: number;
    totalPnL: string | number;
    avgPnL: string | number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    tradesBySymbol: Array<{
      symbol: string;
      count: number;
      totalPnL: string | null;
    }>;
    tradesBySetup: Array<{
      setupId: string | null;
      count: number;
      totalPnL: string | null;
    }>;
    tpTrades: number;
    beTrades: number;
    slTrades: number;
  };
  sessions?: Array<{
    id: string;
    name: string;
  }>;
  trades?: Array<{
    id: string;
    tradeDate: string;
    profitLossPercentage: string | null;
    sessionId: string | null;
  }>;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export function TradingCharts({ stats, sessions, trades }: TradingChartsProps) {
  const winRateData = [
    { name: 'Winners', value: stats.winningTrades, color: '#ffffff', percentage: stats.winRate },
    { name: 'Losers', value: stats.losingTrades, color: '#404040', percentage: 100 - stats.winRate }
  ];

  const sessionPerformanceData = (() => {
    if (!trades || !sessions) return [];

    const sessionStats = new Map<string, {
      name: string;
      totalPnL: number;
      count: number;
      winningTrades: number;
    }>();

    trades.forEach(trade => {
      if (trade.sessionId) {
        const session = sessions.find(s => s.id === trade.sessionId);
        if (session) {
          const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
          const existing = sessionStats.get(trade.sessionId);

          if (existing) {
            existing.totalPnL += pnl;
            existing.count += 1;
            if (pnl > 0) {
              existing.winningTrades += 1;
            }
          } else {
            sessionStats.set(trade.sessionId, {
              name: session.name,
              totalPnL: pnl,
              count: 1,
              winningTrades: pnl > 0 ? 1 : 0
            });
          }
        }
      }
    });

    return Array.from(sessionStats.values())
      .map((item, index) => ({
        name: item.name,
        pnl: item.totalPnL,
        count: item.count,
        winRate: item.count > 0 ? (item.winningTrades / item.count) * 100 : 0,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.pnl - a.pnl);
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

  const totalPerformance = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1]?.cumulative : 0;
  const isPositive = totalPerformance >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-white/20 bg-gradient-to-br from-black/40 to-black/6  0 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white  tracking-wide">WIN RATE</CardTitle>
            <CardDescription className="text-white/70 ">
              Performance distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    <linearGradient id="winnerGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="loserGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#404040" stopOpacity={1} />
                      <stop offset="100%" stopColor="#404040" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={winRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={1}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {winRateData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color === '#ffffff' ? 'url(#winnerGradient)' : 'url(#loserGradient)'}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${name === 'Winners' ? stats.winRate.toFixed(1) : (100 - stats.winRate).toFixed(1)}%`,
                      name
                    ]}
                    labelFormatter={(label: string) => label}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white  tracking-wide">
                    {stats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/70  tracking-wide">WIN RATE</div>
                  <div className="text-xs text-white/50  mt-1">
                    {stats.winningTrades}W • {stats.losingTrades}L
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-xs text-white/70  tracking-wide">Winners</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <span className="text-xs text-white/70  tracking-wide">Losers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white  tracking-wide">PERFORMANCE BY SESSION</CardTitle>
            <CardDescription className="text-white/70 ">
              Performance by trading session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[200px] pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionPerformanceData} margin={{ right: 20 }}>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </linearGradient>
                    ))}
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
                  <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                    {sessionPerformanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? `url(#barGradient${index % COLORS.length})` : "#ef4444"}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white  tracking-wide">CUMULATIVE PERFORMANCE</CardTitle>
          <CardDescription className="text-white/70">
            Performance evolution over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="w-full h-[250px] pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ right: 20 }}>
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#10B981" : "#ef4444"} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={isPositive ? "#10B981" : "#ef4444"} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="tradeNumber"
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                    tickFormatter={(value) => value % 5 === 0 ? value : ''}
                  />
                  <YAxis
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    fontSize={10}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      'Cumulative PnL'
                    ]}
                    labelFormatter={(label: string) => `Trade #${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={isPositive ? "#10B981" : "#ef4444"}
                    fill="url(#performanceGradient)"
                    strokeWidth={3}
                    dot={false}
                  />
                  {cumulativeData.length > 0 && (
                    <ReferenceDot
                      x={cumulativeData.length}
                      y={totalPerformance}
                      r={6}
                      fill={isPositive ? "#10B981" : "#ef4444"}
                      stroke={isPositive ? "#10B981" : "#ef4444"}
                      strokeWidth={2}
                      style={{
                        filter: isPositive
                          ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 16px rgba(16, 185, 129, 0.3))'
                          : 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 16px rgba(239, 68, 68, 0.3))',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/70  tracking-wide">TOTAL PERFORMANCE</div>
                <div className="text-2xl font-bold text-white ">
                  {totalPerformance.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70  tracking-wide">TRADES</div>
                <div className="text-2xl font-bold text-white text-center ">
                  {cumulativeData.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 