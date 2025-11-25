import type { ClosedTradeData } from "../types";
import { calculateCurrentStreak } from "./calculate-current-streak";
import { calculateMaxStreaks } from "./calculate-max-streaks";

interface StreakResult {
    currentWinningStreak: number;
    currentLosingStreak: number;
    maxWinningStreak: number;
    maxLosingStreak: number;
}

export function calculateStreaks(trades: ClosedTradeData[]): StreakResult {
    const { maxWinningStreak, maxLosingStreak } = calculateMaxStreaks(trades);
    const { currentWinningStreak, currentLosingStreak } =
        calculateCurrentStreak(trades);
    return {
        currentWinningStreak,
        currentLosingStreak,
        maxWinningStreak,
        maxLosingStreak,
    };
}
