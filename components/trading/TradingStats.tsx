"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  BarChart3,
  Activity
} from "lucide-react";

interface TradingStatsProps {
  stats: {
    totalTrades: number;
    closedTrades: number;
    totalPnL: string | number;
    avgPnL: string | number;
    totalAmountPnL?: number;
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
    journal?: {
      usePercentageCalculation?: boolean;
      startingCapital?: string;
    };
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
    <div className="space-y-8">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-white/10 bg-black/20 p-6 hover:bg-black/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0 pt-0">
            <CardTitle className="text-sm font-medium text-white/90">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-2">
            <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}%
            </div>
            {stats.totalAmountPnL !== undefined && stats.journal?.usePercentageCalculation && (
              <div className={`text-lg font-semibold ${Number(stats.totalAmountPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(stats.totalAmountPnL) >= 0 ? '+' : ''}{Number(stats.totalAmountPnL).toFixed(2)}€
              </div>
            )}
            <p className="text-sm text-white/60">
              {stats.journal?.usePercentageCalculation ? 'Total Realized P&L' : 'Total P&L'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-6 hover:bg-black/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0 pt-0">
            <CardTitle className="text-sm font-medium text-white/90">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-2">
            <div className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <p className="text-sm text-white/60">
              {stats.winningTrades}/{stats.totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-6 hover:bg-black/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0 pt-0">
            <CardTitle className="text-sm font-medium text-white/90">Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-2">
            <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
            <p className="text-sm text-white/60">
              {stats.closedTrades} closed
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-6 hover:bg-black/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0 pt-0">
            <CardTitle className="text-sm font-medium text-white/90">Profit Factor</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-2">
            <div className="text-3xl font-bold text-white">{profitFactor.toFixed(2)}</div>
            <p className="text-sm text-white/60">
              Win/loss ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exit Strategy */}
      <div className="flex justify-center">
        <Card className="border border-white/10 bg-black/20 p-2 hover:bg-black/30 transition-colors w-fit">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-green-400/60">TP</div>
              <div className="text-xs font-medium text-green-400/80">{stats.tpTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40">BE</div>
              <div className="text-xs font-medium text-white/60">{stats.beTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-red-400/60">SL</div>
              <div className="text-xs font-medium text-red-400/80">{stats.slTrades}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 