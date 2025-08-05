"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/client";

import { GoalFilters } from "./GoalFilters";
import { GoalStats } from "./GoalStats";
import { EditGoalModal } from "./EditGoalModal";
import { Search, Sparkles, TrendingUp, CheckCircle, Circle, Edit, Trash2, Calendar } from "lucide-react";
import { type Goal } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

  // Compact component for quarterly and monthly goals
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

    const getStatusColor = () => {
      if (goal.isCompleted) return "bg-green-500/30 text-green-400 border-green-500/50";
      if (isOverdue) return "bg-red-500/20 text-red-400 border-red-500/30";
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    };

    const handleMarkCompleted = () => {
      markCompletedMutation.mutate({ id: goal.id, isCompleted: !goal.isCompleted });
    };

    const handleDelete = () => {
      if (confirm("Are you sure you want to delete this goal?")) {
        deleteMutation.mutate({ id: goal.id });
      }
    };

    return (
      <div className="group relative bg-white/[0.03] border border-white/10 rounded-lg p-3 hover:border-white/20 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleMarkCompleted}
              className="flex-shrink-0"
              disabled={markCompletedMutation.isPending}
            >
              {goal.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Circle className="w-4 h-4 text-white/60 hover:text-green-400 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium truncate ${goal.isCompleted ? 'line-through text-green-400/60' : 'text-white'}`}>
                  {goal.title}
                </h4>
                <Badge className={`text-xs ${getStatusColor()}`}>
                  {goal.isCompleted ? 'Done' : isOverdue ? 'Late' : 'Active'}
                </Badge>
              </div>
              {goal.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/40">
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditGoal?.(goal)}
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-red-400/10"
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

  // Hook pour les toasts
  const { addToast } = useToast();



  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters, search]);

  const { data: goalsData, isLoading, error } = api.goals.getPaginated.useQuery({
    page,
    limit: 50, // Increase limit to get all goals
    sortBy: "sortOrder",
    sortOrder: "asc",
    search: search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });

  // Debug: display query parameters
  console.log("Query params:", {
    page,
    search: search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });

  // Stats with automatic invalidation and refetch
  const { data: stats, refetch: refetchStats } = api.goals.getStats.useQuery(
    { period: "month" },
    {
      refetchInterval: 3000, // Refetch every 3 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );

  // Function to force stats update
  const forceUpdateStats = () => {
    refetchStats();
  };

  // Function to open edit modal
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Function to close edit modal
  const handleCloseEditModal = () => {
    setEditingGoal(null);
    forceUpdateStats(); // Update stats after modification
  };

  // Organize goals by type and dates
  const organizeGoalsByType = (goals: Goal[]) => {
    const annualGoals = goals.filter(goal => goal.type === "annual");
    const quarterlyGoals = goals.filter(goal => goal.type === "quarterly");
    const monthlyGoals = goals.filter(goal => goal.type === "monthly");

    // Group goals by year
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Goals</h1>
      </div>

      {/* Top Actions with improved design */}
      <div className="flex items-center justify-between">
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
        <div className="lg:col-span-8 space-y-8">
          {isLoading ? (
            <div className="space-y-8">
              {/* Loading skeleton for sections */}
              {[1, 2].map((section) => (
                <div key={section} className="space-y-4">
                  <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="space-y-8">
              {/* Annual Goals Section */}
              {Object.keys(annualByYear).length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Annual Goals</h2>
                  
                  {/* Annual goals organized by year */}
                  <div className="space-y-8">
                    {Object.keys(annualByYear)
                      .map(Number)
                      .sort((a, b) => a - b) // Sort years ascending (older years first)
                      .map(year => (
                        <div key={year} className="space-y-4">
                          <h3 className="text-xl font-semibold text-white/90 border-b border-white/20 pb-2">
                            {year}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {annualByYear[year].map((goal, index) => (
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

              {/* Quarterly Goals Section */}
              {Object.keys(quarterlyByYear).length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Quarterly Goals</h2>
                  
                  {/* Quarterly goals organized by year */}
                  <div className="space-y-8">
                    {Object.keys(quarterlyByYear)
                      .map(Number)
                      .sort((a, b) => a - b) // Sort years ascending (older years first)
                      .map(year => (
                        <div key={year} className="space-y-4">
                          <h3 className="text-xl font-semibold text-white/90 border-b border-white/20 pb-2">
                            {year}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Quarter 1 */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                Q1 (Jan-Mar)
                              </h4>
                              <div className="space-y-3">
                                {quarterlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() >= 0 && deadline.getMonth() <= 2;
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

                            {/* Quarter 2 */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                Q2 (Apr-Jun)
                              </h4>
                              <div className="space-y-3">
                                {quarterlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() >= 3 && deadline.getMonth() <= 5;
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

                            {/* Quarter 3 */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                Q3 (Jul-Sep)
                              </h4>
                              <div className="space-y-3">
                                {quarterlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() >= 6 && deadline.getMonth() <= 8;
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

                            {/* Quarter 4 */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                Q4 (Oct-Dec)
                              </h4>
                              <div className="space-y-3">
                                {quarterlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() >= 9 && deadline.getMonth() <= 11;
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
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Monthly Goals Section */}
              {Object.keys(monthlyByYear).length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Monthly Goals</h2>
                  
                  {/* Monthly goals organized by year */}
                  <div className="space-y-8">
                    {Object.keys(monthlyByYear)
                      .map(Number)
                      .sort((a, b) => a - b) // Sort years ascending (older years first)
                      .map(year => (
                        <div key={year} className="space-y-4">
                          <h3 className="text-xl font-semibold text-white/90 border-b border-white/20 pb-2">
                            {year}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* January */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                January
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 0;
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

                            {/* February */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                February
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 1;
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

                            {/* March */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                March
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 2;
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

                            {/* April */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                April
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 3;
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

                            {/* May */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                May
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 4;
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

                            {/* June */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                June
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 5;
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

                            {/* July */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                July
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 6;
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

                            {/* August */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                August
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 7;
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

                            {/* September */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                September
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 8;
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

                            {/* October */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                October
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 9;
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

                            {/* November */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                November
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 10;
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

                            {/* December */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-white/70 border-b border-white/10 pb-2">
                                December
                              </h4>
                              <div className="space-y-3">
                                {monthlyByYear[year]
                                  .filter(goal => {
                                    const deadline = goal.deadline ? new Date(goal.deadline) : null;
                                    return deadline && deadline.getMonth() === 11;
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
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
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