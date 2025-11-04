"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, Trophy, Calendar, Star, Crown, Info, X, Zap, Shield, Sparkles } from "lucide-react";
import { useHabits } from "./HabitsProvider";
import type { HabitStatsOverview } from "@/server/api/routers/habits/types";

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

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix: string;
  color: string;
  showPulse?: boolean;
}

export function HabitsStats({ data, todayHabits }: HabitsStatsProps) {
  const { getOptimisticStats, optimisticUpdates } = useHabits();
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);


  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRankModalOpen) {
        setIsRankModalOpen(false);
      }
    };

    if (isRankModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isRankModalOpen]);


  const optimisticTodayHabits = todayHabits?.map(habit => ({
    ...habit,
    isCompleted: optimisticUpdates[habit.id] ?? habit.isCompleted
  })) ?? [];


  const todayCompletedHabits = optimisticTodayHabits.filter(h => h.isCompleted).length;
  const todayTotalHabits = optimisticTodayHabits.length;
  const todayCompletionRate = todayTotalHabits > 0 ? Math.round((todayCompletedHabits / todayTotalHabits) * 100) : 0;
  const willContinueStreak = todayCompletedHabits > 0;


  const optimisticData = getOptimisticStats(data, optimisticTodayHabits);


  const totalActiveHabits = optimisticData?.totalActiveHabits ?? todayTotalHabits;
  const averageCompletionRate = optimisticData?.averageCompletionRate ?? todayCompletionRate;
  const optimisticCurrentStreak = optimisticData?.currentStreak ?? (willContinueStreak ? 1 : 0);
  const longestStreak = optimisticData?.longestStreak ?? optimisticCurrentStreak;




  const rankSystem: RankInfo[] = [
    {
      name: "NEW",
      icon: Target,
      color: "text-white/40",
      bgColor: "bg-white/5",
      borderColor: "border-white/10",
      minStreak: 0,
      description: "Ready to start your personal transformation",
      discordRole: "New",
      benefits: ["Discord server access", "Community support"]
    },
    {
      name: "BEGINNER",
      icon: Target,
      color: "text-white/60",
      bgColor: "bg-white/5",
      borderColor: "border-white/20",
      minStreak: 1,
      description: "1+ day with at least one habit validated",
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
      description: "3+ consecutive days - Building momentum",
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
      description: "7+ consecutive days - Champion of daily discipline",
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
      description: "14+ consecutive days - Recognized productivity expert",
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
      description: "30+ consecutive days - Living legend of discipline",
      discordRole: "Legend",
      benefits: ["Legendary Discord role", "Exclusive access to all content", "Moderator status", "VIP event invitations"]
    },
    {
      name: "MASTER",
      icon: Zap,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      minStreak: 90,
      description: "90+ consecutive days - Master of consistency and discipline",
      discordRole: "Master",
      benefits: ["Master Discord role", "Exclusive masterclasses", "Personal coaching sessions", "Priority support", "Custom Discord badge"]
    },
    {
      name: "GRANDMASTER",
      icon: Shield,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      minStreak: 180,
      description: "180+ consecutive days - Grand master of productivity",
      discordRole: "Grandmaster",
      benefits: ["Grandmaster Discord role", "Total access pass", "Personal mentor status", "Exclusive events", "Custom profile features", "Direct access to founders"]
    },
    {
      name: "IMMORTAL",
      icon: Sparkles,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
      minStreak: 365,
      description: "365+ consecutive days - Immortal legend of excellence",
      discordRole: "Immortal",
      benefits: ["Immortal Discord role", "Legendary status", "All features", "Personal consultation", "Exclusive merchandise", "Founders circle access", "Custom integrations"]
    }
  ];


  // Find current rank - get the highest rank the user has achieved
  const currentRank = rankSystem
    .filter(rank => optimisticCurrentStreak >= rank.minStreak)
    .sort((a, b) => b.minStreak - a.minStreak)[0] || rankSystem[0]!;

  const nextRank = rankSystem.find(rank => rank.minStreak > optimisticCurrentStreak);
  const daysToNextRank = nextRank ? nextRank.minStreak - optimisticCurrentStreak : 0;

  const stats: StatItem[] = [
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
      value: optimisticCurrentStreak,
      suffix: "d",
      color: optimisticCurrentStreak >= 7 ? "text-green-400" : optimisticCurrentStreak >= 3 ? "text-white" : "text-white/70",
      showPulse: willContinueStreak && optimisticCurrentStreak > 0,
    },
    {
      icon: Trophy,
      label: "BEST SERIES",
      value: longestStreak,
      suffix: "d",
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

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-6">

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold  tracking-tight">
              STATISTICS
            </h3>


            <button
              onClick={() => setIsRankModalOpen(true)}
              className={`flex items-center space-x-2 ${currentRank.bgColor} border ${currentRank.borderColor} rounded-lg px-3 py-1 hover:scale-105 transition-all duration-200 group`}
            >
              <currentRank.icon className={`w-4 h-4 ${currentRank.color} group-hover:scale-110 transition-transform`} />
              <span className={`text-xs  ${currentRank.color}`}>
                {currentRank.name}
              </span>
              <Info className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors animate-pulse" />
            </button>
          </div>


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
                    {stat.label === "CURRENT SERIES" && (optimisticCurrentStreak >= 7 || stat.showPulse) && (
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
                    <div className={`text-2xl font-bold  ${stat.color} transition-colors`}>
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs text-white/60 ">
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
              {optimisticCurrentStreak >= 7 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 ">
                    {optimisticCurrentStreak >= 365
                      ? `${optimisticCurrentStreak} consecutive days! Immortal consistency!`
                      : optimisticCurrentStreak >= 180
                        ? `${optimisticCurrentStreak} consecutive days! Grandmaster level!`
                        : optimisticCurrentStreak >= 90
                          ? `${optimisticCurrentStreak} consecutive days! Master level!`
                          : optimisticCurrentStreak >= 30
                            ? `${optimisticCurrentStreak} consecutive days! Legendary consistency!`
                            : optimisticCurrentStreak >= 14
                              ? `${optimisticCurrentStreak} consecutive days! You're becoming an expert!`
                              : `${optimisticCurrentStreak} consecutive days! Excellent work!`
                    }
                  </span>
                </div>
              )}

              {averageCompletionRate >= 80 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 ">
                    Excellent completion rate! You&apos;re very consistent.
                  </span>
                </div>
              )}

              {optimisticCurrentStreak < 3 && totalActiveHabits > 0 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/60 ">
                    Keep going! Validate at least one habit every day to build your streak.
                  </span>
                </div>
              )}

              {optimisticCurrentStreak === 0 && totalActiveHabits > 0 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-blue-400 ">
                    Validate at least one habit today to start your streak!
                  </span>
                </div>
              )}

              {/* Optimistic message for streak continuation */}
              {willContinueStreak && optimisticCurrentStreak > 0 && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 ">
                    ✅ {todayCompletedHabits} validated - Your streak continues!
                  </span>
                </div>
              )}

              {/* Current rank display */}
              <div className="flex items-center space-x-3 text-sm">
                <currentRank.icon className={`w-4 h-4 ${currentRank.color}`} />
                <span className={`${currentRank.color}`}>
                  Current rank: {currentRank.name} ({optimisticCurrentStreak} days)
                </span>
              </div>

              {/* Rank-specific messages */}
              {currentRank.name === "IMMORTAL" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-400 ">
                    You&apos;re an immortal legend! Your discipline transcends time.
                  </span>
                </div>
              )}

              {currentRank.name === "GRANDMASTER" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 ">
                    Grandmaster status! You&apos;re a master of life and productivity.
                  </span>
                </div>
              )}

              {currentRank.name === "MASTER" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 ">
                    Master level achieved! Your consistency is legendary.
                  </span>
                </div>
              )}

              {currentRank.name === "LEGEND" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 ">
                    You&apos;re a true legend! Your discipline is unmatched.
                  </span>
                </div>
              )}

              {currentRank.name === "EXPERT" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 ">
                    Expert level achieved! You&apos;re mastering your habits.
                  </span>
                </div>
              )}

              {currentRank.name === "CHAMPION" && (
                <div className="flex items-center space-x-3 text-sm">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 ">
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
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsRankModalOpen(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold ">
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
                  <h3 className={`text-lg font-bold  ${currentRank.color}`}>
                    YOUR CURRENT RANK: {currentRank.name}
                  </h3>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {currentRank.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-white/60">Discord Role:</span>
                    <span className={` ${currentRank.color}`}>
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
                  <h3 className="text-lg font-bold  mb-3">
                    NEXT RANK: {nextRank.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Progress:</span>
                      <span className="text-white">
                        {optimisticCurrentStreak} / {nextRank.minStreak} days
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${nextRank.color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.min((optimisticCurrentStreak / nextRank.minStreak) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-white/60">
                        {daysToNextRank === 1
                          ? "Only 1 consecutive day to become " + nextRank.name
                          : `Only ${daysToNextRank} consecutive days to become ${nextRank.name}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* All Ranks */}
              <div>
                <h3 className="text-lg font-bold  mb-4">
                  ALL RANKS
                </h3>
                <div className="space-y-3">
                  {rankSystem.map((rank) => {
                    const RankIcon = rank.icon;
                    const isCurrentRank = rank.name === currentRank.name;
                    const isUnlocked = optimisticCurrentStreak >= rank.minStreak;

                    return (
                      <div
                        key={rank.name}
                        className={`border rounded-xl p-4 transition-all duration-200 ${isCurrentRank
                          ? `${rank.bgColor} ${rank.borderColor}`
                          : isUnlocked
                            ? "bg-white/5 border-white/20"
                            : "bg-white/5 border-white/10 opacity-50"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <RankIcon className={`w-5 h-5 ${rank.color}`} />
                            <span className={` font-medium ${rank.color}`}>
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

