"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Activity,
  CheckCircle,
  XCircle,
  MinusCircle
} from "lucide-react";

interface TradingStatsProps {
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
    // Nouvelles métriques
    tpTrades: number;
    beTrades: number;
    slTrades: number;
  };
  setups?: Array<{
    id: string;
    name: string;
  }>;
}

export function TradingStats({ stats }: TradingStatsProps) {
  const totalPnL = typeof stats.totalPnL === 'string' ? parseFloat(stats.totalPnL) || 0 : stats.totalPnL;
  const avgWin = stats.winningTrades > 0 ? totalPnL / stats.winningTrades : 0;
  const avgLoss = stats.losingTrades > 0 ? Math.abs(totalPnL) / stats.losingTrades : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}%
            </div>
            <p className="text-sm text-white/60">
              Total P&L
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <p className="text-sm text-white/60">
              {stats.winningTrades}/{stats.totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
            <p className="text-sm text-white/60">
              {stats.closedTrades} closed
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Profit Factor</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{profitFactor.toFixed(2)}</div>
            <p className="text-sm text-white/60">
              Win/loss ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de sortie */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Take Profit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-green-400">{stats.tpTrades}</div>
            <p className="text-sm text-white/60">
              TP trades
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Break Even</CardTitle>
            <MinusCircle className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.beTrades}</div>
            <p className="text-sm text-white/60">
              BE trades
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Stop Loss</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-red-400">{stats.slTrades}</div>
            <p className="text-sm text-white/60">
              SL trades
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 