"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { Plus, ArrowLeft, Edit, BarChart3, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { CreateTradeModal } from "@/components/trading/CreateTradeModal";
import { ImportTradesModal } from "@/components/trading/ImportTradesModal";
import { TradingStats } from "@/components/trading/TradingStats";
import { TradingCharts } from "@/components/trading/TradingCharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function JournalParamSync({ onFound }: { onFound: (journalId: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const journalFromUrl = searchParams.get("journal");
    if (journalFromUrl) {
      onFound(journalFromUrl);
    }
  }, [searchParams, onFound]);
  return null;
}

export default function TradingPage() {
  const { data: session } = useSession();
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Queries
  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();
  const { data: stats } = api.trading.getStats.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );
  const { data: recentTrades } = api.trading.getTrades.useQuery(
    { 
      journalId: selectedJournalId || undefined,
      limit: 5,
      offset: 0
    },
    { enabled: !!selectedJournalId }
  );
  const { data: allTrades } = api.trading.getTrades.useQuery(
    { 
      journalId: selectedJournalId || undefined,
      limit: 100,
      offset: 0
    },
    { enabled: !!selectedJournalId }
  );
  const { data: sessions } = api.trading.getSessions.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );
  const { data: setups } = api.trading.getSetups.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );
  const { data: assets } = api.trading.getAssets.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );

  // Mutations
  const createJournalMutation = api.trading.createJournal.useMutation({
    onSuccess: () => {
      // Refetch journals
    },
  });

  const deleteTradeMutation = api.trading.deleteTrade.useMutation({
    onSuccess: () => {
      // Refetch trades
    },
  });

  // Handle journal selection from URL params or default
  const handleJournalFound = useCallback((journalId: string) => {
    setSelectedJournalId(journalId);
  }, []);

  // Set first journal when loaded only if no journal is selected
  useEffect(() => {
    if (!selectedJournalId && journals && journals.length > 0) {
      setSelectedJournalId(journals[0].id);
    }
  }, [journals, selectedJournalId]);

  const handleCreateDefaultJournal = async () => {
    if (!session?.user?.id) return;

    try {
      await createJournalMutation.mutateAsync({
        name: "Main Journal",
        description: "My main trading journal",
        isDefault: true,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };



  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade? This action is irreversible.")) {
      try {
        await deleteTradeMutation.mutateAsync({ id: tradeId });
      } catch (error) {
        console.error("Error deleting trade:", error);
      }
    }
  };

  const handleEditTrade = (tradeId: string) => {
    // TODO: Implement edit trade functionality
    console.log("Edit trade:", tradeId);
  };

  if (journalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-argesta text-white mb-4">Trading Dashboard</h1>
            <p className="text-white/60">
              Start your trading journey by creating your first journal
            </p>
          </div>
          
          <Card className="p-8 border border-white/10 bg-black/20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-xl font-argesta text-white mb-4">No Journal Created</h3>
            <p className="text-white/60 mb-8">
              Create your first trading journal to start tracking your performance.
            </p>
            
            <Button 
              onClick={handleCreateDefaultJournal}
              disabled={createJournalMutation.isPending}
              className="bg-white text-black hover:bg-gray-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Journal
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={null}>
        <JournalParamSync onFound={handleJournalFound} />
      </Suspense>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link className="text-pure-black" href="/trading/journals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Journals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-argesta text-white">Trading Dashboard</h1>
            <p className="text-white/60">
              Performance analytics & trade management
            </p>
          </div>
        </div>
        
                <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="border-white/20 text-black hover:bg-white/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      

      {/* Statistics */}
      {stats && (
        <div className="mb-8">
          <TradingStats stats={stats} />
        </div>
      )}

      {/* Charts */}
      {stats && sessions && allTrades && setups && (
        <div className="mb-8">
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="font-argesta text-white">Performance Charts</CardTitle>
              <CardDescription className="text-white/60">
                Visual analysis of your trading performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TradingCharts 
                stats={stats} 
                sessions={sessions} 
                trades={allTrades}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent trades */}
      <Card className="border border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="font-argesta text-white">Recent Trades</CardTitle>
          <CardDescription className="text-white/60">
            Your latest trading activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades && recentTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm text-white/80">DATE</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">ASSET</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">SESSION</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">SETUP</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">RISK</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">PERFORMANCE</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">NOTES</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">CHART</th>
                    <th className="text-left py-3 px-4 text-sm text-white/80">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-white">
                        {format(new Date(trade.tradeDate), 'dd MMM', { locale: enUS })}
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
                        1.00%
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="space-y-1">
                          <span className={`${Number(trade.profitLossPercentage || 0) > 0 ? 'text-green-400' : Number(trade.profitLossPercentage || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {Number(trade.profitLossPercentage || 0) >= 0 ? '+' : ''}{trade.profitLossPercentage || 0}%
                          </span>
                          {trade.profitLossAmount && (
                            <div className={`text-xs ${Number(trade.profitLossAmount || 0) > 0 ? 'text-green-400' : Number(trade.profitLossAmount || 0) < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                              {Number(trade.profitLossAmount || 0) >= 0 ? '+' : ''}{trade.profitLossAmount}€
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {trade.notes || '-'}
                      </td>
                                            <td className="py-3 px-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                          onClick={() => {
                            // Utiliser le lien TradingView spécifique importé depuis l'Excel
                            if (trade.tradingviewLink) {
                              window.open(trade.tradingviewLink, '_blank');
                            } else {
                              // Fallback vers l'URL générique si aucun lien spécifique
                              const symbol = assets?.find(a => a.id === trade.assetId)?.name || trade.symbol || 'EURUSD';
                              const tradingViewUrl = `https://www.tradingview.com/symbols/${symbol.replace('/', '')}`;
                              window.open(tradingViewUrl, '_blank');
                            }
                          }}
                        >
                          Chart
                        </Button>
                      </td>
                                            <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEditTrade(trade.id)}
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTrade(trade.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-argesta text-white mb-2">No Trades Found</h3>
              <p className="text-white/60 mb-6">
                Start your trading journey by adding your first trade
              </p>
              
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-black hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Trade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateTradeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        journalId={selectedJournalId || undefined}
      />

      <ImportTradesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        journalId={selectedJournalId || undefined}
      />

      
    </div>
  );
} 