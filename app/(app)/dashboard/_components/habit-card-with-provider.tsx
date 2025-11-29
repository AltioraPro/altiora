"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateHabitModal } from "@/app/(app)/habits/_components/create-habit-modal";
import { HabitsProvider } from "@/app/(app)/habits/_components/habits-provider";
import { PAGES } from "@/constants/pages";
import { orpc } from "@/orpc/client";
import { HabitCard } from "./habit-card";

export function HabitCardWithProvider() {
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
                    targetFrequency: "daily" as const,
                },
                {
                    title: "Journal Review",
                    emoji: "📝",
                    description: "Review and analyze today's trades",
                    color: "#8b5cf6",
                    targetFrequency: "daily" as const,
                },
                {
                    title: "Exercise 30min",
                    emoji: "💪",
                    description: "Stay physically active for mental clarity",
                    color: "#22c55e",
                    targetFrequency: "daily" as const,
                },
            ];

            for (const habit of sampleHabits) {
                await createHabit(habit);
            }

            router.push(PAGES.HABITS);
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
            <CreateHabitModal onSuccess={() => router.push(PAGES.HABITS)} />
        </HabitsProvider>
    );
}
