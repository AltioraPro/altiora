export function LeaderboardBackground() {
    return (
        <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/1 blur-3xl" />
            <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/0.5 blur-3xl" />
        </div>
    );
}
