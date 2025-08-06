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
    <div className="space-y-4 mb-4">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Performance</CardTitle>
            <TrendingUp className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600">
              P&L total
            </p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Winrate</CardTitle>
            <Target className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold">{stats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              {stats.winningTrades}/{stats.losingTrades}
            </p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Trades</CardTitle>
            <BarChart3 className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-gray-600">
              {stats.closedTrades} fermés
            </p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Profit Factor</CardTitle>
            <Activity className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold">{profitFactor.toFixed(2)}</div>
            <p className="text-xs text-gray-600">
              Ratio gain/perte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de sortie */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">TP</CardTitle>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold text-green-600">{stats.tpTrades}</div>
            <p className="text-xs text-gray-600">
              Take Profit
            </p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">BE</CardTitle>
            <MinusCircle className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold text-gray-600">{stats.beTrades}</div>
            <p className="text-xs text-gray-600">
              Break Even
            </p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0 pt-0">
            <CardTitle className="text-xs font-medium">SL</CardTitle>
            <XCircle className="h-3 w-3 text-red-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-lg font-bold text-red-600">{stats.slTrades}</div>
            <p className="text-xs text-gray-600">
              Stop Loss
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 