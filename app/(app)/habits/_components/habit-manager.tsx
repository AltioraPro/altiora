"use client";

import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiSearchLine,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import { HabitsList } from "./habits-list";
import { useHabits } from "./habits-provider";

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
                    title: "Habit deleted",
                    message: "The habit has been deleted successfully",
                });
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Error",
                    message: error.message || "Unable to delete the habit",
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
                    title: "Habit reactivated",
                    message: "The habit has been reactivated successfully",
                });
            },
            onError: (error) => {
                addToast({
                    type: "error",
                    title: "Error",
                    message: error.message || "Unable to reactivate the habit",
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

    return (
        <div className="relative overflow-hidden border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg text-white">HABITS MANAGER</h3>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 flex items-center justify-between">
                {/* Search Bar */}
                <div className="relative max-w-sm flex-1">
                    <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-white/40" />
                    <input
                        className="w-full border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-sm text-white placeholder-white/40 transition-colors focus:border-white/40 focus:outline-hidden"
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search habits..."
                        type="text"
                        value={searchInput}
                    />
                </div>

                {/* Show Inactive Toggle */}
                <button
                    className={cn(
                        "ml-4 px-4 py-2 text-sm transition-colors",
                        showInactive
                            ? "border border-white/40 bg-white/20 text-white"
                            : "border border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white/80"
                    )}
                    onClick={handleToggleInactive}
                    type="button"
                >
                    {showInactive ? "HIDE INACTIVE" : "SHOW INACTIVE"}
                </button>
            </div>

            <div className="mb-6 space-y-3">
                <HabitsList
                    debouncedSearch={debouncedSearch}
                    deleteHabit={deleteHabit}
                    habits={habits}
                    isLoading={isLoading}
                    openEditModal={openEditModal}
                    reactivateHabit={reactivateHabit}
                />
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
