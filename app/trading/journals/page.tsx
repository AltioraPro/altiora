"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Plus, BarChart3, BookOpen } from "lucide-react";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { EditJournalModal } from "@/components/trading/EditJournalModal";
import { DraggableJournalList } from "@/components/trading/DraggableJournalList";
import type { TradingJournal } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function JournalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  type EditingJournal = Pick<TradingJournal, "id" | "name" | "description" | "isDefault"> | null;
  const [editingJournal, setEditingJournal] = useState<EditingJournal>(null);

  // Queries
  const { data: journals, isLoading: journalsLoading, refetch: refetchJournals } = api.trading.getJournals.useQuery();

  // Mutations
  const deleteJournalMutation = api.trading.deleteJournal.useMutation({
    onSuccess: () => {
      refetchJournals();
    },
  });

  const setDefaultJournalMutation = api.trading.setDefaultJournal.useMutation({
    onSuccess: () => {
      refetchJournals();
    },
  });

  const reorderJournalsMutation = api.trading.reorderJournals.useMutation({
    // Pas de refetch automatique pour éviter que les journaux reviennent à leur place
    // L'ordre est déjà mis à jour de manière optimiste dans le composant DraggableJournalList
  });

  const handleDeleteJournal = async (journalId: string) => {
    if (confirm("Are you sure you want to delete this journal? This action is irreversible.")) {
      try {
        await deleteJournalMutation.mutateAsync({ id: journalId });
      } catch (error) {
        console.error("Error deleting journal:", error);
      }
    }
  };

  const handleSetDefaultJournal = async (journalId: string) => {
    try {
      await setDefaultJournalMutation.mutateAsync({ id: journalId });
    } catch (error) {
      console.error("Error setting default journal:", error);
    }
  };

  const handleReorderJournals = async (journalIds: string[]) => {
    try {
      await reorderJournalsMutation.mutateAsync({ journalIds });
    } catch (error) {
      console.error("Error reordering journals:", error);
    }
  };

  if (journalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-argesta text-white mb-2">Trading Journals</h1>
          <p className="text-white/60">
            Manage your trading journals and track performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Journal
          </Button>
        </div>
      </div>

      {!journals || journals.length === 0 ? (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto p-8 border border-white/10 bg-black/20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white/60" />
            </div>
            
            <h3 className="text-xl font-argesta text-white mb-4">No Journals Created</h3>
            <p className="text-white/60 mb-8">
              Create your first trading journal to start tracking your performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-black hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Journal
              </Button>
              
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* All Journals Section */}
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-argesta text-white">All Journals</CardTitle>
                  <CardDescription className="text-white/60">
                    {journals.length} journal{journals.length > 1 ? 's' : ''} • {journals.filter(j => j.isDefault).length} default
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm">
                    {journals.length} TOTAL
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DraggableJournalList
                journals={journals}
                onReorder={handleReorderJournals}
                onEdit={(journal) => setEditingJournal(journal)}
                onDelete={(journal) => handleDeleteJournal(journal.id)}
                onSetDefault={(journal) => handleSetDefaultJournal(journal.id)}
              />
            </CardContent>
          </Card>

        </div>
      )}

      {/* Modals */}
      <CreateJournalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetchJournals();
        }}
      />

      {editingJournal && (
        <EditJournalModal
          isOpen={!!editingJournal}
          onClose={() => setEditingJournal(null)}
          journal={editingJournal}
          onSuccess={() => {
            setEditingJournal(null);
            refetchJournals();
          }}
        />
      )}
    </div>
  );
}

 