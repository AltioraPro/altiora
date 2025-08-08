"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Plus, BarChart3, ArrowLeft, Upload } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { CreateTradeModal } from "@/components/trading/CreateTradeModal";
import { ImportTradesModal } from "@/components/trading/ImportTradesModal";

export default function GlobalDashboardPage() {
  useSession();
  const [selectedJournalId, setSelectedJournalId] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();

  // Map the special value "all" to undefined so the backend aggregates across all journals
  const effectiveJournalId = selectedJournalId === "all" ? undefined : selectedJournalId;

  const { data: stats } = api.trading.getStats.useQuery({ journalId: effectiveJournalId });
  const { data: allTrades } = api.trading.getTrades.useQuery({ journalId: effectiveJournalId, limit: 100, offset: 0 });

  const { data: sessions } = api.trading.getSessions.useQuery({ journalId: effectiveJournalId });
  // For global dashboard, we don't display setups/assets in the table; keep minimal queries

  if (journalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
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
            <h1 className="text-4xl font-argesta text-white mb-4">Global Dashboard</h1>
            <p className="text-white/60">Crée ton premier journal pour voir les statistiques globales.</p>
          </div>

          <Card className="p-8 border border-white/10 bg-black/20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-xl font-argesta text-white mb-4">Aucun journal</h3>
            <p className="text-white/60 mb-8">Crée un journal pour commencer à suivre ta performance.</p>

            <Link href="/trading/journals">
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Créer un Journal
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Link className="text-pure-black" href="/trading/journals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Journals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-argesta text-white">Global Dashboard</h1>
            <p className="text-white/60">Vue d’ensemble de toutes tes statistiques. Sélectionne un journal pour filtrer.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <Select value={selectedJournalId} onValueChange={setSelectedJournalId}>
              <SelectTrigger className="border-white/20 bg-black/20 text-white">
                <SelectValue placeholder="Tous les journaux" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 text-white">
                <SelectItem value="all">Tous les journaux</SelectItem>
                {journals?.map((j: { id: string; name: string }) => (
                  <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="border-white/20 text-black hover:bg-white/10">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-black hover:bg-gray-200">
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <GlobalTradingStats stats={stats} />
        </div>
      )}

      {/* Charts */}
      {stats && sessions && allTrades && (
        <div className="mb-8">
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="font-argesta text-white">Performance Charts</CardTitle>
              <CardDescription className="text-white/60">Analyse visuelle de ta performance globale</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalTradingCharts sessions={sessions} trades={allTrades} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CreateTradeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} journalId={effectiveJournalId} />
      <ImportTradesModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} journalId={effectiveJournalId} />
    </div>
  );
}
 