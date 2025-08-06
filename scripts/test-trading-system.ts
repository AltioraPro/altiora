import { db } from "@/server/db";
import { 
  tradingJournals, 
  tradingAssets, 
  tradingSessions, 
  tradingSetups, 
  advancedTrades 
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function testTradingSystem() {
  console.log("🧪 Test du système de trading...");

  try {
    // 1. Créer un utilisateur de test (utiliser un ID existant)
    const testUserId = "user_test_trading";
    
    console.log("📝 Création du journal de test...");
    
    // 2. Créer un journal de test
    const [journal] = await db
      .insert(tradingJournals)
      .values({
        id: "journal_test",
        userId: testUserId,
        name: "Journal de Test",
        description: "Journal pour tester le système de trading",
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Journal créé:", journal.id);

    // 3. Créer des assets de test
    console.log("📊 Création des assets de test...");
    const testAssets = [
      { name: "Or", symbol: "XAUUSD" },
      { name: "Euro/Dollar", symbol: "EURUSD" },
      { name: "Livre/Dollar", symbol: "GBPUSD" },
    ];

    for (const asset of testAssets) {
      await db.insert(tradingAssets).values({
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId: journal.id,
        userId: testUserId,
        name: asset.name,
        symbol: asset.symbol,
        description: `Asset ${asset.name}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("✅ Assets créés");

    // 4. Créer des sessions de test
    console.log("⏰ Création des sessions de test...");
    const testSessions = [
      { name: "London", startTime: "08:00", endTime: "16:00", timezone: "Europe/London" },
      { name: "New York", startTime: "13:00", endTime: "21:00", timezone: "America/New_York" },
    ];

    for (const session of testSessions) {
      await db.insert(tradingSessions).values({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId: journal.id,
        userId: testUserId,
        name: session.name,
        description: `Session ${session.name}`,
        startTime: session.startTime,
        endTime: session.endTime,
        timezone: session.timezone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("✅ Sessions créées");

    // 5. Créer des setups de test
    console.log("🎯 Création des setups de test...");
    const testSetups = [
      { name: "LIT CYCLE", strategy: "Cycle de marché", riskLevel: "medium" },
      { name: "BINKS", strategy: "Breakout", riskLevel: "high" },
      { name: "SWING", strategy: "Swing trading", riskLevel: "medium" },
    ];

    for (const setup of testSetups) {
      await db.insert(tradingSetups).values({
        id: `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId: journal.id,
        userId: testUserId,
        name: setup.name,
        description: `Setup ${setup.name}`,
        strategy: setup.strategy,
        riskLevel: setup.riskLevel,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("✅ Setups créés");

    // 6. Créer des trades de test
    console.log("💰 Création des trades de test...");
    const testTrades = [
      {
        symbol: "XAUUSD",
        side: "buy" as const,
        quantity: 1,
        entryPrice: "1950.50",
        exitPrice: "1960.25",
        reasoning: "Support sur la zone 1950, rebond attendu",
        notes: "Trade gagnant, bon timing d'entrée",
        profitLossAmount: "97.50",
        profitLossPercentage: "0.50",
        isClosed: true,
        tags: JSON.stringify(["support", "rebond", "gagnant"]),
      },
      {
        symbol: "EURUSD",
        side: "sell" as const,
        quantity: 1,
        entryPrice: "1.0850",
        exitPrice: "1.0820",
        reasoning: "Résistance sur 1.0850, retracement attendu",
        notes: "Trade perdant, stop loss touché",
        profitLossAmount: "-30.00",
        profitLossPercentage: "-0.28",
        isClosed: true,
        tags: JSON.stringify(["résistance", "retracement", "perdant"]),
      },
      {
        symbol: "GBPUSD",
        side: "buy" as const,
        quantity: 1,
        entryPrice: "1.2650",
        reasoning: "Breakout de la ligne de tendance",
        notes: "Trade ouvert, en cours",
        profitLossAmount: "0.00",
        profitLossPercentage: "0.00",
        isClosed: false,
        tags: JSON.stringify(["breakout", "tendance", "ouvert"]),
      },
    ];

    for (const trade of testTrades) {
      await db.insert(advancedTrades).values({
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId: journal.id,
        userId: testUserId,
        assetId: null,
        sessionId: null,
        setupId: null,
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice || null,
        tradeDate: new Date(),
        entryTime: new Date(),
        exitTime: trade.exitPrice ? new Date() : null,
        reasoning: trade.reasoning,
        notes: trade.notes,
        tags: trade.tags,
        profitLossAmount: trade.profitLossAmount,
        profitLossPercentage: trade.profitLossPercentage,
        isClosed: trade.isClosed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("✅ Trades créés");

    // 7. Vérifier les données créées
    console.log("🔍 Vérification des données...");
    
    const [journalCount] = await db
      .select({ count: db.fn.count() })
      .from(tradingJournals)
      .where(eq(tradingJournals.userId, testUserId));

    const [assetsCount] = await db
      .select({ count: db.fn.count() })
      .from(tradingAssets)
      .where(eq(tradingAssets.userId, testUserId));

    const [sessionsCount] = await db
      .select({ count: db.fn.count() })
      .from(tradingSessions)
      .where(eq(tradingSessions.userId, testUserId));

    const [setupsCount] = await db
      .select({ count: db.fn.count() })
      .from(tradingSetups)
      .where(eq(tradingSetups.userId, testUserId));

    const [tradesCount] = await db
      .select({ count: db.fn.count() })
      .from(advancedTrades)
      .where(eq(advancedTrades.userId, testUserId));

    console.log("📊 Résultats:");
    console.log(`  - Journaux: ${journalCount.count}`);
    console.log(`  - Assets: ${assetsCount.count}`);
    console.log(`  - Sessions: ${sessionsCount.count}`);
    console.log(`  - Setups: ${setupsCount.count}`);
    console.log(`  - Trades: ${tradesCount.count}`);

    // 8. Nettoyer les données de test
    console.log("🧹 Nettoyage des données de test...");
    
    await db.delete(advancedTrades).where(eq(advancedTrades.userId, testUserId));
    await db.delete(tradingSetups).where(eq(tradingSetups.userId, testUserId));
    await db.delete(tradingSessions).where(eq(tradingSessions.userId, testUserId));
    await db.delete(tradingAssets).where(eq(tradingAssets.userId, testUserId));
    await db.delete(tradingJournals).where(eq(tradingJournals.userId, testUserId));

    console.log("✅ Données de test nettoyées");
    console.log("🎉 Test du système de trading terminé avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    throw error;
  }
}

// Exporter la fonction pour utilisation
export { testTradingSystem };

// Si le script est exécuté directement
if (require.main === module) {
  testTradingSystem()
    .then(() => {
      console.log("Test terminé");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
} 