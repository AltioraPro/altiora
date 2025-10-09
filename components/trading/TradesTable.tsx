"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { EditTradeModal } from "./EditTradeModal";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface TradesTableProps {
  journalId: string;
}

export function TradesTable({ journalId }: TradesTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;

  const { data: trades, isLoading } = api.trading.getTrades.useQuery({
    journalId,
    limit: itemsPerPage,
    offset
  });

  const { data: stats } = api.trading.getStats.useQuery({ journalId });
  const { data: assets } = api.trading.getAssets.useQuery({ journalId });
  const { data: sessions } = api.trading.getSessions.useQuery({ journalId });
  const { data: setups } = api.trading.getSetups.useQuery({ journalId });

  const utils = api.useUtils();
  const deleteTradeMutation = api.trading.deleteTrade.useMutation({
    onSuccess: () => {
      utils.trading.getTrades.invalidate();
      utils.trading.getStats.invalidate();
    },
  });

  const deleteMultipleTradesMutation = api.trading.deleteMultipleTrades.useMutation({
    onSuccess: () => {
      utils.trading.getTrades.invalidate();
      utils.trading.getStats.invalidate();
      setSelectedTrades(new Set());
    },
  });

  const totalTrades = stats?.totalTrades || 0;
  const totalPages = Math.ceil(totalTrades / itemsPerPage);

  const handleSelectTrade = (tradeId: string) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTrades.size === trades?.length) {
      setSelectedTrades(new Set());
    } else {
      const allTradeIds = new Set(trades?.map(trade => trade.id) || []);
      setSelectedTrades(allTradeIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTrades.size === 0) return;

    setIsDeleting(true);
    try {
      await deleteMultipleTradesMutation.mutateAsync({
        tradeIds: Array.from(selectedTrades)
      });
    } catch (error) {
      console.error("Error deleting trades:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (tradeId: string) => {
    try {
      await deleteTradeMutation.mutateAsync({ id: tradeId });
    } catch (error) {
      console.error("Error deleting trade:", error);
    }
  };

  const handleEditTrade = (tradeId: string) => {
    setEditingTradeId(tradeId);
  };

  const getExitReasonBadge = (exitReason: string | null) => {
    switch (exitReason) {
      case "TP":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">TP</Badge>;
      case "BE":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">BE</Badge>;
      case "SL":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">SL</Badge>;
      case "Manual":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Manual</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">-</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">Trades</CardTitle>
          <CardDescription className="text-white/60">Loading trades...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Trades</CardTitle>
              <CardDescription className="text-white/60">
                {totalTrades} trades total • Page {currentPage + 1} of {totalPages}
              </CardDescription>
            </div>
            {selectedTrades.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/60">
                  {selectedTrades.size} selected
                </span>
                <Button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                  className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {trades && trades.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {trades.map((trade) => (
                  <div key={trade.id} className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedTrades.has(trade.id)}
                          onCheckedChange={() => handleSelectTrade(trade.id)}
                          className="border-white/30"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {assets?.find(a => a.id === trade.assetId)?.name || trade.symbol || '-'}
                          </div>
                          <div className="text-xs text-white/60">
                            {format(new Date(trade.tradeDate), 'dd MMM yyyy', { locale: enUS })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleEditTrade(trade.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSingle(trade.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-white/40 text-xs">Session</div>
                        <div className="text-white">{sessions?.find(s => s.id === trade.sessionId)?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Setup</div>
                        <div className="text-white">{setups?.find(s => s.id === trade.setupId)?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Risk</div>
                        <div className="text-white">{trade.riskInput || '-'}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Exit</div>
                        <div>{getExitReasonBadge(trade.exitReason)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="text-sm">
                        <span className={`font-medium ${Number(trade.profitLossPercentage || 0) > 0 ? 'text-green-400' : Number(trade.profitLossPercentage || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                          {Number(trade.profitLossPercentage || 0) >= 0 ? '+' : ''}{trade.profitLossPercentage || 0}%
                        </span>
                        {trade.profitLossAmount && stats?.journal?.usePercentageCalculation && (
                          <span className={`ml-2 text-xs ${Number(trade.profitLossAmount || 0) > 0 ? 'text-green-400' : Number(trade.profitLossAmount || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {Number(trade.profitLossAmount || 0) >= 0 ? '+' : ''}{trade.profitLossAmount}€
                          </span>
                        )}
                      </div>
                      {trade.tradingviewLink && (
                        <a href={trade.tradingviewLink} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">
                        <Checkbox
                          checked={selectedTrades.size === trades.length && trades.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/30"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Date</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Asset</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Session</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Setup</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Risk</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Result</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Exit</th>
                      <th className="text-left py-3 px-4 text-sm text-white/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedTrades.has(trade.id)}
                            onCheckedChange={() => handleSelectTrade(trade.id)}
                            className="border-white/30"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {format(new Date(trade.tradeDate), 'dd MMM yyyy', { locale: enUS })}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {assets?.find(a => a.id === trade.assetId)?.name || trade.symbol || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {sessions?.find(s => s.id === trade.sessionId)?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {setups?.find(s => s.id === trade.setupId)?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {trade.riskInput || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="space-y-1">
                            <span className={`${Number(trade.profitLossPercentage || 0) > 0 ? 'text-green-400' : Number(trade.profitLossPercentage || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                              {Number(trade.profitLossPercentage || 0) >= 0 ? '+' : ''}{trade.profitLossPercentage || 0}%
                            </span>
                            {trade.profitLossAmount && stats?.journal?.usePercentageCalculation && (
                              <div className={`text-xs ${Number(trade.profitLossAmount || 0) > 0 ? 'text-green-400' : Number(trade.profitLossAmount || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                {Number(trade.profitLossAmount || 0) >= 0 ? '+' : ''}{trade.profitLossAmount}€
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {getExitReasonBadge(trade.exitReason)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Button
                              onClick={() => handleEditTrade(trade.id)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteSingle(trade.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {trade.tradingviewLink && (
                              <a href={trade.tradingviewLink} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-white/60">
                    Showing {offset + 1} to {Math.min(offset + itemsPerPage, totalTrades)} of {totalTrades} trades
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={
                              currentPage === pageNum
                                ? "bg-white text-black hover:bg-gray-200"
                                : "border-white/20 bg-transparent text-white hover:bg-white/10"
                            }
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      variant="outline"
                      size="sm"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No trades found</p>
              <p className="text-white/40 text-sm">Start by creating your first trade</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingTradeId && (
        <EditTradeModal
          isOpen={!!editingTradeId}
          onClose={() => setEditingTradeId(null)}
          tradeId={editingTradeId}
          onSuccess={() => {
            setEditingTradeId(null);
            utils.trading.getTrades.invalidate();
            utils.trading.getStats.invalidate();
          }}
        />
      )}
    </>
  );
}
