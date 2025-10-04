"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { GoalsDashboard } from "@/components/goals/GoalsDashboard";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, TrendingUp, Sparkles, Crown } from "lucide-react";
import { api } from "@/trpc/client";

export default function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    active: 0,
    completed: 0,
    overdue: 0,
    successRate: 0,
  });

  const { data: goalStats } = api.goals.getStats.useQuery(
    { period: "year" },
    {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 secondes
    }
  ) as { data: { active: number; completed: number; overdue: number; completionRate: number } | undefined };

  const { data: goalLimits, isLoading: limitsLoading } = api.goals.getAllGoalLimits.useQuery(
    undefined,
    { 
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const canCreateAnyGoal = goalLimits?.canCreateAny ?? true

  useEffect(() => {
    if (!goalStats) return;

    const finalStats = {
      active: goalStats?.active || 0,
      completed: goalStats?.completed || 0,
      overdue: goalStats?.overdue || 0,
      successRate: goalStats?.completionRate || 0,
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const animateValue = (start: number, end: number, setter: (value: number) => void) => {
      const increment = (end - start) / steps;
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        setter(Math.round(current));
      }, stepDuration);

      return timer;
    };

    const timers = [
      animateValue(0, finalStats.active, (value) => setAnimatedStats(prev => ({ ...prev, active: value }))),
      animateValue(0, finalStats.completed, (value) => setAnimatedStats(prev => ({ ...prev, completed: value }))),
      animateValue(0, finalStats.overdue, (value) => setAnimatedStats(prev => ({ ...prev, overdue: value }))),
      animateValue(0, finalStats.successRate, (value) => setAnimatedStats(prev => ({ ...prev, successRate: value }))),
    ];

    return () => timers.forEach(timer => clearInterval(timer));
  }, [goalStats]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-pure-black text-pure-white">
        {/* Main Content */}
        <div className="relative w-full mx-auto">
          {/* Header */}
          <div className="relative border-b border-white/10 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold font-argesta tracking-tight">
                    Goals Tracker
                  </h1>
                  <p className="text-white/60 text-sm mt-2">
                    Define your vision. Achieve your destiny.
                  </p>
                </div>
                
                {limitsLoading ? (
                  <Button
                    disabled
                    className="group relative bg-white/5 text-white/50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/10 overflow-hidden"
                  >
                    <div className="relative flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </Button>
                ) : canCreateAnyGoal ? (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group relative bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>New Goal</span>
                    </div>
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/pricing'}
                    className="group relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-yellow-500/30 hover:border-yellow-500/50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      <Crown className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>Upgrade to Create More Goals</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
            {/* Active Goals */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
              <div className="absolute top-4 right-4">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium mb-2">Active Goals</p>
                <p className="text-3xl font-bold text-green-400">
                  {animatedStats.active}
                </p>
              </div>
            </div>
            
            {/* Completed Goals */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
              <div className="absolute top-4 right-4">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-400">
                  {animatedStats.completed}
                </p>
              </div>
            </div>
            
            {/* Overdue Goals */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
              <div className="absolute top-4 right-4">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium mb-2">Overdue</p>
                <p className="text-3xl font-bold text-red-400">
                  {animatedStats.overdue}
                </p>
              </div>
            </div>
            
            {/* Success Rate */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
              <div className="absolute top-4 right-4">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-white">
                  {animatedStats.successRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Goals Dashboard */}
          <div className="max-w-7xl mx-auto">
            <GoalsDashboard />
          </div>

          {/* Create Goal Modal */}
          <CreateGoalModal
            isOpen={isCreateModalOpen}    
            onClose={() => setIsCreateModalOpen(false)}
          />
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.002] rounded-full blur-3xl" />
        </div>
      </div>
    </>
  );
} 