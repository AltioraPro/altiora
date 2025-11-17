"use client";

import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiDeleteBinLine,
    RiEditLine,
    RiSearchLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { orpc } from "@/orpc/client";
import { useHabits } from "./HabitsProvider";

export function HabitsManager() {
    const { openEditModal } = useHabits();
    const { addToast } = useToast();

    const deleteHabitMutation = useMutation(
        orpc.habits.delete.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.habits.getPaginated.queryKey({ input: {} }),
                    orpc.habits.getDashboard.queryKey({ input: {} }),
                ],
            },
            onSuccess: () => {
                addToast({
                    type: "success",
                    title: "Habitude supprimée",
                    message: "L'habitude a été supprimée avec succès",
                });
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message || "Impossible de supprimer l'habitude",
                });
            },
        })
    );

    const updateHabitMutation = useMutation(
        orpc.habits.update.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.habits.getPaginated.queryKey({ input: {} }),
                    orpc.habits.getDashboard.queryKey({ input: {} }),
                ],
            },
            onSuccess: () => {
                addToast({
                    type: "success",
                    title: "Habitude réactivée",
                    message: "L'habitude a été réactivée avec succès",
                });
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message || "Impossible de réactiver l'habitude",
                });
            },
        })
    );

    const deleteHabit = (habitId: string) => {
        deleteHabitMutation.mutate({ id: habitId });
    };

    const reactivateHabit = (habitId: string) => {
        updateHabitMutation.mutate({ id: habitId, isActive: true });
    };
    const [page, setPage] = useState(0);
    const [limit] = useState(5);
    const [searchInput, setSearchInput] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const debouncedSearch = useDebounce(searchInput, 300);

    const { data: paginatedData, isLoading } = useQuery(
        orpc.habits.getPaginated.queryOptions({
            input: {
                page,
                limit,
                search: debouncedSearch || undefined,
                sortBy: "sortOrder",
                sortOrder: "asc",
                showInactive,
            },
        })
    );

    const habits = paginatedData?.data || [];
    const pagination = paginatedData?.pagination;

    const handleSearch = useCallback((value: string) => {
        setSearchInput(value);
        setPage(0);
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleToggleInactive = () => {
        setShowInactive(!showInactive);
        setPage(0);
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg text-white">HABITS MANAGER</h3>
                    <div className="h-8 w-32 animate-pulse rounded-lg bg-white/5" />
                </div>
                <div className="space-y-3">
                    {new Array(5).map((_, i) => (
                        <div
                            className="h-16 animate-pulse rounded-xl bg-white/5"
                            key={i}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg text-white">HABITS MANAGER</h3>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 flex items-center justify-between">
                {/* Search Bar */}
                <div className="relative max-w-sm flex-1">
                    <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                    <input
                        className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-sm text-white placeholder-white/40 transition-colors focus:border-white/40 focus:outline-hidden"
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search habits..."
                        type="text"
                        value={searchInput}
                    />
                </div>

                {/* Show Inactive Toggle */}
                <button
                    className={`ml-4 rounded-lg px-4 py-2 text-sm transition-colors ${
                        showInactive
                            ? "border border-white/40 bg-white/20 text-white"
                            : "border border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white/80"
                    }`}
                    onClick={handleToggleInactive}
                    type="button"
                >
                    {showInactive ? "HIDE INACTIVE" : "SHOW INACTIVE"}
                </button>
            </div>

            {/* Habits List */}
            <div className="mb-6 space-y-3">
                {habits.length === 0 ? (
                    <div className="py-8 text-center text-white/40">
                        {debouncedSearch
                            ? "No habits found matching your search."
                            : "No habits yet."}
                    </div>
                ) : (
                    habits.map((habit) => (
                        <div
                            className={`flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 ${
                                habit.isActive ? "" : "opacity-60"
                            }`}
                            key={habit.id}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                                    style={{
                                        backgroundColor: `${habit.color}20`,
                                    }}
                                >
                                    {habit.emoji}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">
                                        {habit.title}
                                    </h4>
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
                                                {Math.round(
                                                    habit.completionRate
                                                )}
                                                % completion
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
                                        className="rounded-lg p-2 text-green-400 transition-colors hover:bg-green-400/10 hover:text-green-300"
                                        onClick={() =>
                                            reactivateHabit(habit.id)
                                        }
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
                                    className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                    onClick={() => openEditModal(habit.id)}
                                    title="Edit habit"
                                    type="button"
                                >
                                    <RiEditLine className="size-4" />
                                </button>
                                <button
                                    className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                                    onClick={() => deleteHabit(habit.id)}
                                    title="Delete habit"
                                    type="button"
                                >
                                    <RiDeleteBinLine className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-white/10 border-t pt-4">
                    <div className="text-sm text-white/60">
                        Showing {page * limit + 1} to{" "}
                        {Math.min((page + 1) * limit, pagination.total)} of{" "}
                        {pagination.total} habits
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!pagination.hasPrev}
                            onClick={() => handlePageChange(page - 1)}
                            type="button"
                        >
                            <RiArrowLeftSLine className="size-4" />
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from(
                                { length: Math.min(5, pagination.totalPages) },
                                (_, i) => {
                                    const pageNum =
                                        Math.max(
                                            0,
                                            Math.min(
                                                pagination.totalPages - 5,
                                                page - 2
                                            )
                                        ) + i;
                                    return (
                                        <button
                                            className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                                                page === pageNum
                                                    ? "bg-white/20 text-white"
                                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                                            }`}
                                            key={pageNum}
                                            onClick={() =>
                                                handlePageChange(pageNum)
                                            }
                                            type="button"
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <button
                            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!pagination.hasNext}
                            onClick={() => handlePageChange(page + 1)}
                            type="button"
                        >
                            <RiArrowRightSLine className="size-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
