import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { RouterOutput } from "@/orpc/client";

interface HabitManagerItemProps {
    habit: RouterOutput["habits"]["getPaginated"]["data"][number];
    onReactivate: (habitId: string) => void;
    onEdit: (habitId: string) => void;
    onDelete: (habitId: string) => void;
}

export function HabitManagerItem({
    habit,
    onReactivate,
    onEdit,
    onDelete,
}: HabitManagerItemProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between bg-neutral-800 p-4"
            )}
        >
            <div className="flex items-center space-x-3">
                <div
                    className="flex h-10 w-10 items-center justify-center text-lg"
                    style={{
                        backgroundColor: `${habit.color}20`,
                    }}
                >
                    {habit.emoji}
                </div>
                <div>
                    <h4 className="font-medium text-white">{habit.title}</h4>
                    {habit.description && (
                        <p className="max-w-48 truncate text-sm text-white/60">
                            {habit.description}
                        </p>
                    )}
                    <div className="mt-1 flex items-center space-x-2">
                        <span className="text-white/40 text-xs">
                            {habit.targetFrequency}
                        </span>
                        {habit.completionRate !== undefined && (
                            <span className="text-white/60 text-xs">
                                {Math.round(habit.completionRate)}% completion
                            </span>
                        )}
                        {!habit.isActive && (
                            <span className="font-medium text-red-400/80 text-xs">
                                INACTIVE
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {!habit.isActive && (
                    <button
                        className="p-2 text-green-400 transition-colors hover:bg-green-400/10 hover:text-green-300"
                        onClick={() => onReactivate(habit.id)}
                        title="Reactivate habit"
                        type="button"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <title>Reactivate habit</title>
                            <path
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </button>
                )}
                <button
                    className="p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => onEdit(habit.id)}
                    title="Edit habit"
                    type="button"
                >
                    <RiEditLine className="size-4" />
                </button>
                <button
                    className="p-2 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                    onClick={() => onDelete(habit.id)}
                    title="Delete habit"
                    type="button"
                >
                    <RiDeleteBinLine className="size-4" />
                </button>
            </div>
        </div>
    );
}
