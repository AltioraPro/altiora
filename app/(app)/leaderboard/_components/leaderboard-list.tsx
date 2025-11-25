"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { orpc } from "@/orpc/client";
import { leaderboardSearchParams } from "../search-params";
import { LeaderboardEmptyState } from "./leaderboard-empty-state";
import { LeaderboardEntry } from "./leaderboard-entry";
import { LeaderboardLoadingSkeleton } from "./leaderboard-loading-skeleton";
import { LeaderboardPagination } from "./leaderboard-pagination";

const itemsPerPage = 50;

export function LeaderboardList() {
    const [period] = useQueryState("period", leaderboardSearchParams.period);
    const [currentPage, setCurrentPage] = useQueryState(
        "page",
        leaderboardSearchParams.page
    );

    const { data: leaderboard, isLoading } = useSuspenseQuery(
        orpc.leaderboard.getLeaderboard.queryOptions({ input: { period } })
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: we want to reset the page when the period changes
    useEffect(() => {
        setCurrentPage(1);
    }, [period]);

    const totalItems = leaderboard?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = leaderboard?.slice(startIndex, endIndex) || [];

    if (isLoading) {
        return <LeaderboardLoadingSkeleton />;
    }

    if (currentItems.length === 0) {
        return <LeaderboardEmptyState />;
    }

    return (
        <>
            <div className="space-y-2">
                {currentItems.map((entry) => (
                    <LeaderboardEntry entry={entry} key={entry.userId} />
                ))}
            </div>

            {totalPages > 1 && (
                <LeaderboardPagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalPages={totalPages}
                />
            )}
        </>
    );
}
