"use client";

import { useState } from "react";
import { X, AlertTriangle, Crown } from "lucide-react";
import { api } from "@/trpc/client";
import Link from "next/link";

export function LimitsBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: limitsSummary } = api.subscription.getLimitsSummary.useQuery();

  if (!isVisible || !limitsSummary) return null;

  const { limits, usage, planName } = limitsSummary as typeof limitsSummary & { planName?: string };
  const isAltiorans = planName === "ALTIORANS";

  // Ne pas afficher la bannière pour les ALTIORANS
  if (isAltiorans) return null;

  const isHabitsLimitReached = usage.currentHabits >= limits.maxHabits && limits.maxHabits < 999999;
  const isTradingLimitReached = usage.monthlyTradingEntries >= limits.maxTradingEntries && limits.maxTradingEntries < 999999;
  const isGoalsLimitReached = (usage.currentAnnualGoals + usage.currentQuarterlyGoals) >= (limits.maxAnnualGoals + limits.maxQuarterlyGoals) && (limits.maxAnnualGoals + limits.maxQuarterlyGoals) < 999999;

  if (!isHabitsLimitReached && !isTradingLimitReached && !isGoalsLimitReached) {
    return null;
  }

  const getLimitInfo = () => {
    if (isHabitsLimitReached) {
      return {
        type: "habits",
        message: `You have reached the limit of ${limitsSummary.limits.maxHabits} habits for your plan.`,
        upgradeMessage: "Upgrade to Pro plan to create unlimited habits.",
        current: usage.currentHabits,
        max: limits.maxHabits
      };
    }
    if (isTradingLimitReached) {
      return {
        type: "trading",
        message: `You have reached the limit of ${limitsSummary.limits.maxTradingEntries} trading entries per month.`,
        upgradeMessage: "Upgrade to Pro plan for unlimited trading journal.",
        current: usage.monthlyTradingEntries,
        max: limits.maxTradingEntries
      };
    }
    if (isGoalsLimitReached) {
      return {
        type: "goals",
        message: `You have reached the goals limit for your plan.`,
        upgradeMessage: "Upgrade to Pro plan to create more goals.",
        current: usage.currentAnnualGoals + usage.currentQuarterlyGoals,
        max: limits.maxAnnualGoals + limits.maxQuarterlyGoals
      };
    }
    return null;
  };

  const limitInfo = getLimitInfo();
  if (!limitInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm  font-bold text-white">
                LIMIT REACHED
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-white/80 mb-3 ">
              {limitInfo.message}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60 ">
                Usage: {limitInfo.current}/{limitInfo.max >= 999999 ? "∞" : limitInfo.max}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Link
                href="/pricing"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-red-500 text-white text-sm  font-bold rounded-lg text-center hover:from-amber-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Crown className="w-4 h-4" />
                <span>UPGRADE</span>
              </Link>
            </div>
            
            <p className="text-xs text-white/60 mt-2 ">
              {limitInfo.upgradeMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}