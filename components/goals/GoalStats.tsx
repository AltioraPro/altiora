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
    <div className="bg-black/20 border border-white/10 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">
          Monthly Performance
        </h3>
        <p className="text-white/60 text-sm">
          Track your progress
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <Target className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {animatedStats.total}
          </p>
          <p className="text-xs text-white/60">Total</p>
        </div>

        {/* Active Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {animatedStats.active}
          </p>
          <p className="text-xs text-white/60">Active</p>
        </div>

        {/* Completed Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {animatedStats.completed}
          </p>
          <p className="text-xs text-white/60">Done</p>
        </div>

        {/* Overdue Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {animatedStats.overdue}
          </p>
          <p className="text-xs text-white/60">Late</p>
        </div>
      </div>

      {/* Success Rate Section */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/60 mb-1">Success Rate</p>
            <p className={`text-2xl font-bold ${getCompletionRateColor(animatedStats.completionRate)}`}>
              {animatedStats.completionRate}%
            </p>
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <div className="text-white">
              {getCompletionRateIcon(animatedStats.completionRate)}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-white/60 transition-all duration-1000 ease-out"
            style={{ width: `${animatedStats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <div className="mt-4 p-3 bg-black/20 border border-white/10 rounded-lg">
        <p className="text-white/70 text-xs text-center">
          {getCompletionRateMessage(animatedStats.completionRate)}
        </p>
      </div>
    </div>
  );
} 