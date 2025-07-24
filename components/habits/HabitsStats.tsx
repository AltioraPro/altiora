"use client";

import { useState } from "react";
import { Trophy, Target, TrendingUp, Calendar, Star, Crown, X, Info } from "lucide-react";
import type { HabitStatsOverview } from "@/server/api/routers/habits/types";
import { useHabits } from "./HabitsProvider";

interface HabitsStatsProps {
  data?: HabitStatsOverview;
  todayHabits?: Array<{ id: string; isCompleted: boolean }>;
}

interface RankInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  minStreak: number;
  description: string;
  discordRole: string;
  benefits: string[];
}

export function HabitsStats({ data, todayHabits }: HabitsStatsProps) {
  const { getOptimisticStats } = useHabits();
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  
  // Utiliser les données optimistes
  const optimisticData = getOptimisticStats(data, todayHabits);

  if (!optimisticData) {
    return <HabitsStatsSkeleton />;
  }

  const {
    totalActiveHabits,
    currentStreak,
    longestStreak,
    averageCompletionRate,
  } = optimisticData;

  // Système de rank complet
  const rankSystem: RankInfo[] = [
    {
      name: "NEW",
      icon: Target,
      color: "text-white/40",
      bgColor: "bg-white/5",
      borderColor: "border-white/10",
      minStreak: 0,
      description: "Beginning of your journey to excellence",
      discordRole: "New",
      benefits: ["Access to Discord server", "Community support"]
    },
    {
      name: "BEGINNER",
      icon: Target,
      color: "text-white/60",
      bgColor: "bg-white/5",
      borderColor: "border-white/20",
      minStreak: 1,
      description: "First steps towards discipline",
      discordRole: "Beginner",
      benefits: ["Access to basic channels", "Expert advice"]
    },
    {
      name: "RISING",
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      minStreak: 3,
      description: "Momentum builds, motivation grows",
      discordRole: "Rising",
      benefits: ["Access to weekly challenges", "Special Discord badge"]
    },
    {
      name: "CHAMPION",
      icon: Trophy,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      minStreak: 7,
      description: "Champion of daily discipline",
      discordRole: "Champion",
      benefits: ["Exclusive Discord role", "Access to private events", "Mentor other members"]
    },
    {
      name: "EXPERT",
      icon: Star,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      minStreak: 14,
      description: "Recognized productivity expert",
      discordRole: "Expert",
      benefits: ["VIP Discord role", "Access to masterclasses", "Ability to create challenges"]
    },
    {
      name: "LEGEND",
      icon: Crown,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      minStreak: 30,
      description: "Living legend of discipline",
      discordRole: "Legend",
      benefits: ["Legendary Discord role", "Exclusive access to all content", "Moderator status", "VIP event invitations"]
    }
  ];

  // Trouver le rank actuel et le prochain
  const currentRank = rankSystem.find(rank => currentStreak >= rank.minStreak) || rankSystem[0]!;
  const nextRank = rankSystem.find(rank => rank.minStreak > currentStreak);
  const daysToNextRank = nextRank ? nextRank.minStreak - currentStreak : 0;

  const stats = [
    {
      icon: Target,
      label: "HABITS",
      value: totalActiveHabits,
      suffix: "",
      color: "text-white",
    },
    {
      icon: TrendingUp,
      label: "CURRENT SERIES",
      value: currentStreak,
      suffix: "j",
      color: currentStreak >= 7 ? "text-green-400" : currentStreak >= 3 ? "text-white" : "text-white/70",
    },
    {
      icon: Trophy,
      label: "BEST SERIES",
      value: longestStreak,
      suffix: "j",
      color: longestStreak >= 14 ? "text-yellow-400" : longestStreak >= 7 ? "text-green-400" : "text-white",
    },
    {
      icon: Calendar,
      label: "AVERAGE RATE",
      value: averageCompletionRate,
      suffix: "%",
      color: averageCompletionRate >= 80 ? "text-green-400" : averageCompletionRate >= 60 ? "text-white" : "text-white/70",
    },
  ];

  return (
    <>
      <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-argesta tracking-tight">
              STATISTICS
            </h3>
            
            {/* Rank Badge - Clickable */}
            <button
              onClick={() => setIsRankModalOpen(true)}
              className={`flex items-center space-x-2 ${currentRank.bgColor} border ${currentRank.borderColor} rounded-lg px-3 py-1 hover:scale-105 transition-all duration-200 group`}
            >
              <currentRank.icon className={`w-4 h-4 ${currentRank.color} group-hover:scale-110 transition-transform`} />
              <span className={`text-xs font-argesta ${currentRank.color}`}>
                {currentRank.name}
              </span>
              <Info className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors animate-pulse" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              
              return (
                <div
                  key={stat.label}
                  className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                    
                    {/* Special indicators */}
                    {stat.label === "CURRENT SERIES" && currentStreak >= 7 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                    {stat.label === "AVERAGE RATE" && averageCompletionRate === 100 && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    {stat.label === "BEST SERIES" && longestStreak >= 14 && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    {stat.label === "HABITS" && totalActiveHabits >= 5 && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold font-argesta ${stat.color} transition-colors`}>
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs text-white/60 font-argesta">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Insights */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="space-y-3">
              {currentStreak >= 7 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-argesta">
                    {currentStreak >= 30 
                      ? "Incredible consistency! You&apos;re building legendary habits." 
                      : currentStreak >= 14 
                      ? "Outstanding! You&apos;re becoming a habit expert." 
                      : "Great work! You&apos;re on a solid streak."
                    }
                  </span>
                </div>
              )}
              
              {averageCompletionRate >= 80 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-argesta">
                    Excellent average completion rate! You&apos;re highly consistent.
                  </span>
                </div>
              )}
              
              {currentStreak < 3 && totalActiveHabits > 0 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/60 font-argesta">
                    Keep going! Consistency builds momentum.
                  </span>
                </div>
              )}

              {/* Rank-specific messages */}
              {currentRank.name === "LEGEND" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-argesta">
                    You&apos;re a true legend! Your discipline is unmatched.
                  </span>
                </div>
              )}
              
              {currentRank.name === "EXPERT" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-argesta">
                    Expert level achieved! You&apos;re mastering your habits.
                  </span>
                </div>
              )}
              
              {currentRank.name === "CHAMPION" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-argesta">
                    Champion status! You&apos;re building lasting habits.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rank System Modal */}
      {isRankModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-argesta">
                  RANK SYSTEM
                </h2>
                <button
                  onClick={() => setIsRankModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Current Rank Section */}
              <div className={`${currentRank.bgColor} border ${currentRank.borderColor} rounded-xl p-4 mb-6`}>
                <div className="flex items-center space-x-3 mb-3">
                  <currentRank.icon className={`w-6 h-6 ${currentRank.color}`} />
                  <h3 className={`text-lg font-bold font-argesta ${currentRank.color}`}>
                    YOUR CURRENT RANK: {currentRank.name}
                  </h3>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {currentRank.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-white/60">Discord Role:</span>
                    <span className={`font-argesta ${currentRank.color}`}>
                      {currentRank.discordRole}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">
                    Benefits:
                  </div>
                  <ul className="space-y-1 ml-4">
                    {currentRank.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-white/80 flex items-center space-x-2">
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progress to Next Rank */}
              {nextRank && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-bold font-argesta mb-3">
                    NEXT RANK: {nextRank.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Progress:</span>
                      <span className="text-white">
                        {currentStreak} / {nextRank.minStreak} days
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${nextRank.color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.min((currentStreak / nextRank.minStreak) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-white/60">
                        {daysToNextRank} day{daysToNextRank > 1 ? 's' : ''} remaining to become {nextRank.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* All Ranks */}
              <div>
                <h3 className="text-lg font-bold font-argesta mb-4">
                  ALL RANKS
                </h3>
                                 <div className="space-y-3">
                   {rankSystem.map((rank) => {
                    const RankIcon = rank.icon;
                    const isCurrentRank = rank.name === currentRank.name;
                    const isUnlocked = currentStreak >= rank.minStreak;
                    
                    return (
                      <div
                        key={rank.name}
                        className={`border rounded-xl p-4 transition-all duration-200 ${
                          isCurrentRank 
                            ? `${rank.bgColor} ${rank.borderColor}` 
                            : isUnlocked
                            ? "bg-white/5 border-white/20"
                            : "bg-white/5 border-white/10 opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <RankIcon className={`w-5 h-5 ${rank.color}`} />
                            <span className={`font-argesta font-medium ${rank.color}`}>
                              {rank.name}
                            </span>
                            {isCurrentRank && (
                              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-white/60">
                            {rank.minStreak} day{rank.minStreak > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 mb-2">
                          {rank.description}
                        </p>
                        <div className="text-xs text-white/60">
                          Discord Role: {rank.discordRole}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Loading skeleton
function HabitsStatsSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-24 bg-white/10 rounded" />
        <div className="h-6 w-16 bg-white/10 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-5 h-5 bg-white/10 rounded" />
              <div className="w-2 h-2 bg-white/10 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="h-8 w-12 bg-white/10 rounded" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
            <div className="mt-3 h-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-center space-y-2">
          <div className="h-4 w-48 bg-white/10 rounded mx-auto" />
          <div className="h-3 w-32 bg-white/10 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
} 