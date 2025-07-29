"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/client";
import { useHabits } from "./HabitsProvider";
import { useToast } from "@/components/ui/toast";
import { Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function HabitsManager() {
  const { openEditModal } = useHabits();
  const { addToast } = useToast();
  
  // Mutations
  const utils = api.useUtils();
  const deleteHabitMutation = api.habits.delete.useMutation({
    onSuccess: () => {
      utils.habits.getPaginated.invalidate();
      utils.habits.getDashboard.invalidate();
      addToast({
        type: "success",
        title: "Habitude supprimée",
        message: "L'habitude a été supprimée avec succès",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Erreur",
        message: error.message || "Impossible de supprimer l'habitude",
      });
    },
  });

  const updateHabitMutation = api.habits.update.useMutation({
    onSuccess: () => {
      utils.habits.getPaginated.invalidate();
      utils.habits.getDashboard.invalidate();
      addToast({
        type: "success",
        title: "Habitude réactivée",
        message: "L'habitude a été réactivée avec succès",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Erreur",
        message: error.message || "Impossible de réactiver l'habitude",
      });
    },
  });

  const deleteHabit = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabitMutation.mutate({ id: habitId });
    }
  };

  const reactivateHabit = (habitId: string) => {
    updateHabitMutation.mutate({ id: habitId, isActive: true });
  };
  const [page, setPage] = useState(0);
  const [limit] = useState(5);
  const [searchInput, setSearchInput] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Debounce the search to avoid frequent requests
  const debouncedSearch = useDebounce(searchInput, 300);

  // Use pagination instead of static habits
  const { data: paginatedData, isLoading } = api.habits.getPaginated.useQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
    showInactive,
  });

  const habits = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(0); // Reset to first page when searching
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleToggleInactive = () => {
    setShowInactive(!showInactive);
    setPage(0); // Reset to first page when toggling filter
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-argesta text-lg text-white">HABITS MANAGER</h3>
          <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-argesta text-lg text-white">HABITS MANAGER</h3>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>

        {/* Show Inactive Toggle */}
        <button
          onClick={handleToggleInactive}
          className={`ml-4 px-4 py-2 rounded-lg transition-colors text-sm font-argesta ${
            showInactive 
              ? 'bg-white/20 text-white border border-white/40' 
              : 'bg-white/5 text-white/60 hover:text-white/80 border border-white/20 hover:border-white/40'
          }`}
        >
          {showInactive ? 'HIDE INACTIVE' : 'SHOW INACTIVE'}
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-3 mb-6">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            {debouncedSearch ? 'No habits found matching your search.' : 'No habits yet.'}
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors ${
                !habit.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.emoji}
                </div>
                <div>
                  <h4 className="font-medium text-white">{habit.title}</h4>
                  {habit.description && (
                    <p className="text-sm text-white/60 truncate max-w-48">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-white/40">
                      {habit.targetFrequency}
                    </span>
                    {habit.completionRate !== undefined && (
                      <span className="text-xs text-white/60">
                        {Math.round(habit.completionRate)}% completion
                      </span>
                    )}
                    {!habit.isActive && (
                      <span className="text-xs text-red-400/80 font-medium">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!habit.isActive && (
                  <button
                    onClick={() => reactivateHabit(habit.id)}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                    title="Reactivate habit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => openEditModal(habit.id)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, pagination.total)} of {pagination.total} habits
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 