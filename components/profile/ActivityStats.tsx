"use client";

import { Target, TrendingUp, Trophy, Calendar, Crown } from "lucide-react";
import { api } from "@/trpc/client";

export function ActivityStats() {
  const { data: stats, isLoading } = api.profile.getUserStats.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        {/* General Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 bg-black/20 rounded-lg animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-3" />
              <div className="h-8 bg-white/10 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        
        {/* Pomodoro Section Skeleton */}
        <div className="bg-black/40 border border-white/20 rounded-xl animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-lg" />
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-32 mb-2" />
              <div className="h-3 bg-white/10 rounded w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="h-8 bg-white/10 rounded mb-3" />
                <div className="h-8 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Active Habits */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <Target className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Active Habits</p>
          <p className="text-3xl font-bold text-white">
            {stats.habits.active}
          </p>
        </div>
      </div>

      {/* Trading Entries */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <TrendingUp className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Trading Entries</p>
          <p className="text-3xl font-bold text-white">
            {stats.trades.total}
          </p>
        </div>
      </div>

      {/* Current Rank */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <Trophy className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Current Rank</p>
          <p className="text-2xl font-bold text-white">
            {stats.user.rank}
          </p>
        </div>
      </div>

      {/* Days Since Registration */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <Calendar className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Days Active</p>
          <p className="text-3xl font-bold text-white">
            {stats.user.daysSinceRegistration}
          </p>
        </div>
      </div>

      {/* Total Habits Created */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <Target className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Total Habits</p>
          <p className="text-3xl font-bold text-white">
            {stats.habits.total}
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <Crown className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <p className="text-white/60 text-sm font-medium mb-2">Plan</p>
          <p className={`text-2xl font-bold ${stats.user.subscriptionPlan === "PRO" ? "text-white" : "text-white/60"}`}>
            {stats.user.subscriptionPlan}
          </p>
        </div>
      </div>
    </div>
  );
} 