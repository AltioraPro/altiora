"use client";

import { Card } from "@/components/ui/card";

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

  // Calculate total gains and total losses separately
  const totalGains = stats.winningTrades > 0 ? totalPnL : 0;
  const totalLosses = stats.losingTrades > 0 ? Math.abs(totalPnL) : 0;
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : 0;

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Performance</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? "+" : ""}
              {totalPnL.toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Win Rate</div>
            <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Trades</div>
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-5 hover:bg-black/30 transition-colors">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Profit Factor</div>
            <div className="text-2xl font-bold text-white">{profitFactor.toFixed(2)}</div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition-colors">
          <div className="space-y-1">
            <div className="text-xs text-white/60">Avg Gain</div>
            <div className="text-lg font-semibold text-white">{avgWin.toFixed(1)}%</div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition-colors">
          <div className="space-y-1">
            <div className="text-xs text-white/60">Avg Loss</div>
            <div className="text-lg font-semibold text-white">{avgLoss.toFixed(1)}%</div>
          </div>
        </Card>

        <Card className="border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition-colors">
          <div className="space-y-1">
            <div className="text-xs text-white/60">Avg P&L</div>
            <div className="text-lg font-semibold text-white">{avgPnL.toFixed(1)}%</div>
          </div>
        </Card>
      </div>

      {/* Exit Strategy */}
      <div className="flex justify-center">
        <Card className="border border-white/10 bg-black/20 p-2 hover:bg-black/30 transition-colors w-fit">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-green-400/60">TP</div>
              <div className="text-lg font-bold text-green-400">{stats.tpTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-white/40">BE</div>
              <div className="text-lg font-bold text-white">{stats.beTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-red-400/60">SL</div>
              <div className="text-lg font-bold text-red-400">{stats.slTrades}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}