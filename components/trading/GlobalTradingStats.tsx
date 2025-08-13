"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3, Activity, CheckCircle, XCircle, MinusCircle } from "lucide-react";

interface GlobalTradingStatsProps {
  stats: {
    totalTrades: number;
    closedTrades: number;
    totalPnL: string | number;
    avgPnL: string | number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    tradesBySymbol: Array<{ symbol: string; count: number; totalPnL: string | null }>;
    tradesBySetup: Array<{ setupId: string | null; count: number; totalPnL: string | null }>;
    tpTrades: number;
    beTrades: number;
    slTrades: number;
  };
}

export function GlobalTradingStats({ stats }: GlobalTradingStatsProps) {
  const totalPnL = typeof stats.totalPnL === "string" ? parseFloat(stats.totalPnL) || 0 : stats.totalPnL;
  const avgPnL = typeof stats.avgPnL === "string" ? parseFloat(stats.avgPnL) || 0 : stats.avgPnL;
  const avgWin = stats.winningTrades > 0 ? totalPnL / Math.max(stats.winningTrades, 1) : 0;
  const avgLoss = stats.losingTrades > 0 ? Math.abs(totalPnL) / Math.max(stats.losingTrades, 1) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  return (
    <div className="space-y-6">
      {/* All cards across 2 rows (5 columns from lg) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Total Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}
              {totalPnL.toFixed(2)}%
            </div>
            <p className="text-sm text-white/60">Cumulative PnL</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <p className="text-sm text-white/60">{stats.winningTrades}/{stats.totalTrades} trades</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
            <p className="text-sm text-white/60">{stats.closedTrades} closed</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Avg PnL/Trade</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{avgPnL.toFixed(2)}%</div>
            <p className="text-sm text-white/60">Average per trade</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Profit Factor</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{profitFactor.toFixed(2)}</div>
            <p className="text-sm text-white/60">Win/loss ratio</p>
          </CardContent>
        </Card>

        {/* Ligne 2 */}
        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Average Gain</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-green-400">{avgWin.toFixed(2)}%</div>
            <p className="text-sm text-white/60">Per winning trade</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Average Loss</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-red-400">{avgLoss.toFixed(2)}%</div>
            <p className="text-sm text-white/60">Per losing trade</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Winners (TP)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-green-400">{stats.tpTrades}</div>
            <p className="text-sm text-white/60">TP trades</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Break Even (BE)</CardTitle>
            <MinusCircle className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-white">{stats.beTrades}</div>
            <p className="text-sm text-white/60">BE trades</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm text-white/80">Losers (SL)</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold text-red-400">{stats.slTrades}</div>
            <p className="text-sm text-white/60">SL trades</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


