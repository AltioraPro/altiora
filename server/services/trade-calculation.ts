import { TradingJournal } from "@/server/db/schema";

export interface TradeCalculationResult {
  profitLossPercentage: string;
  profitLossAmount?: string;
  exitReason: "TP" | "BE" | "SL" | "Manual";
}

export interface TradeCalculationInput {
  profitLossAmount?: string;
  profitLossPercentage?: string;
  exitReason?: "TP" | "BE" | "SL" | "Manual";
  breakEvenThreshold?: string;
}

/**
 * Calcule les résultats d'un trade basé sur le capital actuel du journal
 * L'utilisateur choisit manuellement le type de sortie (BE/TP/SL)
 */
export function calculateTradeResults(
  input: TradeCalculationInput,
  journal: TradingJournal,
  currentCapital?: number
): TradeCalculationResult {
  // Si le journal n'utilise pas le calcul en pourcentage, retourner les valeurs telles quelles
  if (!journal.usePercentageCalculation || !journal.startingCapital) {
    return {
      profitLossPercentage: input.profitLossPercentage || "0",
      profitLossAmount: input.profitLossAmount,
      exitReason: input.exitReason || "Manual",
    };
  }

  const startingCapital = parseFloat(journal.startingCapital);
  
  let profitLossPercentage: number = 0;
  let profitLossAmount: number = 0;

  // Si on a un montant P&L, calculer le pourcentage basé sur le capital de départ
  if (input.profitLossAmount) {
    profitLossAmount = parseFloat(input.profitLossAmount);
    profitLossPercentage = (profitLossAmount / startingCapital) * 100;
  }
  // Si on a un pourcentage P&L, calculer le montant basé sur le capital de départ
  else if (input.profitLossPercentage) {
    profitLossPercentage = parseFloat(input.profitLossPercentage);
    profitLossAmount = (profitLossPercentage / 100) * startingCapital;
  }

  return {
    profitLossPercentage: profitLossPercentage.toFixed(2),
    profitLossAmount: profitLossAmount.toFixed(2),
    exitReason: input.exitReason || "Manual", // L'utilisateur choisit manuellement
  };
}

/**
 * Valide qu'un journal peut utiliser le calcul en pourcentage
 */
export function validatePercentageCalculation(journal: TradingJournal): boolean {
  return !!(
    journal.usePercentageCalculation &&
    journal.startingCapital &&
    parseFloat(journal.startingCapital) > 0
  );
}

/**
 * Formate un pourcentage pour l'affichage
 */
export function formatPercentage(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

/**
 * Formate un montant pour l'affichage
 */
export function formatAmount(value: string | number, currency = "€"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return `0.00${currency}`;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}${currency}`;
}

/**
 * Obtient la couleur appropriée pour un trade basé sur son résultat
 */
export function getTradeColor(profitLossPercentage: string | number): string {
  const num = typeof profitLossPercentage === "string" ? parseFloat(profitLossPercentage) : profitLossPercentage;
  if (isNaN(num) || num === 0) return "text-gray-500";
  return num > 0 ? "text-green-600" : "text-red-600";
}

/**
 * Obtient l'icône appropriée pour un exitReason
 */
export function getExitReasonIcon(exitReason: string): string {
  switch (exitReason) {
    case "TP":
      return "🎯"; // Target/bullseye
    case "BE":
      return "⚖️"; // Balance/scales
    case "SL":
      return "🛑"; // Stop sign
    case "Manual":
      return "✋"; // Hand
    default:
      return "📊"; // Chart
  }
}

/**
 * Obtient le label français pour un exitReason
 */
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
