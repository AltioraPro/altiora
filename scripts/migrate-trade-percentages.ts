import { db } from "../server/db";
import { advancedTrades, tradingJournals } from "../server/db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * Script de migration pour recalculer les pourcentages des trades existants
 * Les pourcentages doivent être basés sur le capital de départ plutôt que sur le capital actuel
 */
async function migrateTradePercentages() {
  console.log("🚀 Début de la migration des pourcentages de trades...");

  try {
    // Récupérer tous les journaux qui utilisent le calcul en pourcentage
    const journals = await db
      .select()
      .from(tradingJournals)
      .where(eq(tradingJournals.usePercentageCalculation, true));

    console.log(`📊 ${journals.length} journaux trouvés avec calcul en pourcentage`);

    for (const journal of journals) {
      if (!journal.startingCapital) {
        console.log(`⚠️ Journal ${journal.id} n'a pas de capital de départ, ignoré`);
        continue;
      }

      const startingCapital = parseFloat(journal.startingCapital);
      console.log(`\n📈 Traitement du journal ${journal.name} (Capital: ${startingCapital}€)`);

      // Récupérer tous les trades fermés de ce journal, triés par date
      const trades = await db
        .select({
          id: advancedTrades.id,
          profitLossAmount: advancedTrades.profitLossAmount,
          profitLossPercentage: advancedTrades.profitLossPercentage,
          tradeDate: advancedTrades.tradeDate,
        })
        .from(advancedTrades)
        .where(and(
          eq(advancedTrades.journalId, journal.id),
          eq(advancedTrades.isClosed, true)
        ))
        .orderBy(asc(advancedTrades.tradeDate));

      console.log(`  📋 ${trades.length} trades fermés trouvés`);

      // Recalculer les pourcentages basés sur le capital de départ
      for (const trade of trades) {
        if (!trade.profitLossAmount) {
          console.log(`  ⚠️ Trade ${trade.id} n'a pas de montant P&L, ignoré`);
          continue;
        }

        const amount = parseFloat(trade.profitLossAmount);
        const newPercentage = (amount / startingCapital) * 100;
        const oldPercentage = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) : 0;

        console.log(`  🔄 Trade ${trade.id}: ${oldPercentage.toFixed(2)}% → ${newPercentage.toFixed(2)}%`);

        // Mettre à jour le pourcentage dans la base de données
        await db
          .update(advancedTrades)
          .set({
            profitLossPercentage: newPercentage.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(advancedTrades.id, trade.id));
      }

      console.log(`  ✅ Journal ${journal.name} traité`);
    }

    console.log("\n🎉 Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateTradePercentages()
    .then(() => {
      console.log("Migration terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
}

export { migrateTradePercentages };
