"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Target, Calendar, CheckCircle, Zap, Award, Clock, BarChart3 } from "lucide-react";

interface GoalStatsProps {
  stats: {
    total: number;
    completed: number;
    overdue: number;
    active: number;
    completionRate: number;
  };
}

export function GoalStats({ stats }: GoalStatsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    active: 0,
    completionRate: 0,
  });

  // Animation des chiffres
  useEffect(() => {
    const duration = 1500;
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
      animateValue(0, stats.total, (value) => setAnimatedStats(prev => ({ ...prev, total: value }))),
      animateValue(0, stats.completed, (value) => setAnimatedStats(prev => ({ ...prev, completed: value }))),
      animateValue(0, stats.overdue, (value) => setAnimatedStats(prev => ({ ...prev, overdue: value }))),
      animateValue(0, stats.active, (value) => setAnimatedStats(prev => ({ ...prev, active: value }))),
      animateValue(0, stats.completionRate, (value) => setAnimatedStats(prev => ({ ...prev, completionRate: value }))),
    ];

    return () => timers.forEach(timer => clearInterval(timer));
  }, [stats]);

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "text-white";
    if (rate >= 60) return "text-white/90";
    if (rate >= 40) return "text-white/70";
    return "text-white/50";
  };

  const getCompletionRateIcon = (rate: number) => {
    if (rate >= 80) return <Award className="w-5 h-5" />;
    if (rate >= 60) return <TrendingUp className="w-5 h-5" />;
    if (rate >= 40) return <BarChart3 className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getCompletionRateMessage = (rate: number) => {
    if (rate >= 80) return "Exceptional performance!";
    if (rate >= 60) return "Great momentum!";
    if (rate >= 40) return "Steady progress.";
    return "Room for growth.";
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background avec effet de profondeur */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent rounded-xl" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl">
        {/* Header compact */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg blur-sm" />
          <div className="relative bg-white/[0.05] border border-white/10 rounded-lg p-3">
            <h3 className="text-lg font-bold text-white tracking-wide font-argesta">
              Monthly Performance
            </h3>
            <p className="text-white/60 text-xs mt-1">
              Track your progress
            </p>
          </div>
        </div>
        
        {/* Stats Grid compact */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Goals */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
            <div className="relative bg-white/[0.05] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
                {animatedStats.total}
              </p>
              <p className="text-xs text-white/60 text-center font-medium">Total</p>
            </div>
          </div>

          {/* Active Goals */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
            <div className="relative bg-white/[0.05] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
                {animatedStats.active}
              </p>
              <p className="text-xs text-white/60 text-center font-medium">Active</p>
            </div>
          </div>

          {/* Completed Goals */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
            <div className="relative bg-white/[0.05] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
                {animatedStats.completed}
              </p>
              <p className="text-xs text-white/60 text-center font-medium">Done</p>
            </div>
          </div>

          {/* Overdue Goals */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
            <div className="relative bg-white/[0.05] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-lg mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold text-white text-center mb-1 tracking-tight">
                {animatedStats.overdue}
              </p>
              <p className="text-xs text-white/60 text-center font-medium">Late</p>
            </div>
          </div>
        </div>

        {/* Completion Rate Section compact */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.01] to-transparent rounded-lg" />
          <div className="relative bg-white/[0.03] border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-white/60 font-medium mb-1 font-argesta">Success Rate</p>
                <p className={`text-2xl font-bold ${getCompletionRateColor(animatedStats.completionRate)} tracking-tight`}>
                  {animatedStats.completionRate}%
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-full border border-white/10">
                <div className="text-white/80">
                  {getCompletionRateIcon(animatedStats.completionRate)}
                </div>
              </div>
            </div>
            
            {/* Progress Bar compact */}
            <div className="relative">
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-full" />
                <div 
                  className="relative h-2 rounded-full bg-gradient-to-r from-white/60 via-white/40 to-white/20 transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${animatedStats.completionRate}%`,
                    boxShadow: `0 0 10px rgba(255, 255, 255, ${animatedStats.completionRate / 100 * 0.3})`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'encouragement compact */}
        <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
          <p className="text-white/70 text-xs font-medium text-center">
            {getCompletionRateMessage(animatedStats.completionRate)}
          </p>
        </div>
      </div>
    </div>
  );
} 