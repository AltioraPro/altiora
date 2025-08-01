"use client";

import Link from "next/link";
import { Crown, Zap, Star, ArrowRight, Shield } from "lucide-react";
import { api } from "@/trpc/client";

export function SubscriptionStatus() {
  const { data: user, isLoading } = api.auth.getCurrentUser.useQuery();

  if (isLoading || !user) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full border bg-white/10 text-white/60 border-white/20 animate-pulse">
            <div className="w-5 h-5 bg-white/20 rounded" />
            <div className="h-4 bg-white/20 rounded w-24" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-white/20 rounded w-20" />
                <div className="h-4 bg-white/20 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isPro = user.subscriptionPlan === "PRO" && user.stripeSubscriptionStatus === "active";

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full border ${
          isPro 
            ? "bg-green-400/10 text-green-400 border-green-400/30" 
            : "bg-white/10 text-white/60 border-white/20"
        }`}>
          {isPro ? (
            <>
              <Crown className="w-5 h-5" />
              <span className="font-argesta font-bold tracking-wide">PRO MEMBER</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span className="font-argesta font-bold tracking-wide">FREE PLAN</span>
            </>
          )}
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-argesta text-white/60 tracking-wide">PLAN TYPE</span>
            <span className={`font-argesta font-bold ${isPro ? "text-green-400" : "text-white"}`}>
              {isPro ? "Professional" : "Free"}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-argesta text-white/60 tracking-wide">STATUS</span>
            <span className={`font-argesta font-bold ${isPro ? "text-green-400" : "text-white/80"}`}>
              {isPro ? "Active" : "Limited Access"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-4">
        {!isPro ? (
          <Link
            href="/pricing"
            className="block w-full px-6 py-4 bg-gradient-to-r from-white to-white/90 text-black font-argesta font-bold rounded-xl text-center hover:from-white/90 hover:to-white transition-all duration-300 group"
          >
            <div className="flex items-center justify-center space-x-3">
              <Crown className="w-5 h-5" />
              <span>UPGRADE TO PRO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ) : (
          <Link
            href="/billing"
            className="block w-full px-6 py-4 bg-white/10 text-white font-argesta font-bold rounded-xl text-center hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-5 h-5" />
              <span>MANAGE SUBSCRIPTION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>

      {/* Features Comparison */}
      <div className="space-y-6">
        <h4 className="text-lg font-argesta font-bold text-white tracking-wide">FEATURES INCLUDED</h4>
        
        <div className="space-y-4">
          {/* Free Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-sm font-argesta text-white/80">Trading journal (10 entries/month)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-sm font-argesta text-white/80">Habit tracking (3 max)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-sm font-argesta text-white/80">1 annual goal + 1 quarterly</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-sm font-argesta text-white/80">Basic analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-sm font-argesta text-white/80">Community access</span>
            </div>
          </div>

          {/* Pro Features - Show if Pro or as locked */}
          {isPro ? (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Unlimited trading journal</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Unlimited habit tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Unlimited goal planning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Virtual assistant & Pomodoro</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Deep work tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Discord integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-argesta text-green-400">Priority support</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Unlimited trading journal</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Unlimited habit tracking</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Unlimited goal planning</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Virtual assistant & Pomodoro</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Deep work tracking</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Discord integration</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
                <span className="text-sm font-argesta text-white/40">Priority support</span>
                <Star className="w-3 h-3 text-white/20" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pro Benefits Highlight */}
      {!isPro && (
        <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-5 h-5 text-white/60" />
            <span className="text-sm font-argesta font-bold text-white tracking-wide">PRO BENEFITS</span>
          </div>
          <p className="text-sm text-white/70 font-argesta">
            Unlock advanced features, unlimited tracking, and exclusive Discord community access to accelerate your growth.
          </p>
        </div>
      )}
    </div>
  );
} 