"use client";

import {
    RiAddLine,
    RiCalendarLine,
    RiSparklingLine,
    RiStockLine,
    RiTargetLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { GoalsDashboard } from "@/components/goals/GoalsDashboard";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

export default function GoalsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({
        active: 0,
        completed: 0,
        overdue: 0,
        successRate: 0,
    });

    const { data: goalStats } = useQuery(
        orpc.goals.getStats.queryOptions({ input: { period: "year" } })
    );

    useEffect(() => {
        if (!goalStats) {
            return;
        }

        const finalStats = {
            active: goalStats?.active || 0,
            completed: goalStats?.completed || 0,
            overdue: goalStats?.overdue || 0,
            successRate: goalStats?.completionRate || 0,
        };

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        const animateValue = (
            start: number,
            end: number,
            setter: (value: number) => void
        ) => {
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
            animateValue(0, finalStats.active, (value) =>
                setAnimatedStats((prev) => ({ ...prev, active: value }))
            ),
            animateValue(0, finalStats.completed, (value) =>
                setAnimatedStats((prev) => ({ ...prev, completed: value }))
            ),
            animateValue(0, finalStats.overdue, (value) =>
                setAnimatedStats((prev) => ({ ...prev, overdue: value }))
            ),
            animateValue(0, finalStats.successRate, (value) =>
                setAnimatedStats((prev) => ({ ...prev, successRate: value }))
            ),
        ];

        return () => {
            for (const timer of timers) {
                clearInterval(timer);
            }
        };
    }, [goalStats]);

    return (
        <div className="min-h-screen px-6 py-8 text-pure-white">
            {/* Main Content */}
            <div className="relative mx-auto w-full">
                <div className="flex justify-end">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <RiAddLine className="size-4 transition-transform group-hover:scale-110" />
                        New Goal
                    </Button>
                </div>

                {/* Quick Stats Cards */}
                <div className="mt-6 mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
                    {/* Active Goals */}
                    <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                        <div className="absolute top-4 right-4">
                            <RiTargetLine className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="mb-2 font-medium text-sm text-white/60">
                                Active Goals
                            </p>
                            <p className="font-bold text-3xl text-green-400">
                                {animatedStats.active}
                            </p>
                        </div>
                    </div>

                    {/* Completed Goals */}
                    <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                        <div className="absolute top-4 right-4">
                            <RiStockLine className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="mb-2 font-medium text-sm text-white/60">
                                Completed
                            </p>
                            <p className="font-bold text-3xl text-green-400">
                                {animatedStats.completed}
                            </p>
                        </div>
                    </div>

                    {/* Overdue Goals */}
                    <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                        <div className="absolute top-4 right-4">
                            <RiCalendarLine className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="mb-2 font-medium text-sm text-white/60">
                                Overdue
                            </p>
                            <p className="font-bold text-3xl text-red-400">
                                {animatedStats.overdue}
                            </p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="relative rounded-lg border border-white/10 bg-black/20 p-6">
                        <div className="absolute top-4 right-4">
                            <RiSparklingLine className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="mb-2 font-medium text-sm text-white/60">
                                Success Rate
                            </p>
                            <p className="font-bold text-3xl text-white">
                                {animatedStats.successRate}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Goals Dashboard */}
                <div className="mx-auto max-w-7xl">
                    <GoalsDashboard />
                </div>

                {/* Create Goal Modal */}
                <CreateGoalModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </div>

            {/* Background decoration */}
            <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/1 blur-3xl" />
                <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/0.5 blur-3xl" />
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[800px] w-[800px] transform rounded-full bg-white/[0.002] blur-3xl" />
            </div>
        </div>
    );
}
