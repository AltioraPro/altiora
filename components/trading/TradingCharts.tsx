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
  Area
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
  setups?: Array<{
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

const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000'];

export function TradingCharts({ stats, setups, trades }: TradingChartsProps) {
  // Data for win rate donut chart
  const winRateData = [
    { name: 'Winners', value: stats.winningTrades, color: '#ffffff', percentage: stats.winRate },
    { name: 'Losers', value: stats.losingTrades, color: '#666666', percentage: 100 - stats.winRate }
  ];

  // Data for session performance chart
  const sessionPerformanceData = stats.tradesBySetup
          .filter(item => item.setupId) // Filter null values
    .map((item, index) => {
      const setup = setups?.find(s => s.id === item.setupId);
      const pnl = item.totalPnL ? parseFloat(item.totalPnL) || 0 : 0;
      return {
        name: setup?.name || 'Undefined',
        pnl: pnl,
        count: item.count,
        color: COLORS[index % COLORS.length]
      };
    })
    .sort((a, b) => b.pnl - a.pnl); // Sort by decreasing performance

  // Data for cumulative performance chart
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

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win Rate Donut Chart */}
        <Card className="border border-white/10 bg-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Win Rate</CardTitle>
            <CardDescription className="text-white/60">
              Distribution of winning vs losing trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={winRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {winRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${name === 'Winners' ? stats.winRate.toFixed(1) : (100 - stats.winRate).toFixed(1)}%`, 
                      name
                    ]}
                    labelFormatter={(label: string) => label}
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: '1px solid #ffffff',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-white/60">Win rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Session */}
        <Card className="border border-white/10 bg-black/20 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Performance by Session</CardTitle>
            <CardDescription className="text-white/60">
              Performance by trading session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff"
                  strokeOpacity={0.6}
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#ffffff"
                  strokeOpacity={0.6}
                  fontSize={10}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value}%`, 
                    'PnL Total'
                  ]}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: '#000000',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="pnl" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Performance */}
      <Card className="border border-white/10 bg-black/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white font-argesta">Cumulative Performance</CardTitle>
          <CardDescription className="text-white/60">
            Performance evolution over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} />
              <XAxis 
                dataKey="tradeNumber" 
                stroke="#ffffff"
                strokeOpacity={0.6}
                fontSize={10}
                label={{ value: 'Trade number', position: 'insideBottom', offset: -10, fill: '#ffffff', fontSize: 12 }}
              />
              <YAxis 
                stroke="#ffffff"
                strokeOpacity={0.6}
                fontSize={10}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
                label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft', fill: '#ffffff', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`, 
                  name === 'cumulative' ? 'Cumulative PnL' : 'Trade PnL'
                ]}
                labelFormatter={(label: string) => `Trade #${label}`}
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #ffffff',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#ffffff" 
                fill="#ffffff" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 