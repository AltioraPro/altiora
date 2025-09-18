"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, Edit, Trash2, ExternalLink } from "lucide-react";
import { api } from "@/trpc/client";

interface JournalPerformanceCardProps {
  journal: {
    id: string;
    name: string;
    description: string | null;
    order: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function JournalPerformanceCard({ journal, onEdit, onDelete }: JournalPerformanceCardProps) {
  const { data: stats } = api.trading.getStats.useQuery(
    { journalId: journal.id },
    { enabled: !!journal.id }
  );

  const { data: allTrades } = api.trading.getTrades.useQuery(
    { 
      journalId: journal.id
      // Récupérer tous les trades pour trouver le vrai meilleur
    },
    { enabled: !!journal.id }
  );

  // Trouver le meilleur trade (le plus haut pourcentage, positif ou négatif)
  const bestTrade = allTrades && allTrades.length > 0 
    ? allTrades.reduce((best, current) => {
        const currentPnl = Number(current.profitLossPercentage || 0);
        const bestPnl = Number(best.profitLossPercentage || 0);
        return currentPnl > bestPnl ? current : best;
      })
    : null;

  return (
    <Card className="border border-white/10 bg-black/20 hover:border-white/20 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg font-argesta text-white line-clamp-1">{journal.name}</CardTitle>
            </div>
            <CardDescription className="text-white/60 line-clamp-2">
              {journal.description || "No description"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Métriques principales */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
              <div className={`text-xl font-bold ${Number(stats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(stats.totalPnL) >= 0 ? '+' : ''}{Number(stats.totalPnL).toFixed(2)}%
              </div>
              <div className="text-xs text-white/60">Performance</div>
            </div>
            <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="text-xl text-green-400">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-white/60">Win Rate</div>
            </div>
            <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="text-xl text-white">
                {stats.totalTrades}
              </div>
              <div className="text-xs text-white/60">Total</div>
            </div>
          </div>
        )}

        {/* Best trade */}
        {bestTrade && (
          <div className={`mb-4 p-3 rounded-lg border ${
            Number(bestTrade.profitLossPercentage || 0) >= 0 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className={`w-4 h-4 ${
                  Number(bestTrade.profitLossPercentage || 0) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`} />
                <span className={`text-sm ${
                  Number(bestTrade.profitLossPercentage || 0) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  Best trade
                </span>
              </div>
              <Badge className={`${
                Number(bestTrade.profitLossPercentage || 0) >= 0 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {Number(bestTrade.profitLossPercentage || 0) >= 0 ? '+' : ''}{bestTrade.profitLossPercentage}%
              </Badge>
            </div>
            <div className="mt-1 text-sm text-white/80">
              {bestTrade.symbol} • {new Date(bestTrade.tradeDate).toLocaleDateString('en-US')}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-1">
            {/* Order indicator */}
            <span className="text-xs text-white/40">
              #{journal.order + 1}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <a href={`/trading?journalId=${journal.id}`}>
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-gray-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 