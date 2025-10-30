"use client";

interface GoalStatsProps {
    stats: {
        total: number;
        completed: number;
        overdue: number;
        active: number;
        completionRate: number;
    };
}

export function GoalStats({ stats }: GoalStatsProps) {
    // Affichage direct sans animation
    const animatedStats = stats;

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 80) return "text-white";
        if (rate >= 60) return "text-white/90";
        if (rate >= 40) return "text-white/70";
        return "text-white/50";
    };

    const getCompletionRateMessage = (rate: number) => {
        if (rate >= 80) return "Exceptional performance!";
        if (rate >= 60) return "Great momentum!";
        if (rate >= 40) return "Steady progress.";
        return "Room for growth.";
    };

    return (
        <div className="rounded-lg border border-white/10 bg-black/20 p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="mb-1 font-semibold text-base text-white">
                    Monthly Performance
                </h3>
                <p className="text-white/60 text-xs">Track your progress</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                {/* Total Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="mb-1 font-bold text-white text-xl">
                        {animatedStats.total}
                    </p>
                    <p className="text-white/60 text-xs">Total</p>
                </div>

                {/* Active Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="mb-1 font-bold text-white text-xl">
                        {animatedStats.active}
                    </p>
                    <p className="text-white/60 text-xs">Active</p>
                </div>

                {/* Completed Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="mb-1 font-bold text-white text-xl">
                        {animatedStats.completed}
                    </p>
                    <p className="text-white/60 text-xs">Done</p>
                </div>

                {/* Overdue Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="mb-1 font-bold text-white text-xl">
                        {animatedStats.overdue}
                    </p>
                    <p className="text-white/60 text-xs">Late</p>
                </div>
            </div>

            {/* Success Rate Section */}
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-4">
                    <p className="mb-1 text-white/60 text-xs">Success Rate</p>
                    <p
                        className={`font-bold text-xl ${getCompletionRateColor(animatedStats.completionRate)}`}
                    >
                        {animatedStats.completionRate}%
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-white/5">
                    <div
                        className="h-2 rounded-full bg-white/60"
                        style={{ width: `${animatedStats.completionRate}%` }}
                    />
                </div>
            </div>

            {/* Message */}
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-center text-white/70 text-xs">
                    {getCompletionRateMessage(animatedStats.completionRate)}
                </p>
            </div>
        </div>
    );
}
