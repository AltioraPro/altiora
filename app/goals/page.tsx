"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { GoalsDashboard } from "@/components/goals/GoalsDashboard";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, TrendingUp, Sparkles, Crown } from "lucide-react";
import { api } from "@/trpc/client";
import { Footer } from "@/components/layout/Footer";

export default function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    active: 0,
    completed: 0,
    overdue: 0,
    successRate: 0,
  });

  // Récupérer les vraies statistiques des goals
  const { data: goalStats } = api.goals.getStats.useQuery(
    { period: "year" },
    {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 secondes
    }
  );

  // Vérifier toutes les restrictions en une seule requête optimisée
  const { data: goalLimits, isLoading: limitsLoading } = api.goals.getAllGoalLimits.useQuery(
    undefined,
    { 
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // Vérifier si l'utilisateur peut créer au moins un type de goal
  const canCreateAnyGoal = goalLimits?.canCreateAny ?? true;

  // Animation des stats quand les vraies données sont chargées
  useEffect(() => {
    if (!goalStats) return;

    const finalStats = {
      active: goalStats.active,
      completed: goalStats.completed,
      overdue: goalStats.overdue,
      successRate: goalStats.completionRate,
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
      <div className="min-h-screen mt-8 bg-pure-black text-pure-white">
        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="relative border-b border-white/10 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold font-argesta tracking-tight">
                    Goals Tracker
                  </h1>
                  <p className="text-white/60 font-argesta text-sm mt-2">
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

          {/* Quick Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Active Goals */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2 font-argesta">Active Goals</p>
                    <p className="text-3xl font-bold text-green-400 tracking-tight font-argesta">
                      {animatedStats.active}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Completed Goals */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2 font-argesta">Completed</p>
                    <p className="text-3xl font-bold text-green-400 tracking-tight font-argesta">
                      {animatedStats.completed}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overdue Goals */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2 font-argesta">Overdue</p>
                    <p className="text-3xl font-bold text-red-400 tracking-tight font-argesta">
                      {animatedStats.overdue}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Success Rate */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2 font-argesta">Success Rate</p>
                    <p className="text-3xl font-bold text-green-400 tracking-tight font-argesta">
                      {animatedStats.successRate}%
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Dashboard */}
          <GoalsDashboard />

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

      {/* Footer */}
      <Footer />
    </>
  );
} 