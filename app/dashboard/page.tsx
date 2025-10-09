"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/trpc/client";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, CheckSquare, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { HabitsProvider, useHabits } from "@/components/habits/HabitsProvider";
import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import SpotlightCard from "@/components/SpotlightCard";

function OnboardingContent() {
  const router = useRouter();
  const utils = api.useUtils();
  const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] = useState(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);

  const createJournalMutation = api.trading.createJournal.useMutation();
  const createTradeMutation = api.trading.createTrade.useMutation();
  const createGoalMutation = api.goals.create.useMutation();

  const handleJournalSuccess = () => {
    setIsCreateJournalModalOpen(false);
    router.push('/trading/journals');
  };

  const handleGoalSuccess = () => {
    setIsCreateGoalModalOpen(false);
    router.push('/goals');
  };

  const handleGenerateJournalExample = async () => {
    setIsGeneratingJournal(true);
    try {
      // Create demo journal
      const journal = await createJournalMutation.mutateAsync({
        name: "Demo Trading Journal",
        description: "Example journal with sample trades to help you get started",
        startingCapital: "10000",
        usePercentageCalculation: true,
      });

      // Create sample trades
      const sampleTrades = [
        {
          tradeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          symbol: "EURUSD",
          profitLossPercentage: "2.5",
          notes: "Perfect setup, clean breakout with strong momentum",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          symbol: "GBPUSD",
          profitLossPercentage: "-1.0",
          notes: "Stopped out early, market conditions changed",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          symbol: "USDJPY",
          profitLossPercentage: "1.8",
          notes: "Good entry, patience paid off",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          symbol: "AUDUSD",
          profitLossPercentage: "3.2",
          notes: "Excellent risk/reward ratio on this one",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          symbol: "EURJPY",
          profitLossPercentage: "-0.8",
          notes: "Small loss, cut quickly when setup invalidated",
          isClosed: true,
          journalId: journal.id,
        },
      ];

      for (const trade of sampleTrades) {
        await createTradeMutation.mutateAsync(trade);
      }

      // Invalidate all trading-related queries
      await Promise.all([
        utils.trading.getJournals.invalidate(),
        utils.trading.getTrades.invalidate(),
        utils.trading.getStats.invalidate(),
      ]);

      // Wait a bit for cache to update
      await new Promise(resolve => setTimeout(resolve, 300));

      router.push('/trading/journals');
    } catch (error) {
      console.error('Error generating journal example:', error);
    } finally {
      setIsGeneratingJournal(false);
    }
  };

  const handleGenerateGoalExample = async () => {
    setIsGeneratingGoal(true);
    try {
      const sampleGoals = [
        {
          title: "Achieve 60% Win Rate",
          description: "Improve trading consistency by focusing on quality setups and proper risk management. Track progress weekly and adjust strategy as needed.",
          type: "quarterly" as const,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          reminderFrequency: "weekly" as const,
        },
        {
          title: "Build $10k Trading Capital",
          description: "Grow trading account from $5k to $10k through consistent profits and disciplined risk management. Focus on 1-2% risk per trade.",
          type: "annual" as const,
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          reminderFrequency: "monthly" as const,
        },
      ];

      for (const goal of sampleGoals) {
        await createGoalMutation.mutateAsync(goal);
      }

      // Invalidate all goal-related queries
      await Promise.all([
        utils.goals.getAll.invalidate(),
        utils.goals.getPaginated.invalidate(),
        utils.goals.getStats.invalidate(),
        utils.goals.getAllGoalLimits.invalidate(),
      ]);

      // Wait a bit for cache to update
      await new Promise(resolve => setTimeout(resolve, 300));

      router.push('/goals');
    } catch (error) {
      console.error('Error generating goal example:', error);
    } finally {
      setIsGeneratingGoal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-argesta text-white mb-3 font-bold">Welcome to Altiora!</h1>
          <p className="text-white/50 text-base">Create your first journal, habit, or goal to start building your knowledge base.</p>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-white/50" />
            <h2 className="text-lg font-semibold text-white/90">Get Started</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Journal Card */}
            <SpotlightCard className="p-0 border border-white/10 group">
              <div className="p-6 h-full flex flex-col">
                <div className="mb-6 h-48 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-grid-white/[0.02]" />
                  
                  {/* Floating journal cards */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="relative w-full h-full">
                      {/* Back card */}
                      <div className="absolute top-2 left-4 w-32 h-40 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 shadow-xl transform rotate-[-8deg] transition-all duration-500 group-hover:rotate-[-12deg] group-hover:translate-x-[-4px]" />
                      
                      {/* Middle card */}
                      <div className="absolute top-1 left-12 w-32 h-40 bg-gradient-to-br from-white/15 to-white/5 rounded-lg border border-white/30 shadow-xl transform rotate-[-2deg] transition-all duration-500 group-hover:rotate-[-4deg] group-hover:translate-y-[-2px]">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                            <div className="h-2 bg-white/30 rounded flex-1 transition-all duration-300 group-hover:bg-white/40" />
                          </div>
                          <div className="h-1.5 bg-white/20 rounded w-3/4 transition-all duration-300 group-hover:bg-white/30" />
                          <div className="h-1.5 bg-white/20 rounded w-1/2 transition-all duration-300 group-hover:bg-white/30" />
                          <div className="mt-3 space-y-1.5">
                            <div className="h-1 bg-white/15 rounded transition-all duration-300 group-hover:bg-white/25" />
                            <div className="h-1 bg-white/15 rounded w-5/6 transition-all duration-300 group-hover:bg-white/25" />
                            <div className="h-1 bg-white/15 rounded w-4/6 transition-all duration-300 group-hover:bg-white/25" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Front card */}
                      <div className="absolute top-0 left-20 w-32 h-40 bg-gradient-to-br from-white/20 to-white/10 rounded-lg border border-white/40 shadow-2xl transform rotate-[4deg] transition-all duration-500 group-hover:rotate-[8deg] group-hover:translate-x-[4px] group-hover:translate-y-[-4px] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-blue-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                              <div className="h-2 bg-white/40 rounded w-12 transition-all duration-300 group-hover:bg-white/50" />
                            </div>
                            <div className="text-[8px] text-white/60 transition-all duration-300 group-hover:text-green-400 group-hover:font-semibold">+2.5%</div>
                          </div>
                          <div className="h-1.5 bg-white/25 rounded w-2/3 transition-all duration-300 group-hover:bg-white/35" />
                          <div className="mt-3 pt-2 border-t border-white/20 transition-all duration-300 group-hover:border-white/30">
                            <div className="space-y-1">
                              <div className="h-1 bg-white/20 rounded transition-all duration-300 group-hover:bg-white/30" />
                              <div className="h-1 bg-white/20 rounded w-4/5 transition-all duration-300 group-hover:bg-white/30" />
                              <div className="h-1 bg-white/20 rounded w-3/5 transition-all duration-300 group-hover:bg-white/30" />
                            </div>
                          </div>
                          <div className="mt-2 flex gap-1">
                            <div className="h-1 w-1 rounded-full bg-purple-400/60 transition-all duration-300 group-hover:bg-purple-400 group-hover:shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                            <div className="h-1 w-1 rounded-full bg-blue-400/60 transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                            <div className="h-1 w-1 rounded-full bg-pink-400/60 transition-all duration-300 group-hover:bg-pink-400 group-hover:shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">Create a Journal</h3>
                <p className="text-white/60 text-sm mb-6 flex-1 leading-relaxed">
                  Create your first trading journal to start building your performance knowledge base.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setIsCreateJournalModalOpen(true)}
                    className="bg-white text-black hover:bg-gray-100 font-medium shadow-lg"
                    disabled={isGeneratingJournal}
                  >
                    + Create Journal
                  </Button>
                  <button
                    onClick={handleGenerateJournalExample}
                    disabled={isGeneratingJournal}
                    className="text-white/50 hover:text-white/70 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingJournal ? 'Generating...' : 'Generate example'}
                  </button>
                </div>
              </div>
            </SpotlightCard>

            {/* Create Habit Card */}
            <HabitCardWithProvider />

            {/* Create Goal Card */}
            <SpotlightCard className="p-0 border border-white/10 group">
              <div className="p-6 h-full flex flex-col">
                <div className="mb-6 h-48 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-grid-white/[0.02]" />
                  
                  {/* Goal list mockup */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="w-full max-w-[200px] space-y-3">
                      {/* Goal item 1 - Completed */}
                      <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-lg p-3 border border-white/30 shadow-lg transition-all duration-500 group-hover:translate-x-[-2px] group-hover:shadow-xl">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded border-2 border-green-400 bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                            <CheckSquare className="w-2.5 h-2.5 text-green-400" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-white/30 rounded w-3/4 transition-all duration-300 group-hover:bg-white/40" />
                            <div className="h-1 bg-white/15 rounded w-full transition-all duration-300 group-hover:bg-white/25" />
                            <div className="flex items-center gap-1 mt-2">
                              <div className="h-1 bg-green-400 rounded-full transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.4)]" style={{ width: '75%' }} />
                              <div className="text-[7px] text-green-400 transition-all duration-300 group-hover:font-semibold">75%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Goal item 2 - In Progress */}
                      <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-lg p-3 border border-white/40 shadow-xl transform scale-105 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:border-blue-400/50">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded border-2 border-blue-400 flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-blue-400/20 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-white/40 rounded w-4/5 transition-all duration-300 group-hover:bg-white/50" />
                            <div className="h-1 bg-white/20 rounded w-full transition-all duration-300 group-hover:bg-white/30" />
                            <div className="flex items-center gap-1 mt-2">
                              <div className="h-1 bg-blue-400 rounded-full transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.4)]" style={{ width: '45%' }} />
                              <div className="h-1 bg-white/20 rounded-full transition-all duration-300 group-hover:bg-white/30" style={{ width: '55%' }} />
                              <div className="text-[7px] text-blue-400 transition-all duration-300 group-hover:font-semibold">45%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Goal item 3 - Not Started */}
                      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 border border-white/25 shadow-md transition-all duration-500 group-hover:translate-x-[2px] group-hover:border-white/35">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded border-2 border-white/40 flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:border-white/60" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-white/25 rounded w-2/3 transition-all duration-300 group-hover:bg-white/35" />
                            <div className="h-1 bg-white/15 rounded w-5/6 transition-all duration-300 group-hover:bg-white/25" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">Create a Goal</h3>
                <p className="text-white/60 text-sm mb-6 flex-1 leading-relaxed">
                  Create your first goal to start building your objectives knowledge base.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setIsCreateGoalModalOpen(true)}
                    className="bg-white text-black hover:bg-gray-100 font-medium shadow-lg"
                    disabled={isGeneratingGoal}
                  >
                    + Create Goal
                  </Button>
                  <button
                    onClick={handleGenerateGoalExample}
                    disabled={isGeneratingGoal}
                    className="text-white/50 hover:text-white/70 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingGoal ? 'Generating...' : 'Generate example'}
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Discord Connection */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-2">
            Connect your Discord account for notifications and reminders
          </p>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30">
              Connect Discord
            </Button>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <CreateJournalModal
        isOpen={isCreateJournalModalOpen}
        onClose={() => setIsCreateJournalModalOpen(false)}
        onSuccess={handleJournalSuccess}
      />

      <CreateGoalModal
        isOpen={isCreateGoalModalOpen}
        onClose={() => setIsCreateGoalModalOpen(false)}
        onSuccess={handleGoalSuccess}
      />
    </div>
  );
}

function HabitCardWithProvider() {
  const router = useRouter();
  const utils = api.useUtils();
  const [isGeneratingHabit, setIsGeneratingHabit] = useState(false);

  const createHabitMutation = api.habits.create.useMutation();

  const handleHabitSuccess = () => {
    router.push('/habits');
  };

  const handleGenerateHabitExample = async () => {
    setIsGeneratingHabit(true);
    try {
      const sampleHabits = [
        {
          title: "Morning Trading Routine",
          emoji: "🌅",
          description: "Review markets, check news, and plan trading day",
          color: "#3b82f6",
        },
        {
          title: "Journal Review",
          emoji: "📝",
          description: "Review and analyze today's trades",
          color: "#8b5cf6",
        },
        {
          title: "Exercise 30min",
          emoji: "💪",
          description: "Stay physically active for mental clarity",
          color: "#22c55e",
        },
      ];

      for (const habit of sampleHabits) {
        await createHabitMutation.mutateAsync(habit);
      }

      // Invalidate all habit-related queries
      await Promise.all([
        utils.habits.getAll.invalidate(),
        utils.habits.getDashboard.invalidate(),
        utils.subscription.getLimitsSummary.invalidate(),
      ]);

      // Wait a bit for cache to update
      await new Promise(resolve => setTimeout(resolve, 300));

      router.push('/habits');
    } catch (error) {
      console.error('Error generating habit examples:', error);
    } finally {
      setIsGeneratingHabit(false);
    }
  };

  return (
    <HabitsProvider>
      <HabitCard
        isGenerating={isGeneratingHabit}
        onGenerateExample={handleGenerateHabitExample}
      />
      <CreateHabitModal onSuccess={handleHabitSuccess} />
    </HabitsProvider>
  );
}

function HabitCard({ isGenerating, onGenerateExample }: { isGenerating: boolean; onGenerateExample: () => void }) {
  const { openCreateModal } = useHabits();

  return (
    <SpotlightCard className="p-0 border border-white/10 group">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6 h-48 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          
          {/* Habit tracker calendar */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="space-y-3">
              {/* Week days header */}
              <div className="flex gap-1 justify-center mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="w-7 h-5 flex items-center justify-center">
                    <span className="text-[8px] text-white/40">{day}</span>
                  </div>
                ))}
              </div>
              
              {/* Week 1 */}
              <div className="flex gap-1 justify-center">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-white/10 border border-white/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30" />
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-white/10 border border-white/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30" />
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
              </div>
              
              {/* Week 2 */}
              <div className="flex gap-1 justify-center">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-white/10 border border-white/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30" />
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
              </div>

              {/* Week 3 */}
              <div className="flex gap-1 justify-center">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-green-400/30 to-green-500/30 border border-green-400/50 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] group-hover:scale-110">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <div className="w-7 h-7 rounded bg-white/10 border border-white/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30" />
                <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-400/40 to-blue-500/40 border-2 border-blue-400 flex items-center justify-center shadow-xl transform scale-110 transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_16px_rgba(96,165,250,0.6)] group-hover:border-blue-300">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20" />
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20" />
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20" />
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20" />
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-white font-semibold text-lg mb-3">Create a Habit</h3>
        <p className="text-white/60 text-sm mb-6 flex-1 leading-relaxed">
          Create your first habit to start building your daily routine knowledge base.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-white text-black hover:bg-gray-100 font-medium shadow-lg"
            disabled={isGenerating}
          >
            + Create Habit
          </Button>
          <button
            onClick={onGenerateExample}
            disabled={isGenerating}
            className="text-white/50 hover:text-white/70 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate example'}
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function GlobalDashboardPage() {
  useSession();
  const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: journals, isLoading: journalsLoading } = api.trading.getJournals.useQuery();

  const effectiveJournalIds = selectedJournalIds.length > 0 ? selectedJournalIds : undefined;

  const { data: stats } = api.trading.getStats.useQuery({
    journalIds: effectiveJournalIds
  });
  const { data: allTrades } = api.trading.getTrades.useQuery({
    journalIds: effectiveJournalIds
  });

  const { data: sessions } = api.trading.getSessions.useQuery({
    journalIds: effectiveJournalIds
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleJournalToggle = (journalId: string) => {
    if (selectedJournalIds.includes(journalId)) {
      setSelectedJournalIds(selectedJournalIds.filter(id => id !== journalId));
    } else {
      setSelectedJournalIds([...selectedJournalIds, journalId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedJournalIds.length === 0) {
      setSelectedJournalIds(journals?.map(j => j.id) || []);
    } else {
      setSelectedJournalIds([]);
    }
  };

  if (journalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return <OnboardingContent />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Link href="/trading/journals">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Journals
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-argesta text-white font-bold">Global Dashboard</h1>
          <p className="text-sm sm:text-base text-white/60">
            Overview of all your statistics. Select journals to filter.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between px-4 py-2 border border-white/15 bg-black/40 text-white/80 rounded-lg hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-200 w-full sm:min-w-[200px]"
            >
              <span className="text-sm font-medium">
                {selectedJournalIds.length === 0 && "All journals"}
                {selectedJournalIds.length === 1 && journals?.find(j => j.id === selectedJournalIds[0])?.name}
                {selectedJournalIds.length > 1 && `${selectedJournalIds.length} journals selected`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto backdrop-blur-sm">
                <div className="p-3 space-y-1">
                  <div
                    onClick={handleSelectAll}
                    className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedJournalIds.length === journals?.length}
                      className="bg-black/50 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <span className="text-white text-sm font-medium">All journals</span>
                  </div>

                  {journals?.map((journal) => (
                    <div
                      key={journal.id}
                      onClick={() => handleJournalToggle(journal.id)}
                      className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedJournalIds.includes(journal.id)}
                        className="bg-black/50 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                      <span className="text-white text-sm">{journal.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedJournalIds.length > 0 && (
            <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/20">
              <span className="text-white/80 text-sm font-medium">
                {selectedJournalIds.length} journal{selectedJournalIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <GlobalTradingStats stats={stats} />
        </div>
      )}


      {/* Charts */}
      {stats && sessions && allTrades && (
        <div className="mb-8">
          <Card className="border border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Charts</CardTitle>
              <CardDescription className="text-white/60">Visual analysis of your overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalTradingCharts sessions={sessions} trades={allTrades} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trade creation/import modals removed on global dashboard */}

      <DiscordWelcomeChecker />
    </div>
  );
}
