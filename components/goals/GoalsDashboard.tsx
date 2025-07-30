"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/client";
import { GoalCard } from "./GoalCard";
import { GoalFilters } from "./GoalFilters";
import { GoalStats } from "./GoalStats";
import { EditGoalModal } from "./EditGoalModal";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { type Goal } from "@/server/db/schema";

export function GoalsDashboard() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filters, setFilters] = useState({
    status: "all" as "all" | "active" | "completed" | "overdue",
    type: "all" as "all" | "annual" | "quarterly" | "custom",
    hasReminders: null as boolean | null,
  });

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(0);
  }, [filters, search]);

  const { data: goalsData, isLoading, error } = api.goals.getPaginated.useQuery({
    page,
    limit: 12,
    sortBy: "sortOrder",
    sortOrder: "asc",
    search: search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });



  // Debug: afficher les paramètres de requête
  console.log("Query params:", {
    page,
    search: search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });

  // Stats avec invalidation automatique et refetch
  const { data: stats, refetch: refetchStats } = api.goals.getStats.useQuery(
    { period: "month" },
    {
      refetchInterval: 3000, // Refetch toutes les 3 secondes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  // Fonction pour forcer la mise à jour des stats
  const forceUpdateStats = () => {
    refetchStats();
  };

  // Fonction pour ouvrir la modal d'édition
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Fonction pour fermer la modal d'édition
  const handleCloseEditModal = () => {
    setEditingGoal(null);
    forceUpdateStats(); // Mettre à jour les stats après modification
  };

  if (error) {
    return (
      <div className="relative bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white/40" />
        </div>
        <p className="text-red-400 font-medium">Error loading goals</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Actions avec design amélioré */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-argesta rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              GRID
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-argesta rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              LIST
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <GoalFilters 
          search={search} 
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Goals List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Goals Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 animate-pulse backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-20" />
                  <div className="relative">
                    <div className="h-6 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : goalsData?.goals.length === 0 ? (
            <div className="relative bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Search className="w-10 h-10 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No goals found
              </h3>
              <p className="text-white/60 text-lg">
                {search
                  ? "Try adjusting your search terms"
                  : "Create your first goal to get started"}
              </p>
              {!search && (
                <div className="mt-6 flex items-center justify-center gap-2 text-white/40">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Ready to achieve something amazing?</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {goalsData?.goals
                  .filter(goal => {
                    // Filtre côté client pour les rappels
                    if (filters.hasReminders === true) {
                      return goal.remindersEnabled === true;
                    }
                    if (filters.hasReminders === false) {
                      return goal.remindersEnabled === false;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    // Tri par type d'abord
                    const typeOrder = { annual: 1, quarterly: 2, custom: 3 };
                    const aType = typeOrder[a.type as keyof typeof typeOrder] || 4;
                    const bType = typeOrder[b.type as keyof typeof typeOrder] || 4;
                    
                    if (aType !== bType) {
                      return aType - bType;
                    }
                    
                    // Puis par fréquence de rappels
                    const frequencyOrder = { daily: 1, weekly: 2, monthly: 3 };
                    if (a.remindersEnabled && b.remindersEnabled) {
                      const aFreq = frequencyOrder[a.reminderFrequency as keyof typeof frequencyOrder] || 4;
                      const bFreq = frequencyOrder[b.reminderFrequency as keyof typeof frequencyOrder] || 4;
                      return aFreq - bFreq;
                    }
                    
                    // Les objectifs avec rappels en premier
                    if (a.remindersEnabled && !b.remindersEnabled) return -1;
                    if (!a.remindersEnabled && b.remindersEnabled) return 1;
                    
                    return 0;
                  })
                  .map((goal, index) => (
                  <div
                    key={goal.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <GoalCard
                      goal={goal}
                      viewMode={viewMode}
                      onGoalChange={() => {
                        // Invalider les stats quand un goal change
                        forceUpdateStats();
                      }}
                      onEditGoal={() => handleEditGoal(goal)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination avec design amélioré */}
              {goalsData?.pagination && goalsData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="bg-white/[0.05] border-white/10 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-lg px-6 py-3">
                    <span className="text-white/80 font-medium">
                      Page {page + 1} of {goalsData?.pagination?.totalPages || 1}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= (goalsData?.pagination?.totalPages || 1) - 1}
                    className="bg-white/[0.05] border-white/10 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column: Stats + Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats */}
          {stats && (
            <div className="relative">
              <GoalStats stats={stats} />
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
} 