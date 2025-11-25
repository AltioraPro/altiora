import type { ClosedTradeData } from "../types";

export function calculateCurrentStreak(trades: ClosedTradeData[]): {
    currentWinningStreak: number;
    currentLosingStreak: number;
} {
    let currentWinningStreak = 0;
    let currentLosingStreak = 0;

    for (let i = trades.length - 1; i >= 0; i--) {
        const exitReason = trades[i]?.exitReason;

        if (exitReason === "TP") {
            if (currentLosingStreak > 0) {
                break;
            }
            currentWinningStreak++;
        } else if (exitReason === "SL") {
            if (currentWinningStreak > 0) {
                break;
            }
            currentLosingStreak++;
        } else {
            break;
        }
    }

    return { currentWinningStreak, currentLosingStreak };
}
