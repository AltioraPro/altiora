"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/client";

import { GoalFilters } from "./GoalFilters";
import { GoalStats } from "./GoalStats";
import { EditGoalModal } from "./EditGoalModal";
import { Search, Sparkles, TrendingUp, CheckCircle, Circle, Edit, Trash2, Calendar } from "lucide-react";
import { type Goal } from "@/server/db/schema";
import { Button } from "@/components/ui/button";

function QuarterlyGoalItem({
  goal,
  onGoalChange,
  onEditGoal
}: {
  goal: Goal;
  onGoalChange?: () => void;
  onEditGoal?: (goal: Goal) => void;
}) {
  const utils = api.useUtils();

  const markCompletedMutation = api.goals.markCompleted.useMutation({
    onSuccess: () => {
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      utils.goals.getAllGoalLimits.invalidate();
      onGoalChange?.();
    },
  });

  const deleteMutation = api.goals.delete.useMutation({
    onSuccess: () => {
      utils.goals.getPaginated.invalidate();
      utils.goals.getStats.invalidate();
      utils.goals.getAll.invalidate();
      utils.goals.getAllGoalLimits.invalidate();
      onGoalChange?.();
    },
  });

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.isCompleted;


  const handleMarkCompleted = () => {
    markCompletedMutation.mutate({ id: goal.id, isCompleted: !goal.isCompleted });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate({ id: goal.id });
    }
  };

  return (
    <div className="group relative bg-white/[0.02] border border-white/5 rounded-lg p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 mb-20">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={handleMarkCompleted}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              disabled={markCompletedMutation.isPending}
            >
              {goal.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Circle className="w-4 h-4 text-white/40 hover:text-green-400 transition-colors" />
              )}
            </button>

            <h4
              className={`text-sm font-medium break-words line-clamp-1 ${goal.isCompleted ? 'line-through text-white/50' : 'text-white/90'}`}
              title={goal.title}
            >
              {goal.title}
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/50">
            {goal.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(goal.deadline).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            )}

            <div className={`w-2 h-2 rounded-full ${goal.isCompleted
              ? 'bg-green-400'
              : isOverdue
                ? 'bg-red-400'
                : 'bg-white/30'
              }`} />

            <span className="text-xs">
              {goal.isCompleted ? 'Done' : isOverdue ? 'Overdue' : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditGoal?.(goal)}
            className="h-6 w-6 p-0 text-white/40 hover:text-white/80 hover:bg-white/5"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-white/40 hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function GoalsDashboard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filters, setFilters] = useState({
    status: "all" as "all" | "active" | "completed" | "overdue",
    type: "all" as "all" | "annual" | "quarterly" | "monthly",
    hasReminders: null as boolean | null,
  });





  useEffect(() => {
    setPage(0);
  }, [filters, search]);

  const { data: goalsData, isLoading, error } = api.goals.getPaginated.useQuery({
    page,
    limit: 50,
    sortBy: "sortOrder",
    sortOrder: "asc",
    search: search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });

  const { data: stats } = api.goals.getStats.useQuery(
    { period: "year" },
    {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    }
  );


  const forceUpdateStats = () => {
    // Force refresh of goals data
    // This will be handled by the individual mutations
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleCloseEditModal = () => {
    setEditingGoal(null);
    forceUpdateStats();
  };

  const organizeGoalsByType = (goals: Goal[]) => {
    const annualGoals = goals.filter(goal => goal.type === "annual");
    const quarterlyGoals = goals.filter(goal => goal.type === "quarterly");
    const monthlyGoals = goals.filter(goal => goal.type === "monthly");

    const groupGoalsByYear = (goals: Goal[]) => {
      const grouped: Record<number, Goal[]> = {};
      goals.forEach(goal => {
        if (goal.deadline) {
          const year = new Date(goal.deadline).getFullYear();
          if (!grouped[year]) {
            grouped[year] = [];
          }
          grouped[year].push(goal);
        }
      });
      return grouped;
    };

    const annualByYear = groupGoalsByYear(annualGoals);
    const quarterlyByYear = groupGoalsByYear(quarterlyGoals);
    const monthlyByYear = groupGoalsByYear(monthlyGoals);

    return { annualByYear, quarterlyByYear, monthlyByYear };
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

  const { annualByYear, quarterlyByYear, monthlyByYear } = organizeGoalsByType(goalsData?.goals || []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <GoalFilters
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 animate-pulse backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-20" />
                  <div className="relative">
                    <div className="h-6 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
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
              <p className="text-white/60 text-lg mb-6">
                {search
                  ? "Try adjusting your search terms"
                  : "Create your first goal to get started"}
              </p>
              {!search && (
                <div className="flex items-center justify-center gap-2 text-white/40">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Ready to achieve something amazing?</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {Object.keys(annualByYear).length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">Annual Goals</h2>
                    <div className="text-sm text-white/60">
                      {Object.values(annualByYear).flat().length} goals
                    </div>
                  </div>

                  <div className="space-y-8">
                    {Object.keys(annualByYear)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map(year => (
                        <div key={year} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-white/90">
                              {year}
                            </h3>
                            <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1"></div>
                            <div className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
                              {annualByYear[year].length} goals
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {annualByYear[year]
                              .sort((a, b) => {
                                if (a.isCompleted !== b.isCompleted) {
                                  return a.isCompleted ? 1 : -1;
                                }
                                if (a.deadline && b.deadline) {
                                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                                }
                                return 0;
                              })
                              .map((goal, index) => (
                                <div
                                  key={goal.id}
                                  className="animate-in fade-in-0 slide-in-from-bottom-4"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <QuarterlyGoalItem
                                    goal={goal}
                                    onGoalChange={() => forceUpdateStats()}
                                    onEditGoal={() => handleEditGoal(goal)}
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {Object.keys(quarterlyByYear).length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">Quarterly Goals</h2>
                    <div className="text-sm text-white/60">
                      {Object.values(quarterlyByYear).flat().length} goals
                    </div>
                  </div>

                  <div className="space-y-8">
                    {Object.keys(quarterlyByYear)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map(year => (
                        <div key={year} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-white/90">
                              {year}
                            </h3>
                            <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1"></div>
                            <div className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
                              {quarterlyByYear[year].length} goals
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {quarterlyByYear[year]
                              .sort((a, b) => {
                                if (a.isCompleted !== b.isCompleted) {
                                  return a.isCompleted ? 1 : -1;
                                }
                                if (a.deadline && b.deadline) {
                                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                                }
                                return 0;
                              })
                              .map((goal, index) => (
                                <div
                                  key={goal.id}
                                  className="animate-in fade-in-0 slide-in-from-bottom-4"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <QuarterlyGoalItem
                                    goal={goal}
                                    onGoalChange={() => forceUpdateStats()}
                                    onEditGoal={() => handleEditGoal(goal)}
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {Object.keys(monthlyByYear).length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">Monthly Goals</h2>
                    <div className="text-sm text-white/60">
                      {Object.values(monthlyByYear).flat().length} goals
                    </div>
                  </div>

                  <div className="space-y-8">
                    {Object.keys(monthlyByYear)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map(year => (
                        <div key={year} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-white/90">
                              {year}
                            </h3>
                            <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1"></div>
                            <div className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
                              {monthlyByYear[year].length} goals
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {monthlyByYear[year]
                              .sort((a, b) => {
                                if (a.isCompleted !== b.isCompleted) {
                                  return a.isCompleted ? 1 : -1;
                                }
                                if (a.deadline && b.deadline) {
                                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                                }
                                return 0;
                              })
                              .map((goal, index) => (
                                <div
                                  key={goal.id}
                                  className="animate-in fade-in-0 slide-in-from-bottom-4"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <QuarterlyGoalItem
                                    goal={goal}
                                    onGoalChange={() => forceUpdateStats()}
                                    onEditGoal={() => handleEditGoal(goal)}
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Stats */}
        <div className="lg:col-span-4 space-y-6">
          {stats && (
            <div className="relative">
              <GoalStats stats={stats as { total: number; completed: number; overdue: number; active: number; completionRate: number }} />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
} 