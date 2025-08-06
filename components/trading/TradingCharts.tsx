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

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function TradingCharts({ stats, setups, trades }: TradingChartsProps) {
  // Données pour le graphique en donut du win rate
  const winRateData = [
    { name: 'Gagnants', value: stats.winningTrades, color: '#8b5cf6', percentage: stats.winRate },
    { name: 'Perdants', value: stats.losingTrades, color: '#374151', percentage: 100 - stats.winRate }
  ];

  // Données pour le graphique des performances par session
  const sessionPerformanceData = stats.tradesBySetup
    .filter(item => item.setupId) // Filtrer les valeurs null
    .map((item, index) => {
      const setup = setups?.find(s => s.id === item.setupId);
      const pnl = item.totalPnL ? parseFloat(item.totalPnL) || 0 : 0;
      return {
        name: setup?.name || 'Non défini',
        pnl: pnl,
        count: item.count,
        color: COLORS[index % COLORS.length]
      };
    })
    .sort((a, b) => b.pnl - a.pnl); // Trier par performance décroissante

  // Données pour le graphique des performances cumulatives
  const cumulativeData = trades
    ?.sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime())
    .reduce((acc, trade, index) => {
      const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
      const previousCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      const cumulative = previousCumulative + pnl;
      
      acc.push({
        date: new Date(trade.tradeDate).toLocaleDateString('fr-FR'),
        pnl: pnl,
        cumulative: cumulative,
        tradeNumber: index + 1
      });
      
      return acc;
    }, [] as Array<{ date: string; pnl: number; cumulative: number; tradeNumber: number }>) || [];

  return (
    <div className="space-y-4 mb-4">
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Win Rate Donut Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Win Rate</CardTitle>
            <CardDescription className="text-xs">
              Répartition des trades gagnants vs perdants
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
                    formatter={(value: number, name: string, props: any) => [
                      `${(props.payload?.percentage || 0).toFixed(1)}%`, 
                      name
                    ]}
                    labelFormatter={(label: string) => label}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pure-black">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">Win rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance par Session */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance par Session</CardTitle>
            <CardDescription className="text-xs">
              Performance par session de trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9ca3af"
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
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Bar dataKey="pnl" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Cumulative */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Cumulative</CardTitle>
          <CardDescription className="text-xs">
            Évolution de la performance au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="tradeNumber" 
                stroke="#9ca3af"
                fontSize={10}
                label={{ value: 'Numéro de trade', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={10}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
                label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`, 
                  name === 'cumulative' ? 'PnL Cumulatif' : 'PnL Trade'
                ]}
                labelFormatter={(label: string) => `Trade #${label}`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 