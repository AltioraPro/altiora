"use client";

import { api } from "@/trpc/client";
import { Target, BookOpen, Trophy, Crown, BarChart3 } from "lucide-react";

export function UsageStats() {
  const { data: limitsSummary, error, isLoading } = api.subscription.getLimitsSummary.useQuery();

  const fallbackData = {
    limits: {
      maxHabits: 3,
      maxTradingEntries: 10,
      maxAnnualGoals: 1,
      maxQuarterlyGoals: 1,
      maxMonthlyGoals: 0,
    },
    usage: {
      currentHabits: 0,
      monthlyTradingEntries: 0,
      currentAnnualGoals: 0,
      currentQuarterlyGoals: 0,
      currentMonthlyGoals: 0,
    }
  };

  const data = limitsSummary || fallbackData;
  const { limits, usage } = data;

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 999) return 0;
    if (max === 0) return 0; 
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 75) return "text-amber-400";
    return "text-green-400";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-500";
    return "bg-green-500";
  };

  const getPlanName = () => {
    if (limits.maxHabits === 3 && limits.maxTradingEntries === 10) return "Free Plan";
    if (limits.maxHabits === 999 && limits.maxMonthlyGoals === 0) return "Pro Plan";
    if (limits.maxHabits === 999 && limits.maxMonthlyGoals === 999) return "Altiorans";
    return "Custom Plan";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-argesta font-bold text-white tracking-wide">
            PLAN USAGE
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-3"></div>
              <div className="h-2 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <BarChart3 className="w-5 h-5 text-white/60" />
        <h3 className="text-lg font-argesta font-bold text-white tracking-wide">
          PLAN USAGE
        </h3>
        {error && (
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
            Offline
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Habits */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-white/60" />
              <span className="text-sm font-argesta text-white/80 tracking-wide">HABITS</span>
            </div>
            <span className={`text-sm font-argesta font-bold ${getUsageColor(getUsagePercentage(usage.currentHabits, limits.maxHabits))}`}>
              {usage.currentHabits}/{limits.maxHabits === 999 ? "∞" : limits.maxHabits}
            </span>
          </div>
          
          {limits.maxHabits !== 999 && limits.maxHabits > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(usage.currentHabits, limits.maxHabits))}`}
                style={{ width: `${getUsagePercentage(usage.currentHabits, limits.maxHabits)}%` }}
              />
            </div>
          )}
        </div>

        {/* Trading Entries */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-white/60" />
              <span className="text-sm font-argesta text-white/80 tracking-wide">TRADING ENTRIES</span>
            </div>
            <span className={`text-sm font-argesta font-bold ${getUsageColor(getUsagePercentage(usage.monthlyTradingEntries, limits.maxTradingEntries))}`}>
              {usage.monthlyTradingEntries}/{limits.maxTradingEntries === 999 ? "∞" : limits.maxTradingEntries}
            </span>
          </div>
          
          {limits.maxTradingEntries !== 999 && limits.maxTradingEntries > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(usage.monthlyTradingEntries, limits.maxTradingEntries))}`}
                style={{ width: `${getUsagePercentage(usage.monthlyTradingEntries, limits.maxTradingEntries)}%` }}
              />
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-white/60" />
              <span className="text-sm font-argesta text-white/80 tracking-wide">GOALS</span>
            </div>
            <span className={`text-sm font-argesta font-bold ${getUsageColor(getUsagePercentage(usage.currentAnnualGoals + usage.currentQuarterlyGoals, limits.maxAnnualGoals + limits.maxQuarterlyGoals))}`}>
              {usage.currentAnnualGoals + usage.currentQuarterlyGoals}/{limits.maxAnnualGoals + limits.maxQuarterlyGoals === 999 ? "∞" : limits.maxAnnualGoals + limits.maxQuarterlyGoals}
            </span>
          </div>
          
          {limits.maxAnnualGoals + limits.maxQuarterlyGoals !== 999 && limits.maxAnnualGoals + limits.maxQuarterlyGoals > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getUsagePercentage(usage.currentAnnualGoals + usage.currentQuarterlyGoals, limits.maxAnnualGoals + limits.maxQuarterlyGoals))}`}
                style={{ width: `${getUsagePercentage(usage.currentAnnualGoals + usage.currentQuarterlyGoals, limits.maxAnnualGoals + limits.maxQuarterlyGoals)}%` }}
              />
            </div>
          )}
          
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>Annual: {usage.currentAnnualGoals}/{limits.maxAnnualGoals === 999 ? "∞" : limits.maxAnnualGoals}</span>
            <span>Quarterly: {usage.currentQuarterlyGoals}/{limits.maxQuarterlyGoals === 999 ? "∞" : limits.maxQuarterlyGoals}</span>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-2">
          <Crown className="w-5 h-5 text-white/60" />
          <span className="text-sm font-argesta font-bold text-white tracking-wide">
            CURRENT PLAN
          </span>
        </div>
        <p className="text-sm text-white/80 font-argesta">
          {getPlanName()}
        </p>
      </div>
    </div>
  );
}