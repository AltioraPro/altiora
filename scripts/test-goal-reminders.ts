import { goalReminderService } from "@/server/services/goal-reminders";
import { db } from "@/server/db";
import { goals, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

async function testGoalReminders() {
  console.log("🧪 Test du système de rappels d'objectifs");
  
  try {
    // 1. Vérifier les objectifs avec rappels activés
    const goalsWithReminders = await db
      .select({
        goal: goals,
        user: {
          id: users.id,
          discordId: users.discordId,
          discordConnected: users.discordConnected,
        }
      })
      .from(goals)
      .leftJoin(users, eq(goals.userId, users.id))
      .where(
        and(
          eq(goals.remindersEnabled, true),
          eq(goals.isCompleted, false),
          eq(goals.isActive, true)
        )
      );

    console.log(`📊 ${goalsWithReminders.length} objectifs avec rappels activés trouvés`);

    for (const { goal, user } of goalsWithReminders) {
      console.log(`\n🎯 Objectif: ${goal.title}`);
      console.log(`   Utilisateur: ${user?.id}`);
      console.log(`   Discord ID: ${user?.discordId || 'Non connecté'}`);
      console.log(`   Connecté Discord: ${user?.discordConnected ? 'Oui' : 'Non'}`);
      console.log(`   Fréquence: ${goal.reminderFrequency}`);
      console.log(`   Prochain rappel: ${goal.nextReminderDate}`);
    }

    // 2. Déclencher les rappels
    console.log("\n🚀 Déclenchement des rappels...");
    await goalReminderService.sendReminders();
    
    console.log("✅ Test terminé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testGoalReminders()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Erreur fatale:", error);
      process.exit(1);
    });
} 