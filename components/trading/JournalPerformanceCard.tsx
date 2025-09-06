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
    isDefault: boolean;
    order: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function JournalPerformanceCard({ journal, onEdit, onDelete }: JournalPerformanceCardProps) {
  const { data: stats } = api.trading.getStats.useQuery(
    { journalId: journal.id },
    { enabled: !!journal.id }
  );

  const { data: recentTrades } = api.trading.getTrades.useQuery(
    { 
      journalId: journal.id,
      limit: 5,
      offset: 0
    },
    { enabled: !!journal.id }
  );

  const winningTrades = recentTrades?.filter(trade => 
    Number(trade.profitLossPercentage || 0) > 0
  ) || [];

  const bestTrade = winningTrades.length > 0 
    ? winningTrades.reduce((best, current) => 
        Number(current.profitLossPercentage || 0) > Number(best.profitLossPercentage || 0) ? current : best
      )
    : null;

  return (
    <Card className="border border-white/10 bg-black/20 hover:border-white/20 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg font-argesta text-white line-clamp-1">{journal.name}</CardTitle>
              {journal.isDefault && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
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
            <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="text-xl text-blue-400">
                {stats.winningTrades}
              </div>
              <div className="text-xs text-white/60">Wins</div>
            </div>
          </div>
        )}

        {/* Best trade */}
        {bestTrade && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Best trade</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                +{bestTrade.profitLossPercentage}%
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
            <a href={`/trading?journal=${journal.id}`}>
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