"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CreateTradeModal } from "@/components/trading/CreateTradeModal";
import { TradingStats } from "@/components/trading/TradingStats";
import { TradingCharts } from "@/components/trading/TradingCharts";

export default function TradingPage() {
  const { data: session } = useSession();
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();
  const { data: defaultJournal } = api.trading.getDefaultJournal.useQuery();
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
      limit: 100, // Récupérer les trades pour les graphiques (limite max)
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

  // Mutations
  const createJournalMutation = api.trading.createJournal.useMutation({
    onSuccess: () => {
      // Refetch journals
    },
  });

  // Set default journal when loaded
  useEffect(() => {
    if (defaultJournal && !selectedJournalId) {
      setSelectedJournalId(defaultJournal.id);
    }
  }, [defaultJournal, selectedJournalId]);

  const handleCreateDefaultJournal = async () => {
    if (!session?.user?.id) return;

    try {
      await createJournalMutation.mutateAsync({
        name: "Journal Principal",
        description: "Mon journal de trading principal",
        isDefault: true,
      });
    } catch (error) {
      console.error("Erreur lors de la création du journal:", error);
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
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Journal de Trading</h1>
          <p className="text-gray-600 mb-8">
            Commencez votre journal de trading en créant votre premier journal
          </p>
                     <Button 
             onClick={handleCreateDefaultJournal}
             disabled={createJournalMutation.isPending}
             className="bg-black text-white hover:bg-gray-800"
           >
            <Plus className="w-4 h-4 mr-2" />
            Créer mon premier journal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Journal de Trading</h1>
          <p className="text-gray-600 mt-2">
            Suivez vos performances et analysez vos trades
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Trade
        </Button>
      </div>

      {/* Sélection du journal */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Journal actuel</label>
        <select
          value={selectedJournalId || ""}
          onChange={(e) => setSelectedJournalId(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          {journals.map((journal) => (
            <option key={journal.id} value={journal.id}>
              {journal.name} {journal.isDefault && "(Par défaut)"}
            </option>
          ))}
        </select>
      </div>

      {/* Statistiques */}
      {stats && (
        <TradingStats stats={stats} />
      )}

      {/* Graphiques */}
      {stats && sessions && allTrades && setups && (
        <TradingCharts 
          stats={stats} 
          sessions={sessions} 
          trades={allTrades}
          setups={setups}
        />
      )}

      {/* Trades récents */}
      <Card>
        <CardHeader>
          <CardTitle>Trades récents</CardTitle>
          <CardDescription>
            Vos derniers trades effectués
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades && recentTrades.length > 0 ? (
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                                         <div className={`p-2 rounded-full ${trade.symbol.includes('BUY') ? 'bg-green-100' : 'bg-red-100'}`}>
                       {trade.symbol.includes('BUY') ? (
                         <TrendingUp className="h-4 w-4 text-green-600" />
                       ) : (
                         <TrendingDown className="h-4 w-4 text-red-600" />
                       )}
                     </div>
                    <div>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(trade.tradeDate), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>
                                    <div className="text-right">
                    <div className={`font-medium ${Number(trade.profitLossPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(trade.profitLossPercentage || 0) >= 0 ? '+' : ''}{trade.profitLossPercentage || 0}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Trade {trade.isClosed ? 'fermé' : 'ouvert'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trade.isClosed ? "default" : "secondary"}>
                      {trade.isClosed ? "Fermé" : "Ouvert"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun trade trouvé</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 bg-black text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un trade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de trade */}
      <CreateTradeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        journalId={selectedJournalId || undefined}
      />
    </div>
  );
} 