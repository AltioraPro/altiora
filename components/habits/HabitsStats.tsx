"use client";

import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import type { HabitStatsOverview } from "@/server/api/routers/habits/types";

interface HabitsStatsProps {
  data?: HabitStatsOverview;
}

export function HabitsStats({ data }: HabitsStatsProps) {
  if (!data) {
    return <HabitsStatsSkeleton />;
  }

  const {
    totalActiveHabits,
    currentStreak,
    longestStreak,
    averageCompletionRate,
  } = data;

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
    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-argesta tracking-tight">
            STATISTICS
          </h3>
          
          {/* Achievement Badge */}
          {currentStreak >= 7 && (
            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-xs font-argesta text-green-400">
                {currentStreak >= 30 ? "LEGEND" : currentStreak >= 14 ? "EXPERT" : "CHAMPION"}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
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
                </div>
                
                <div className="space-y-1">
                  <div className={`text-2xl font-bold font-argesta ${stat.color} transition-colors`}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-white/60 font-argesta">
                    {stat.label}
                  </div>
                </div>
                
                {/* Progress indicators */}
                {stat.label === "AVERAGE RATE" && (
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          averageCompletionRate >= 80 ? "bg-green-400" : 
                          averageCompletionRate >= 60 ? "bg-white" : "bg-white/50"
                        }`}
                        style={{ width: `${averageCompletionRate}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {stat.label === "CURRENT SERIES" && (
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          currentStreak >= 14 ? "bg-yellow-400" :
                          currentStreak >= 7 ? "bg-green-400" : "bg-white/50"
                        }`}
                        style={{ 
                          width: `${Math.min((currentStreak / 30) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Motivational Message */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center space-y-2">
            {currentStreak === 0 ? (
              <p className="text-white/60 text-sm font-argesta">
                Start your streak today!
              </p>
            ) : currentStreak < 7 ? (
              <p className="text-white/60 text-sm font-argesta">
                Only {7 - currentStreak} day{7 - currentStreak > 1 ? 's' : ''} left to become Champion!
              </p>
            ) : currentStreak < 14 ? (
              <p className="text-green-400 text-sm font-argesta">
                🔥 On fire! Only {14 - currentStreak} day{14 - currentStreak > 1 ? 's' : ''} left to become Expert
              </p>
            ) : currentStreak < 30 ? (
              <p className="text-green-400 text-sm font-argesta">
                ⚡ Impressive! Only {30 - currentStreak} day{30 - currentStreak > 1 ? 's' : ''} left to become Legend
              </p>
            ) : (
              <p className="text-yellow-400 text-sm font-argesta">
                👑 LEGEND! You are a model of discipline
              </p>
            )}
            
            {averageCompletionRate >= 90 && (
              <p className="text-white/50 text-xs font-argesta">
                Exceptional success rate
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
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
      
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
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