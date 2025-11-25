import type { ClosedTradeData } from "../types";

export function calculateMaxStreaks(trades: ClosedTradeData[]): {
    maxWinningStreak: number;
    maxLosingStreak: number;
} {
    let maxWinningStreak = 0;
    let maxLosingStreak = 0;
    let tempWinningStreak = 0;
    let tempLosingStreak = 0;

    for (const trade of trades) {
        const exitReason = trade.exitReason;

        if (exitReason === "TP") {
            tempWinningStreak++;
            tempLosingStreak = 0;
            maxWinningStreak = Math.max(maxWinningStreak, tempWinningStreak);
        } else if (exitReason === "SL") {
            tempLosingStreak++;
            tempWinningStreak = 0;
            maxLosingStreak = Math.max(maxLosingStreak, tempLosingStreak);
        } else {
            tempWinningStreak = 0;
            tempLosingStreak = 0;
        }
    }

    return { maxWinningStreak, maxLosingStreak };
}
