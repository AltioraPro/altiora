"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckSquare, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import { HabitsProvider, useHabits } from "@/components/habits/HabitsProvider";
import SpotlightCard from "@/components/SpotlightCard";
import { CreateJournalModal } from "@/components/trading/CreateJournalModal";
import { GlobalTradingCharts } from "@/components/trading/GlobalTradingCharts";
import { GlobalTradingStats } from "@/components/trading/GlobalTradingStats";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";

function OnboardingContent() {
    const router = useRouter();

    const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] =
        useState(false);
    const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
    const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
    const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);

    const createJournalMutation = useMutation(
        orpc.trading.createJournal.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getJournals.queryKey({ input: {} }),
                    orpc.trading.getTrades.queryKey({ input: {} }),
                    orpc.trading.getStats.queryKey({ input: {} }),
                ],
            },
        })
    );

    const { mutateAsync: createTrade } = useMutation(
        orpc.trading.createTrade.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getTrades.queryKey({ input: {} }),
                    orpc.trading.getStats.queryKey({ input: {} }),
                ],
            },
        })
    );

    const { mutateAsync: createGoal } = useMutation(
        orpc.goals.create.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.goals.getPaginated.queryKey({ input: {} }),
                    orpc.goals.getStats.queryKey({ input: {} }),
                    orpc.goals.getAll.queryKey({ input: {} }),
                ],
            },
        })
    );

    const handleJournalSuccess = () => {
        setIsCreateJournalModalOpen(false);
        router.push("/trading/journals");
    };

    const handleGoalSuccess = () => {
        setIsCreateGoalModalOpen(false);
        router.push("/goals");
    };

    const handleGenerateJournalExample = async () => {
        setIsGeneratingJournal(true);
        try {
            const journal = await createJournalMutation.mutateAsync({
                name: "Demo Trading Journal",
                description:
                    "Example journal with sample trades to help you get started",
                startingCapital: "10000",
                usePercentageCalculation: true,
            });

            const sampleTrades = [
                {
                    tradeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    symbol: "EURUSD",
                    profitLossPercentage: "2.5",
                    notes: "Perfect setup, clean breakout with strong momentum",
                    isClosed: true,
                    journalId: journal.id,
                },
                {
                    tradeDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    symbol: "GBPUSD",
                    profitLossPercentage: "-1.0",
                    notes: "Stopped out early, market conditions changed",
                    isClosed: true,
                    journalId: journal.id,
                },
                {
                    tradeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    symbol: "USDJPY",
                    profitLossPercentage: "1.8",
                    notes: "Good entry, patience paid off",
                    isClosed: true,
                    journalId: journal.id,
                },
                {
                    tradeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    symbol: "AUDUSD",
                    profitLossPercentage: "3.2",
                    notes: "Excellent risk/reward ratio on this one",
                    isClosed: true,
                    journalId: journal.id,
                },
                {
                    tradeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    symbol: "EURJPY",
                    profitLossPercentage: "-0.8",
                    notes: "Small loss, cut quickly when setup invalidated",
                    isClosed: true,
                    journalId: journal.id,
                },
            ];

            for (const trade of sampleTrades) {
                await createTrade(trade);
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            router.push("/trading/journals");
        } catch (error) {
            console.error("Error generating journal example:", error);
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
                    description:
                        "Improve trading consistency by focusing on quality setups and proper risk management. Track progress weekly and adjust strategy as needed.",
                    type: "quarterly" as const,
                    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    reminderFrequency: "weekly" as const,
                },
                {
                    title: "Build $10k Trading Capital",
                    description:
                        "Grow trading account from $5k to $10k through consistent profits and disciplined risk management. Focus on 1-2% risk per trade.",
                    type: "annual" as const,
                    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    reminderFrequency: "monthly" as const,
                },
            ];

            for (const goal of sampleGoals) {
                await createGoal(goal);
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            router.push("/goals");
        } catch (error) {
            console.error("Error generating goal example:", error);
        } finally {
            setIsGeneratingGoal(false);
        }
    };

    return (
        <div className="container mx-auto min-h-screen px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <h1 className="mb-3 font-argesta font-bold text-5xl text-white">
                        Welcome to Altiora!
                    </h1>
                    <p className="text-base text-white/50">
                        Create your first journal, habit, or goal to start
                        building your knowledge base.
                    </p>
                </div>

                <div className="mb-16">
                    <div className="mb-8 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-white/50" />
                        <h2 className="font-semibold text-lg text-white/90">
                            Get Started
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <SpotlightCard className="group border border-white/10 p-0">
                            <div className="flex h-full flex-col p-6">
                                <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-white/5">
                                    <div className="absolute inset-0 bg-grid-white/[0.02]" />

                                    <div className="absolute inset-0 flex items-center justify-center p-6">
                                        <div className="relative h-full w-full">
                                            <div className="absolute top-2 left-4 h-40 w-32 rotate-[-8deg] transform rounded-lg border border-white/20 bg-linear-to-br from-white/10 to-white/5 shadow-xl transition-all duration-500 group-hover:translate-x-[-4px] group-hover:-rotate-12" />

                                            <div className="absolute top-1 left-12 h-40 w-32 -rotate-2 transform rounded-lg border border-white/30 bg-linear-to-br from-white/15 to-white/5 shadow-xl transition-all duration-500 group-hover:translate-y-[-2px] group-hover:rotate-[-4deg]">
                                                <div className="space-y-2 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                                        <div className="h-2 flex-1 rounded bg-white/30 transition-all duration-300 group-hover:bg-white/40" />
                                                    </div>
                                                    <div className="h-1.5 w-3/4 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                                    <div className="h-1.5 w-1/2 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                                    <div className="mt-3 space-y-1.5">
                                                        <div className="h-1 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                                        <div className="h-1 w-5/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                                        <div className="h-1 w-4/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-0 left-20 h-40 w-32 rotate-[4deg] transform rounded-lg border border-white/40 bg-linear-to-br from-white/20 to-white/10 shadow-2xl transition-all duration-500 group-hover:translate-x-[4px] group-hover:translate-y-[-4px] group-hover:rotate-[8deg] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                                                <div className="space-y-2 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-2 w-2 rounded-full bg-blue-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                                            <div className="h-2 w-12 rounded bg-white/40 transition-all duration-300 group-hover:bg-white/50" />
                                                        </div>
                                                        <div className="text-[8px] text-white/60 transition-all duration-300 group-hover:font-semibold group-hover:text-green-400">
                                                            +2.5%
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-2/3 rounded bg-white/25 transition-all duration-300 group-hover:bg-white/35" />
                                                    <div className="mt-3 border-white/20 border-t pt-2 transition-all duration-300 group-hover:border-white/30">
                                                        <div className="space-y-1">
                                                            <div className="h-1 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                                            <div className="h-1 w-4/5 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                                            <div className="h-1 w-3/5 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
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
                                <h3 className="mb-3 font-semibold text-lg text-white">
                                    Create a Journal
                                </h3>
                                <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
                                    Create your first trading journal to start
                                    building your performance knowledge base.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                                        disabled={isGeneratingJournal}
                                        onClick={() =>
                                            setIsCreateJournalModalOpen(true)
                                        }
                                    >
                                        + Create Journal
                                    </Button>
                                    <button
                                        className="flex items-center justify-center gap-2 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isGeneratingJournal}
                                        onClick={handleGenerateJournalExample}
                                        title="Generate example journal"
                                        type="button"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {isGeneratingJournal
                                            ? "Generating..."
                                            : "Generate example"}
                                    </button>
                                </div>
                            </div>
                        </SpotlightCard>

                        <HabitCardWithProvider />

                        {/* Create Goal Card */}
                        <SpotlightCard className="group border border-white/10 p-0">
                            <div className="flex h-full flex-col p-6">
                                <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-white/5">
                                    <div className="absolute inset-0 bg-grid-white/[0.02]" />

                                    <div className="absolute inset-0 flex items-center justify-center p-6">
                                        <div className="w-full max-w-[200px] space-y-3">
                                            <div className="rounded-lg border border-white/30 bg-linear-to-br from-white/15 to-white/5 p-3 shadow-lg transition-all duration-500 group-hover:translate-x-[-2px] group-hover:shadow-xl">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-green-400 bg-green-400/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                                                        <CheckSquare className="h-2.5 w-2.5 text-green-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-2 w-3/4 rounded bg-white/30 transition-all duration-300 group-hover:bg-white/40" />
                                                        <div className="h-1 w-full rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                                        <div className="mt-2 flex items-center gap-1">
                                                            <div
                                                                className="h-1 rounded-full bg-green-400 transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                                                                style={{
                                                                    width: "75%",
                                                                }}
                                                            />
                                                            <div className="text-[7px] text-green-400 transition-all duration-300 group-hover:font-semibold">
                                                                75%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="scale-105 transform rounded-lg border border-white/40 bg-linear-to-br from-white/20 to-white/10 p-3 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:border-blue-400/50 group-hover:shadow-2xl">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-blue-400 transition-all duration-300 group-hover:bg-blue-400/20 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-2 w-4/5 rounded bg-white/40 transition-all duration-300 group-hover:bg-white/50" />
                                                        <div className="h-1 w-full rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                                                        <div className="mt-2 flex items-center gap-1">
                                                            <div
                                                                className="h-1 rounded-full bg-blue-400 transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                                                                style={{
                                                                    width: "45%",
                                                                }}
                                                            />
                                                            <div
                                                                className="h-1 rounded-full bg-white/20 transition-all duration-300 group-hover:bg-white/30"
                                                                style={{
                                                                    width: "55%",
                                                                }}
                                                            />
                                                            <div className="text-[7px] text-blue-400 transition-all duration-300 group-hover:font-semibold">
                                                                45%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-white/25 bg-linear-to-br from-white/10 to-white/5 p-3 shadow-md transition-all duration-500 group-hover:translate-x-[2px] group-hover:border-white/35">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-white/40 transition-all duration-300 group-hover:border-white/60" />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-2 w-2/3 rounded bg-white/25 transition-all duration-300 group-hover:bg-white/35" />
                                                        <div className="h-1 w-5/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="mb-3 font-semibold text-lg text-white">
                                    Create a Goal
                                </h3>
                                <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
                                    Create your first goal to start building
                                    your objectives knowledge base.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                                        disabled={isGeneratingGoal}
                                        onClick={() =>
                                            setIsCreateGoalModalOpen(true)
                                        }
                                    >
                                        + Create Goal
                                    </Button>
                                    <button
                                        className="flex items-center justify-center gap-2 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isGeneratingGoal}
                                        onClick={handleGenerateGoalExample}
                                        title="Generate example goal"
                                        type="button"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {isGeneratingGoal
                                            ? "Generating..."
                                            : "Generate example"}
                                    </button>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>

                <div className="text-center">
                    <p className="mb-2 text-sm text-white/50">
                        Connect your Discord account for notifications and
                        reminders
                    </p>
                    <Link href="/profile">
                        <Button
                            className="border-white/20 bg-transparent text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                            size="sm"
                            variant="outline"
                        >
                            Connect Discord
                        </Button>
                    </Link>
                </div>
            </div>

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
    const [isGeneratingHabit, setIsGeneratingHabit] = useState(false);

    const { mutateAsync: createHabit } = useMutation(
        orpc.habits.create.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.habits.getAll.queryKey({ input: {} }),
                    orpc.habits.getDashboard.queryKey(),
                ],
            },
        })
    );

    const handleHabitSuccess = () => {
        router.push("/habits");
    };

    const handleGenerateHabitExample = async () => {
        setIsGeneratingHabit(true);
        try {
            const sampleHabits = [
                {
                    title: "Morning Trading Routine",
                    emoji: "🌅",
                    description:
                        "Review markets, check news, and plan trading day",
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
                await createHabit(habit);
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            router.push("/habits");
        } catch (error) {
            console.error("Error generating habit examples:", error);
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

function HabitCard({
    isGenerating,
    onGenerateExample,
}: {
    isGenerating: boolean;
    onGenerateExample: () => void;
}) {
    const { openCreateModal } = useHabits();

    return (
        <SpotlightCard className="group border border-white/10 p-0">
            <div className="flex h-full flex-col p-6">
                <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-white/5">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />

                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="space-y-3">
                            <div className="mb-2 flex justify-center gap-1">
                                {["M", "T", "W", "T", "F", "S", "S"].map(
                                    (day, i) => (
                                        <div
                                            className="flex h-5 w-7 items-center justify-center"
                                            key={i}
                                        >
                                            <span className="text-[8px] text-white/40">
                                                {day}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                            </div>

                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                            </div>

                            {/* Week 3 */}
                            <div className="flex justify-center gap-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded border border-green-400/50 bg-linear-to-br from-green-400/30 to-green-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-green-400/40 group-hover:to-green-500/40 group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                    <CheckSquare className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/20 bg-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15" />
                                <div className="flex h-7 w-7 scale-110 transform items-center justify-center rounded border-2 border-blue-400 bg-linear-to-br from-blue-400/40 to-blue-500/40 shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:border-blue-300 group-hover:shadow-[0_0_16px_rgba(96,165,250,0.6)]">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                                </div>
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="mb-3 font-semibold text-lg text-white">
                    Create a Habit
                </h3>
                <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
                    Create your first habit to start building your daily routine
                    knowledge base.
                </p>
                <div className="flex flex-col gap-3">
                    <Button
                        className="bg-white font-medium text-black shadow-lg hover:bg-gray-100"
                        disabled={isGenerating}
                        onClick={openCreateModal}
                    >
                        + Create Habit
                    </Button>
                    <button
                        className="flex items-center justify-center gap-2 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isGenerating}
                        onClick={onGenerateExample}
                        title="Generate example habit"
                        type="button"
                    >
                        <Sparkles className="h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate example"}
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

    const { data: journals, isLoading: journalsLoading } = useQuery(
        orpc.trading.getJournals.queryOptions({ input: {} })
    );

    const effectiveJournalIds =
        selectedJournalIds.length > 0 ? selectedJournalIds : undefined;

    const { data: stats } = useQuery(
        orpc.trading.getStats.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    const { data: allTrades } = useQuery(
        orpc.trading.getTrades.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    const { data: sessions } = useQuery(
        orpc.trading.getSessions.queryOptions({
            input: {
                journalIds: effectiveJournalIds,
            },
        })
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleJournalToggle = (journalId: string) => {
        if (selectedJournalIds.includes(journalId)) {
            setSelectedJournalIds(
                selectedJournalIds.filter((id) => id !== journalId)
            );
        } else {
            setSelectedJournalIds([...selectedJournalIds, journalId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedJournalIds.length === 0) {
            setSelectedJournalIds(journals?.map((j) => j.id) || []);
        } else {
            setSelectedJournalIds([]);
        }
    };

    if (journalsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {new Array(4).map((_, i) => (
                            <div className="h-32 rounded bg-gray-200" key={i} />
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
            <div className="mb-6 flex items-center space-x-4">
                <Link href="/trading/journals">
                    <Button
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                        size="sm"
                        variant="ghost"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Journals
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-argesta font-bold text-3xl text-white">
                        Global Dashboard
                    </h1>
                    <p className="text-white/60">
                        Overview of all your statistics. Select journals to
                        filter.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex min-w-[200px] items-center justify-between rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            type="button"
                        >
                            <span className="font-medium text-sm">
                                {selectedJournalIds.length === 0 &&
                                    "All journals"}
                                {selectedJournalIds.length === 1 &&
                                    journals?.find(
                                        (j) => j.id === selectedJournalIds[0]
                                    )?.name}
                                {selectedJournalIds.length > 1 &&
                                    `${selectedJournalIds.length} journals selected`}
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/90 shadow-xl backdrop-blur-xs">
                                <div className="space-y-1 p-3">
                                    <div
                                        className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                        onClick={handleSelectAll}
                                        title="Select all journals"
                                    >
                                        <Checkbox
                                            checked={
                                                selectedJournalIds.length ===
                                                journals?.length
                                            }
                                            className="border-white/30 bg-black/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                        />
                                        <span className="font-medium text-sm text-white">
                                            All journals
                                        </span>
                                    </div>

                                    {journals?.map((journal) => (
                                        <div
                                            className="flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-white/10"
                                            key={journal.id}
                                            onClick={() =>
                                                handleJournalToggle(journal.id)
                                            }
                                        >
                                            <Checkbox
                                                checked={selectedJournalIds.includes(
                                                    journal.id
                                                )}
                                                className="border-white/30 bg-black/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            />
                                            <span className="text-sm text-white">
                                                {journal.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedJournalIds.length > 0 && (
                        <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1">
                            <span className="font-medium text-sm text-white/80">
                                {selectedJournalIds.length} journal
                                {selectedJournalIds.length > 1 ? "s" : ""}{" "}
                                selected
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
                            <CardTitle className="text-white">
                                Performance Charts
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Visual analysis of your overall performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlobalTradingCharts
                                sessions={sessions}
                                trades={allTrades}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Trade creation/import modals removed on global dashboard */}

            <DiscordWelcomeChecker />
        </div>
    );
}
