"use client";

import { Target, TrendingUp, Trophy, Calendar, Sparkles, Shield, Zap, Crown, Star, Award, TrendingUp as Rising, Crosshair } from "lucide-react";
import { api } from "@/trpc/client";

export function ActivityStats() {
  const { data: stats, isLoading } = api.profile.getUserStats.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="text-center p-6 bg-white/5 rounded-xl border border-white/10 animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-3" />
            <div className="h-8 bg-white/10 rounded mb-2" />
            <div className="h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "IMMORTAL":
        return "text-pink-400";
      case "GRANDMASTER":
        return "text-red-400";
      case "MASTER":
        return "text-orange-400";
      case "LEGEND":
        return "text-yellow-400";
      case "EXPERT":
        return "text-purple-400";
      case "CHAMPION":
        return "text-green-400";
      case "RISING":
        return "text-blue-400";
      case "BEGINNER":
        return "text-white/60";
      default:
        return "text-white/40";
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "IMMORTAL":
        return <Sparkles className="w-6 h-6" />;
      case "GRANDMASTER":
        return <Shield className="w-6 h-6" />;
      case "MASTER":
        return <Zap className="w-6 h-6" />;
      case "LEGEND":
        return <Crown className="w-6 h-6" />;
      case "EXPERT":
        return <Star className="w-6 h-6" />;
      case "CHAMPION":
        return <Award className="w-6 h-6" />;
      case "RISING":
        return <Rising className="w-6 h-6" />;
      case "BEGINNER":
        return <Crosshair className="w-6 h-6" />;
      default:
        return <Crosshair className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Active Habits */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <Target className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-3xl  font-bold text-white mb-2">
          {stats.habits.active}
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          ACTIVE HABITS
        </div>
      </div>

      {/* Trading Entries */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-3xl  font-bold text-white mb-2">
          {stats.trades.total}
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          TRADING ENTRIES
        </div>
      </div>

      {/* Current Rank */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <Trophy className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-2xl  font-bold mb-2">
          <div className="flex items-center justify-center gap-2">
            <span className={getRankColor(stats.user.rank)}>
              {getRankIcon(stats.user.rank)}
            </span>
            <span className={getRankColor(stats.user.rank)}>
              {stats.user.rank}
            </span>
          </div>
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          CURRENT RANK
        </div>
      </div>

      {/* Days Since Registration */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-3xl  font-bold text-white mb-2">
          {stats.user.daysSinceRegistration}
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          DAYS ACTIVE
        </div>
      </div>

      {/* Total Habits Created */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <Target className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-3xl  font-bold text-white mb-2">
          {stats.habits.total}
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          TOTAL HABITS
        </div>
      </div>

      {/* Subscription Status */}
      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-center mb-3">
          <Trophy className="w-6 h-6 text-white/60" />
        </div>
        <div className="text-2xl  font-bold mb-2">
          <span className={stats.user.subscriptionPlan === "PRO" ? "text-green-400" : "text-white/60"}>
            {stats.user.subscriptionPlan}
          </span>
        </div>
        <div className="text-sm text-white/60  tracking-wide">
          PLAN
        </div>
      </div>
    </div>
  );
} 