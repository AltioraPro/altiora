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
        if (rate >= 80) {
            return "text-white";
        }
        if (rate >= 60) {
            return "text-white/90";
        }
        if (rate >= 40) {
            return "text-white/70";
        }
        return "text-white/50";
    };

    const getCompletionRateMessage = (rate: number) => {
        if (rate >= 80) {
            return "Exceptional performance!";
        }
        if (rate >= 60) {
            return "Great momentum!";
        }
        if (rate >= 40) {
            return "Steady progress.";
        }
        return "Room for growth.";
    };

    return (
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 sm:p-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h3 className="mb-1 font-semibold text-sm sm:text-base text-white">
                    Monthly Performance
                </h3>
                <p className="text-white/60 text-[10px] sm:text-xs">Track your progress</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4">
                {/* Total Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 sm:p-4">
                    <p className="mb-0.5 sm:mb-1 font-bold text-white text-lg sm:text-xl">
                        {animatedStats.total}
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-xs">Total</p>
                </div>

                {/* Active Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 sm:p-4">
                    <p className="mb-0.5 sm:mb-1 font-bold text-white text-lg sm:text-xl">
                        {animatedStats.active}
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-xs">Active</p>
                </div>

                {/* Completed Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 sm:p-4">
                    <p className="mb-0.5 sm:mb-1 font-bold text-white text-lg sm:text-xl">
                        {animatedStats.completed}
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-xs">Done</p>
                </div>

                {/* Overdue Goals */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 sm:p-4">
                    <p className="mb-0.5 sm:mb-1 font-bold text-white text-lg sm:text-xl">
                        {animatedStats.overdue}
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-xs">Late</p>
                </div>
            </div>

            {/* Success Rate Section */}
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:p-4">
                <div className="mb-3 sm:mb-4">
                    <p className="mb-0.5 sm:mb-1 text-white/60 text-[10px] sm:text-xs">Success Rate</p>
                    <p
                        className={`font-bold text-lg sm:text-xl ${getCompletionRateColor(animatedStats.completionRate)}`}
                    >
                        {animatedStats.completionRate}%
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-white/5">
                    <div
                        className="h-1.5 sm:h-2 rounded-full bg-white/60"
                        style={{ width: `${animatedStats.completionRate}%` }}
                    />
                </div>
            </div>

            {/* Message */}
            <div className="mt-3 sm:mt-4 rounded-lg border border-white/10 bg-black/20 p-2 sm:p-3">
                <p className="text-center text-white/70 text-[10px] sm:text-xs">
                    {getCompletionRateMessage(animatedStats.completionRate)}
                </p>
            </div>
        </div>
    );
}
