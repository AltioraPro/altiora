import { db } from "@/server/db";

async function dropAndCreateTradingTables() {
  try {
    console.log("🔄 Suppression des tables existantes...");

    // Supprimer les tables dans l'ordre inverse des dépendances
    await db.execute(`DROP TABLE IF EXISTS "altiora_advanced_trade" CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS "altiora_trading_setup" CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS "altiora_trading_session" CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS "altiora_trading_asset" CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS "altiora_trading_journal" CASCADE;`);

    console.log("✅ Tables supprimées avec succès");

    console.log("🔄 Création des tables de trading...");

    // Créer les tables une par une
    console.log("📝 Création de la table trading_journals...");
    await db.execute(`
      CREATE TABLE "altiora_trading_journal" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) NOT NULL DEFAULT now(),
        "updated_at" timestamp(3) NOT NULL,
        "user_id" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false
      );
    `);

    console.log("📝 Création de la table trading_assets...");
    await db.execute(`
      CREATE TABLE "altiora_trading_asset" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) NOT NULL DEFAULT now(),
        "updated_at" timestamp(3) NOT NULL,
        "user_id" text NOT NULL,
        "journal_id" text NOT NULL,
        "name" text NOT NULL,
        "symbol" text NOT NULL,
        "type" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        FOREIGN KEY ("journal_id") REFERENCES "altiora_trading_journal"("id") ON DELETE CASCADE
      );
    `);

    console.log("📝 Création de la table trading_sessions...");
    await db.execute(`
      CREATE TABLE "altiora_trading_session" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) NOT NULL DEFAULT now(),
        "updated_at" timestamp(3) NOT NULL,
        "user_id" text NOT NULL,
        "journal_id" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "start_time" text,
        "end_time" text,
        "timezone" text,
        "is_active" boolean NOT NULL DEFAULT true,
        FOREIGN KEY ("journal_id") REFERENCES "altiora_trading_journal"("id") ON DELETE CASCADE
      );
    `);

    console.log("📝 Création de la table trading_setups...");
    await db.execute(`
      CREATE TABLE "altiora_trading_setup" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) NOT NULL DEFAULT now(),
        "updated_at" timestamp(3) NOT NULL,
        "user_id" text NOT NULL,
        "journal_id" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "strategy" text,
        "success_rate" real,
        "is_active" boolean NOT NULL DEFAULT true,
        FOREIGN KEY ("journal_id") REFERENCES "altiora_trading_journal"("id") ON DELETE CASCADE
      );
    `);

    console.log("📝 Création de la table advanced_trades...");
    await db.execute(`
      CREATE TABLE "altiora_advanced_trade" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) NOT NULL DEFAULT now(),
        "updated_at" timestamp(3) NOT NULL,
        "user_id" text NOT NULL,
        "journal_id" text NOT NULL,
        "asset_id" text,
        "session_id" text,
        "setup_id" text,
        "trade_date" timestamp(3) NOT NULL,
        "entry_time" timestamp(3),
        "exit_time" timestamp(3),
        "symbol" text NOT NULL,
        "side" text NOT NULL,
        "quantity" real NOT NULL,
        "entry_price" text NOT NULL,
        "exit_price" text,
        "stop_loss" text,
        "take_profit" text,
        "profit_loss_amount" text NOT NULL DEFAULT '0',
        "profit_loss_percentage" real,
        "exit_reason" text,
        "tradingview_link" text,
        "notes" text,
        "tags" text,
        "rating" integer,
        "is_closed" boolean NOT NULL DEFAULT false,
        "risk_input" real,
        "position_size" real,
        "reasoning" text,
        FOREIGN KEY ("journal_id") REFERENCES "altiora_trading_journal"("id") ON DELETE CASCADE,
        FOREIGN KEY ("asset_id") REFERENCES "altiora_trading_asset"("id") ON DELETE SET NULL,
        FOREIGN KEY ("session_id") REFERENCES "altiora_trading_session"("id") ON DELETE SET NULL,
        FOREIGN KEY ("setup_id") REFERENCES "altiora_trading_setup"("id") ON DELETE SET NULL
      );
    `);

    console.log("✅ Toutes les tables de trading ont été créées avec succès !");
    console.log("📊 Vous pouvez maintenant tester le système de trading.");

  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
    throw error;
  }
}

// Exécuter le script
dropAndCreateTradingTables()
  .then(() => {
    console.log("✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'exécution du script:", error);
    process.exit(1);
  }); 