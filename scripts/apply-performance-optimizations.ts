import { db } from "@/server/db";
import { sql } from "drizzle-orm";

async function applyPerformanceOptimizations() {
  console.log("🚀 Applying performance optimizations...");

  try {
    // Index pour les goals
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_goals_user_type ON goals(user_id, type);
    `);
    console.log("✅ Created index: idx_goals_user_type");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, is_completed);
    `);
    console.log("✅ Created index: idx_goals_user_status");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_goals_user_created ON goals(user_id, created_at);
    `);
    console.log("✅ Created index: idx_goals_user_created");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_goals_user_deadline ON goals(user_id, deadline);
    `);
    console.log("✅ Created index: idx_goals_user_deadline");

    // Index pour les habits
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);
    `);
    console.log("✅ Created index: idx_habits_user_active");

    // Index pour les trades
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_trades_user_created ON trades(user_id, created_at);
    `);
    console.log("✅ Created index: idx_trades_user_created");

    // Index pour les utilisateurs
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan);
    `);
    console.log("✅ Created index: idx_users_subscription");

    // Index pour l'utilisation mensuelle
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage(user_id, month);
    `);
    console.log("✅ Created index: idx_monthly_usage_user_month");

    console.log("🎉 All performance optimizations applied successfully!");
  } catch (error) {
    console.error("❌ Error applying performance optimizations:", error);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  applyPerformanceOptimizations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { applyPerformanceOptimizations }; 