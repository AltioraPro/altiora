import type { TradingJournal } from "@/server/db/schema";

export interface TradeCalculationResult {
    profitLossPercentage?: string;
    profitLossAmount?: string;
    exitReason?: "TP" | "BE" | "SL" | "Manual";
}

export interface TradeCalculationInput {
    profitLossAmount?: string;
    profitLossPercentage?: string;
    exitReason?: "TP" | "BE" | "SL" | "Manual";
    breakEvenThreshold?: string;
}

export function calculateTradeResults(
    input: TradeCalculationInput,
    journal: TradingJournal
): TradeCalculationResult {
    const result: TradeCalculationResult = {};

    if (input.exitReason !== undefined) {
        result.exitReason = input.exitReason || "Manual";
    }

    if (!(journal.usePercentageCalculation && journal.startingCapital)) {
        if (input.profitLossPercentage !== undefined) {
            result.profitLossPercentage = input.profitLossPercentage;
        }
        if (input.profitLossAmount !== undefined) {
            result.profitLossAmount = input.profitLossAmount;
        }
        return result;
    }

    const startingCapital = Number.parseFloat(journal.startingCapital);
    let profitLossPercentage = 0;
    let profitLossAmount = 0;
    let hasCalculation = false;

    if (input.profitLossAmount) {
        const parsed = Number.parseFloat(input.profitLossAmount);
        if (!Number.isNaN(parsed)) {
            profitLossAmount = parsed;
            profitLossPercentage = (profitLossAmount / startingCapital) * 100;
            hasCalculation = true;
        }
    } else if (input.profitLossPercentage) {
        const parsed = Number.parseFloat(input.profitLossPercentage);
        if (!Number.isNaN(parsed)) {
            profitLossPercentage = parsed;
            profitLossAmount = (profitLossPercentage / 100) * startingCapital;
            hasCalculation = true;
        }
    }

    if (hasCalculation) {
        result.profitLossPercentage = profitLossPercentage.toString();
        result.profitLossAmount = profitLossAmount.toString();
    }

    return result;
}

export function validatePercentageCalculation(
    journal: TradingJournal
): boolean {
    return !!(
        journal.usePercentageCalculation &&
        journal.startingCapital &&
        Number.parseFloat(journal.startingCapital) > 0
    );
}

export function formatPercentage(value: string | number): string {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;

    if (Number.isNaN(num)) {
        return "0.00%";
    }

    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

export function formatAmount(value: string | number, currency = "€"): string {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;

    if (Number.isNaN(num)) {
        return `0.00${currency}`;
    }

    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}${currency}`;
}

export function getTradeColor(profitLossPercentage: string | number): string {
    const num =
        typeof profitLossPercentage === "string"
            ? Number.parseFloat(profitLossPercentage)
            : profitLossPercentage;

    if (Number.isNaN(num) || num === 0) {
        return "text-gray-500";
    }
    return num > 0 ? "text-green-600" : "text-red-600";
}

export function getExitReasonIcon(exitReason: string): string {
    switch (exitReason) {
        case "TP":
            return "🎯";
        case "BE":
            return "⚖️";
        case "SL":
            return "🛑";
        case "Manual":
            return "✋";
        default:
            return "📊";
    }
}

export function getExitReasonLabel(exitReason: string): string {
    switch (exitReason) {
        case "TP":
            return "Take Profit";
        case "BE":
            return "Break Even";
        case "SL":
            return "Stop Loss";
        case "Manual":
            return "Manuel";
        default:
            return "Inconnu";
    }
}
