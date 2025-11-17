"use client";

interface LeaderboardPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function LeaderboardPagination({
    currentPage,
    totalPages,
    onPageChange,
}: LeaderboardPaginationProps) {
    return (
        <div className="mt-8 flex items-center justify-center gap-4">
            <button
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                type="button"
            >
                Précédent
            </button>

            <span className="text-sm text-white/60">
                Page {currentPage} sur {totalPages}
            </span>

            <button
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                type="button"
            >
                Suivant
            </button>
        </div>
    );
}
