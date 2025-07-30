"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Target, CheckCircle, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoalFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: {
    status: "all" | "active" | "completed" | "overdue";
    type: "all" | "annual" | "quarterly" | "custom";
    hasReminders: boolean | null;
  };
  onFiltersChange: (filters: {
    status: "all" | "active" | "completed" | "overdue";
    type: "all" | "annual" | "quarterly" | "custom";
    hasReminders: boolean | null;
  }) => void;
}

export function GoalFilters({ search, onSearchChange, filters, onFiltersChange }: GoalFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Gestionnaire de clic en dehors pour fermer le panneau
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    };

    if (isFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFiltersOpen]);

  const clearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: "all",
      type: "all",
      hasReminders: null,
    });
    setLocalSearch("");
    onSearchChange("");
  };

  const hasActiveFilters = filters.status !== "all" || filters.type !== "all" || filters.hasReminders !== null || localSearch;

  return (
    <div className="flex items-center gap-3">
      {/* Barre de recherche */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search goals..."
            className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all duration-200"
          />
          {localSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bouton filtres */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className={`bg-white/10 border-white/20 hover:bg-white/20 text-white transition-all duration-200 ${
            hasActiveFilters ? "bg-white/20 border-white/30" : ""
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <div className="ml-2 w-2 h-2 bg-white/80 rounded-full" />
          )}
        </Button>

        {/* Panneau de filtres */}
        {isFiltersOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-neutral-900 border border-white/10 rounded-xl p-4 shadow-2xl z-[9999]" ref={filtersRef}>
            <div className="space-y-4">
              {/* En-tête */}
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Filters & Sort</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-white/60 hover:text-white/80 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Tri par type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Sort by Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "annual", label: "Annual" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "custom", label: "Custom" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => onFiltersChange({ ...filters, type: value as "all" | "annual" | "quarterly" | "custom" })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.type === value
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-transparent"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "All", icon: Target },
                    { value: "active", label: "Active", icon: Clock },
                    { value: "completed", label: "Completed", icon: CheckCircle },
                    { value: "overdue", label: "Overdue", icon: Award },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => onFiltersChange({ ...filters, status: value as "all" | "active" | "completed" | "overdue" })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.status === value
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre par rappels */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Reminders</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: null, label: "All" },
                    { value: true, label: "With reminders" },
                    { value: false, label: "No reminders" },
                  ].map(({ value, label }) => (
                    <button
                      key={value === null ? "all" : value.toString()}
                      onClick={() => onFiltersChange({ ...filters, hasReminders: value })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filters.hasReminders === value
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-transparent"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicateurs de filtres actifs */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {filters.status !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md">
                        {filters.status}
                        <button
                          onClick={() => onFiltersChange({ ...filters, status: "all" })}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.type !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md">
                        {filters.type}
                        <button
                          onClick={() => onFiltersChange({ ...filters, type: "all" })}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.hasReminders !== null && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md">
                        {filters.hasReminders ? "With reminders" : "No reminders"}
                        <button
                          onClick={() => onFiltersChange({ ...filters, hasReminders: null })}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {localSearch && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md">
                        &quot;{localSearch}&quot;
                        <button
                          onClick={clearSearch}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 