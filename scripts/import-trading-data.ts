import { db } from "@/server/db";
import { 
  tradingJournals, 
  tradingAssets, 
  tradingSessions, 
  tradingSetups, 
  advancedTrades 
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

// Fonction pour lire et parser un fichier CSV
function parseCSV(filePath: string) {
  const fileContent = readFileSync(filePath, "utf-8");
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
}

// Fonction pour créer un journal par défaut
async function createDefaultJournal(userId: string) {
  const [existingJournal] = await db
    .select()
    .from(tradingJournals)
    .where(eq(tradingJournals.userId, userId))
    .limit(1);

  if (existingJournal) {
    console.log("Journal existant trouvé, utilisation de celui-ci");
    return existingJournal;
  }

  const [journal] = await db
    .insert(tradingJournals)
    .values({
      id: `journal_${Date.now()}`,
      userId,
      name: "Journal Principal",
      description: "Journal de trading principal",
      isDefault: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log("Journal par défaut créé:", journal.id);
  return journal;
}

// Fonction pour importer les assets
async function importAssets(journalId: string, userId: string) {
  try {
    const assetsData = parseCSV("sql/assets_rows.csv");
    
    for (const asset of assetsData) {
      await db.insert(tradingAssets).values({
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId,
        userId,
        name: asset.name || asset.symbol || "Asset inconnu",
        symbol: asset.symbol || asset.name || "UNKNOWN",
        type: "forex",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    console.log(`${assetsData.length} assets importés`);
  } catch (error) {
    console.log("Aucun fichier assets_rows.csv trouvé, création d'assets par défaut");
    
    const defaultAssets = [
      { name: "Or", symbol: "XAUUSD" },
      { name: "Euro/Dollar", symbol: "EURUSD" },
      { name: "Livre/Dollar", symbol: "GBPUSD" },
      { name: "Dollar/Yen", symbol: "USDJPY" },
      { name: "Dollar/Franc", symbol: "USDCHF" },
      { name: "Dollar/Canadian", symbol: "USDCAD" },
      { name: "Australien/Dollar", symbol: "AUDUSD" },
      { name: "Néo-Zélandais/Dollar", symbol: "NZDUSD" },
    ];

    for (const asset of defaultAssets) {
      await db.insert(tradingAssets).values({
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId,
        userId,
        name: asset.name,
        symbol: asset.symbol,
        type: "forex",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    console.log(`${defaultAssets.length} assets par défaut créés`);
  }
}

// Fonction pour importer les sessions
async function importSessions(journalId: string, userId: string) {
  try {
    const sessionsData = parseCSV("sql/sessions_rows.csv");
    
    for (const session of sessionsData) {
      await db.insert(tradingSessions).values({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId,
        userId,
        name: session.name || "Session inconnue",
        description: session.description || "",
        startTime: session.start_time || "08:00",
        endTime: session.end_time || "16:00",
        timezone: session.timezone || "UTC",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    console.log(`${sessionsData.length} sessions importées`);
  } catch (error) {
    console.log("Aucun fichier sessions_rows.csv trouvé, création de sessions par défaut");
    
    const defaultSessions = [
      { name: "London", startTime: "08:00", endTime: "16:00", timezone: "Europe/London" },
      { name: "New York", startTime: "13:00", endTime: "21:00", timezone: "America/New_York" },
      { name: "Tokyo", startTime: "00:00", endTime: "08:00", timezone: "Asia/Tokyo" },
      { name: "Sydney", startTime: "22:00", endTime: "06:00", timezone: "Australia/Sydney" },
    ];

    for (const session of defaultSessions) {
      await db.insert(tradingSessions).values({
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId,
        userId,
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
    
    console.log(`${defaultSessions.length} sessions par défaut créées`);
  }
}

// Fonction pour importer les setups
async function importSetups(journalId: string, userId: string) {
  try {
    const setupsData = parseCSV("sql/setups_rows.csv");
    
    for (const setup of setupsData) {
             await db.insert(tradingSetups).values({
         id: `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         journalId,
         userId,
         name: setup.name || "Setup inconnu",
         description: setup.description || "",
         strategy: setup.strategy || "",
         successRate: null,
         isActive: true,
         createdAt: new Date(),
         updatedAt: new Date(),
       });
    }
    
    console.log(`${setupsData.length} setups importés`);
  } catch (error) {
    console.log("Aucun fichier setups_rows.csv trouvé, création de setups par défaut");
    
    const defaultSetups = [
      { name: "LIT CYCLE", strategy: "Cycle de marché", riskLevel: "medium" },
      { name: "BINKS", strategy: "Breakout", riskLevel: "high" },
      { name: "SWING", strategy: "Swing trading", riskLevel: "medium" },
      { name: "SCALPING", strategy: "Scalping", riskLevel: "low" },
    ];

    for (const setup of defaultSetups) {
             await db.insert(tradingSetups).values({
         id: `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         journalId,
         userId,
         name: setup.name,
         description: `Setup ${setup.name}`,
         strategy: setup.strategy,
         successRate: null,
         isActive: true,
         createdAt: new Date(),
         updatedAt: new Date(),
       });
    }
    
    console.log(`${defaultSetups.length} setups par défaut créés`);
  }
}

// Fonction pour importer les trades
async function importTrades(journalId: string, userId: string) {
  try {
    const tradesData = parseCSV("sql/trades_rows.csv");
    
    for (const trade of tradesData) {
      // Parser les tags JSON si présents
      let tags = null;
      if (trade.tags) {
        try {
          tags = JSON.stringify(JSON.parse(trade.tags));
        } catch {
          tags = JSON.stringify([trade.tags]);
        }
      }

      await db.insert(advancedTrades).values({
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        journalId,
        userId,
        assetId: null, // Sera mis à jour plus tard
        sessionId: null, // Sera mis à jour plus tard
        setupId: null, // Sera mis à jour plus tard
        
        symbol: trade.symbol || "UNKNOWN",
        side: trade.side || "buy",
        quantity: parseInt(trade.quantity) || 1,
        entryPrice: trade.entry_price || "0",
        exitPrice: trade.exit_price || null,
        
        tradeDate: new Date(trade.trade_date || Date.now()),
        entryTime: new Date(trade.entry_time || Date.now()),
        exitTime: trade.exit_time ? new Date(trade.exit_time) : null,
        
        reasoning: trade.reasoning || "Aucun raisonnement fourni",
        notes: trade.notes || "",
        tags,
        
        profitLossAmount: trade.profit_loss_amount || "0",
        profitLossPercentage: trade.profit_loss_percentage || "0",
        isClosed: trade.is_closed === "true" || trade.exit_price ? true : false,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    console.log(`${tradesData.length} trades importés`);
  } catch (error) {
    console.log("Aucun fichier trades_rows.csv trouvé, pas de trades à importer");
  }
}

// Fonction principale
async function importTradingData(userId: string) {
  console.log("Début de l'importation des données de trading...");
  
  try {
    // Créer le journal par défaut
    const journal = await createDefaultJournal(userId);
    
    // Importer les assets
    await importAssets(journal.id, userId);
    
    // Importer les sessions
    await importSessions(journal.id, userId);
    
    // Importer les setups
    await importSetups(journal.id, userId);
    
    // Importer les trades
    await importTrades(journal.id, userId);
    
    console.log("Importation terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'importation:", error);
  }
}

// Exporter la fonction pour utilisation
export { importTradingData };

// Si le script est exécuté directement
if (require.main === module) {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npm run import-trading-data <userId>");
    process.exit(1);
  }
  
  importTradingData(userId)
    .then(() => {
      console.log("Importation terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
} 