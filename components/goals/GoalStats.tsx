"use client";

import React from "react";

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
  // Affichage direct sans animation
  const animatedStats = stats;

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "text-white";
    if (rate >= 60) return "text-white/90";
    if (rate >= 40) return "text-white/70";
    return "text-white/50";
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
        <h3 className="text-base font-semibold text-white mb-1">
          Monthly Performance
        </h3>
        <p className="text-white/60 text-xs">
          Track your progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <p className="text-xl font-bold text-white mb-1">
            {animatedStats.total}
          </p>
          <p className="text-xs text-white/60">Total</p>
        </div>

        {/* Active Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <p className="text-xl font-bold text-white mb-1">
            {animatedStats.active}
          </p>
          <p className="text-xs text-white/60">Active</p>
        </div>

        {/* Completed Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <p className="text-xl font-bold text-white mb-1">
            {animatedStats.completed}
          </p>
          <p className="text-xs text-white/60">Done</p>
        </div>

        {/* Overdue Goals */}
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <p className="text-xl font-bold text-white mb-1">
            {animatedStats.overdue}
          </p>
          <p className="text-xs text-white/60">Late</p>
        </div>
      </div>

      {/* Success Rate Section */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-4">
        <div className="mb-4">
          <p className="text-xs text-white/60 mb-1">Success Rate</p>
          <p className={`text-xl font-bold ${getCompletionRateColor(animatedStats.completionRate)}`}>
            {animatedStats.completionRate}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white/60"
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