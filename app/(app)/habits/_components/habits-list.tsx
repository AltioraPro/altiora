import type { RouterOutput } from "@/orpc/client";
import { HabitManagerItem } from "./habit-manager-item";

interface HabitsListProps {
    habits: RouterOutput["habits"]["getPaginated"]["data"];
    debouncedSearch: string;
    deleteHabit: (habitId: string) => void;
    openEditModal: (habitId: string) => void;
    reactivateHabit: (habitId: string) => void;
    isLoading: boolean;
}

export function HabitsList({
    habits,
    debouncedSearch,
    deleteHabit,
    openEditModal,
    reactivateHabit,
    isLoading,
}: HabitsListProps) {
    if (isLoading) {
        return (
            <div className="mb-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div className="h-16 animate-pulse bg-white/5" key={i} />
                ))}
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div className="pt-6 text-center text-white/40">
                {debouncedSearch
                    ? "No habits found matching your search."
                    : "No habits yet."}
            </div>
        );
    }

    return (
        <>
            {habits.map((habit) => (
                <HabitManagerItem
                    habit={habit}
                    key={habit.id}
                    onDelete={deleteHabit}
                    onEdit={openEditModal}
                    onReactivate={reactivateHabit}
                />
            ))}
        </>
    );
}
