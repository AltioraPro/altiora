export function ProgressCircle({
    completionPercentage,
}: {
    completionPercentage: number;
}) {
    return (
        <svg className="-rotate-90 h-16 w-16 transform" viewBox="0 0 64 64">
            <title>Habit Completion Progress</title>
            <circle
                cx="32"
                cy="32"
                fill="none"
                r="28"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="4"
            />
            <circle
                className="transition-all duration-300 ease-out"
                cx="32"
                cy="32"
                fill="none"
                r="28"
                stroke={completionPercentage === 100 ? "#4ade80" : "white"}
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                strokeLinecap="round"
                strokeWidth="4"
            />
        </svg>
    );
}
