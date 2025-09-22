"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { Plus, ArrowLeft, BarChart3, Upload } from "lucide-react";
import { CreateTradeModal } from "@/components/trading/CreateTradeModal";
import { ImportTradesModal } from "@/components/trading/ImportTradesModal";
import { TradingStats } from "@/components/trading/TradingStats";
import { TradingCharts } from "@/components/trading/TradingCharts";
import { TradesTable } from "@/components/trading/TradesTable";
import { AssetsManager } from "@/components/trading/AssetsManager";
import { SessionsManager } from "@/components/trading/SessionsManager";
import { SetupsManager } from "@/components/trading/SetupsManager";
import { DateFilter, type DateFilterState } from "@/components/trading/DateFilter";
import { AdvancedFilters } from "@/components/trading/AdvancedFilters";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function JournalParamSync({ onFound }: { onFound: (journalId: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const journalFromUrl = searchParams.get("journalId") || searchParams.get("journal");
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
  const [activeTab, setActiveTab] = useState<'trades' | 'assets' | 'sessions' | 'setups'>('trades');
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ 
    view: 'all'
  });
  const [advancedFilters, setAdvancedFilters] = useState<{
    sessions: string[];
    setups: string[];
    assets: string[];
  }>({ sessions: [], setups: [], assets: [] });

  // Fonction pour filtrer les trades par date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterTradesByDate = (trades: any[] | undefined) => {
    if (!trades || dateFilter.view === 'all') return trades;
    
    return trades.filter(trade => {
      const tradeDate = new Date(trade.tradeDate);
      
      switch (dateFilter.view) {
        case 'monthly':
          if (!dateFilter.month || !dateFilter.year) return true;
          const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ];
          const monthIndex = monthNames.indexOf(dateFilter.month);
          return tradeDate.getFullYear() === parseInt(dateFilter.year) && 
                tradeDate.getMonth() === monthIndex;
                
        case 'yearly':
          if (!dateFilter.year) return true;
          return tradeDate.getFullYear() === parseInt(dateFilter.year);
          
        default:
          return true;
      }
    });
  };

  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();
  
  const selectedJournal = journals?.find(j => j.id === selectedJournalId);
  
  const { data: allTrades } = api.trading.getTrades.useQuery(
    { 
      journalId: selectedJournalId || undefined,
      sessionIds: advancedFilters.sessions.length > 0 ? advancedFilters.sessions : undefined,
      setupIds: advancedFilters.setups.length > 0 ? advancedFilters.setups : undefined,
      assetIds: advancedFilters.assets.length > 0 ? advancedFilters.assets : undefined,
    },
    { enabled: !!selectedJournalId }
  );
  
  const filteredTrades = allTrades ? filterTradesByDate(allTrades) : undefined;
  
  // Utiliser les statistiques du backend avec les filtres avancés
  const { data: backendStats } = api.trading.getStats.useQuery(
    {
      journalId: selectedJournalId || undefined,
      sessionIds: advancedFilters.sessions.length > 0 ? advancedFilters.sessions : undefined,
      setupIds: advancedFilters.setups.length > 0 ? advancedFilters.setups : undefined,
      assetIds: advancedFilters.assets.length > 0 ? advancedFilters.assets : undefined,
    },
    { enabled: !!selectedJournalId }
  );

  const stats = backendStats || (filteredTrades && filteredTrades.length > 0 ? {
    totalTrades: filteredTrades.length,
    closedTrades: filteredTrades.length,
    winningTrades: filteredTrades.filter(t => Number(t.profitLossPercentage || 0) > 0).length,
    losingTrades: filteredTrades.filter(t => Number(t.profitLossPercentage || 0) < 0).length,
    winRate: filteredTrades && filteredTrades.length > 0 ? 
      (filteredTrades.filter(t => Number(t.profitLossPercentage || 0) > 0).length / filteredTrades.length) * 100 : 0,
    totalPnL: filteredTrades ? filteredTrades.reduce((sum, t) => sum + Number(t.profitLossPercentage || 0), 0) : 0,
    avgPnL: filteredTrades && filteredTrades.length > 0 ? 
      filteredTrades.reduce((sum, t) => sum + Number(t.profitLossPercentage || 0), 0) / filteredTrades.length : 0,
    totalAmountPnL: (() => {
      if (!filteredTrades) return 0;
      
      if (selectedJournal?.usePercentageCalculation && selectedJournal?.startingCapital) {
        const totalPnLPercentage = filteredTrades.reduce((sum, t) => sum + Number(t.profitLossPercentage || 0), 0);
        const startingCapital = parseFloat(selectedJournal.startingCapital);
        return (totalPnLPercentage / 100) * startingCapital;
      }
      
      return filteredTrades.reduce((sum, t) => sum + Number(t.profitLossAmount || 0), 0);
    })(),
    tradesBySymbol: [],
    tradesBySetup: [],
    tpTrades: filteredTrades.filter(t => t.exitReason === 'TP').length,
    beTrades: filteredTrades.filter(t => t.exitReason === 'BE').length,
    slTrades: filteredTrades.filter(t => t.exitReason === 'SL').length,
    journal: selectedJournal ? {
      usePercentageCalculation: selectedJournal.usePercentageCalculation,
      startingCapital: selectedJournal.startingCapital || undefined
    } : undefined
  } : null);
  const { data: sessions } = api.trading.getSessions.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );
  const { data: setups } = api.trading.getSetups.useQuery(
    { journalId: selectedJournalId || undefined },
    { enabled: !!selectedJournalId }
  );

  const createJournalMutation = api.trading.createJournal.useMutation({
    onSuccess: () => {
    },
  });

  

  const handleJournalFound = useCallback((journalId: string) => {
    setSelectedJournalId(journalId);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const journalFromUrl = urlParams.get('journalId') || urlParams.get('journal');
    
    if (!selectedJournalId && !journalFromUrl && journals && journals.length > 0) {
      setSelectedJournalId(journals[0].id);
    }
  }, [journals, selectedJournalId]);

  const handleCreateDefaultJournal = async () => {
    if (!session?.user?.id) return;

    try {
      await createJournalMutation.mutateAsync({
        name: "Main Journal",
        description: "My main trading journal",
      });
    } catch (error) {
      console.error("Error creating journal:", error);
    }
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
            <h1 className="text-3xl font-argesta text-white">
              {selectedJournal ? selectedJournal.name : "Trading Dashboard"}
            </h1>
            <p className="text-white/60">
              {selectedJournal ? selectedJournal.description || "Performance analytics & trade management" : "Performance analytics & trade management"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DateFilter onFilterChange={setDateFilter} />
          {selectedJournalId && (
            <AdvancedFilters 
              journalId={selectedJournalId}
              onFiltersChange={setAdvancedFilters}
            />
          )}
        </div>
        
                <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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

      {/* Journal URL Sync */}
      <JournalParamSync onFound={handleJournalFound} />

      {/* Statistics */}
      {stats && (
        <div className="mb-8">
          <TradingStats stats={stats} />
        </div>
      )}

      {/* Tabs Navigation */}
      {selectedJournalId && (
        <div className="mb-6">
          <div className="flex space-x-1 bg-black/20 p-1 rounded-lg border border-white/10">
            {[
              { id: 'trades', label: 'Trades', icon: BarChart3 },
              { id: 'assets', label: 'Assets', icon: Plus },
              { id: 'sessions', label: 'Sessions', icon: Plus },
              { id: 'setups', label: 'Setups', icon: Plus }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'trades' | 'assets' | 'sessions' | 'setups')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && sessions && filteredTrades && setups && activeTab === 'trades' && (
        <div className="mb-8">
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="font-argesta text-white">Performance Charts</CardTitle>
              <CardDescription className="text-white/60">
                Visual analysis of your trading performance
                {dateFilter.view !== 'all' && filteredTrades && ` (${filteredTrades.length} trades)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TradingCharts 
                stats={stats} 
                sessions={sessions} 
                trades={filteredTrades || []}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content based on active tab */}
      {selectedJournalId && (
        <>
          {activeTab === 'trades' && (
            <TradesTable 
              journalId={selectedJournalId}
            />
          )}
          
          {activeTab === 'assets' && (
            <AssetsManager journalId={selectedJournalId} />
          )}
          
          {activeTab === 'sessions' && (
            <SessionsManager journalId={selectedJournalId} />
          )}
          
          {activeTab === 'setups' && (
            <SetupsManager journalId={selectedJournalId} />
          )}
        </>
      )}

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