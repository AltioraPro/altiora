import { RiTimerLine } from "@remixicon/react";

export function LeaderboardEmptyState() {
    return (
        <div className="py-20 text-center">
            <RiTimerLine className="mx-auto mb-4 h-16 w-16 text-white/20" />
            <h3 className="mb-2 font-argesta text-white/60 text-xl">
                No public rankings yet
            </h3>
            <p className="text-sm text-white/40">
                Be the first to share your deep work progress on the
                leaderboard!
            </p>
        </div>
    );
}

