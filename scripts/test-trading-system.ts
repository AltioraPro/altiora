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
        type: "forex",
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
        successRate: null,
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
        profitLossPercentage: "0.50",
        notes: "Trade gagnant, bon timing d'entrée",
        exitReason: "TP" as const,
        isClosed: true,
      },
      {
        symbol: "EURUSD",
        profitLossPercentage: "-0.28",
        notes: "Trade perdant, stop loss touché",
        exitReason: "SL" as const,
        isClosed: true,
      },
      {
        symbol: "GBPUSD",
        profitLossPercentage: "0.00",
        notes: "Trade ouvert, en cours",
        exitReason: null,
        isClosed: false,
      },
    ];

    const toDate = () => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };

    for (const trade of testTrades) {
      await db.insert(advancedTrades).values({
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId: journal.id,
        userId: testUserId,
        assetId: null,
        sessionId: null,
        setupId: null,
        tradeDate: toDate(),
        symbol: trade.symbol,
        riskInput: null,
        profitLossPercentage: trade.profitLossPercentage,
        exitReason: trade.exitReason,
        tradingviewLink: null,
        notes: trade.notes,
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