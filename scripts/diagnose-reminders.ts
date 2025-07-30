import { db } from "@/server/db";
import { goals, users } from "@/server/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

async function diagnoseReminders() {
  console.log("🔍 Diagnostic du système de rappels");
  console.log("=====================================");
  
  try {
    // 1. Vérifier tous les objectifs
    const allGoals = await db
      .select({
        id: goals.id,
        title: goals.title,
        userId: goals.userId,
        remindersEnabled: goals.remindersEnabled,
        reminderFrequency: goals.reminderFrequency,
        isCompleted: goals.isCompleted,
        isActive: goals.isActive,
        nextReminderDate: goals.nextReminderDate,
      })
      .from(goals);

    console.log(`\n📊 Total des objectifs: ${allGoals.length}`);

    // 2. Vérifier les objectifs avec rappels activés
    const goalsWithReminders = allGoals.filter(goal => goal.remindersEnabled);
    console.log(`🎯 Objectifs avec rappels activés: ${goalsWithReminders.length}`);

    if (goalsWithReminders.length > 0) {
      console.log("\n📋 Détail des objectifs avec rappels:");
      for (const goal of goalsWithReminders) {
        console.log(`   - ${goal.title} (${goal.reminderFrequency}) - ${goal.isCompleted ? 'Complété' : 'En cours'}`);
      }
    }

    // 3. Vérifier les utilisateurs connectés à Discord
    const discordUsers = await db
      .select({
        id: users.id,
        email: users.email,
        discordId: users.discordId,
        discordConnected: users.discordConnected,
      })
      .from(users)
      .where(and(
        isNotNull(users.discordId),
        eq(users.discordConnected, true)
      ));

    console.log(`\n👥 Utilisateurs connectés à Discord: ${discordUsers.length}`);

    if (discordUsers.length > 0) {
      console.log("\n📋 Détail des utilisateurs Discord:");
      for (const user of discordUsers) {
        console.log(`   - ${user.email} (Discord ID: ${user.discordId})`);
      }
    }

    // 4. Vérifier les objectifs éligibles pour les rappels
    const eligibleGoals = allGoals.filter(goal => 
      goal.remindersEnabled && 
      !goal.isCompleted && 
      goal.isActive
    );

    console.log(`\n✅ Objectifs éligibles pour les rappels: ${eligibleGoals.length}`);

    if (eligibleGoals.length > 0) {
      console.log("\n📋 Objectifs éligibles:");
      for (const goal of eligibleGoals) {
        const user = discordUsers.find(u => u.id === goal.userId);
        console.log(`   - ${goal.title} (${goal.reminderFrequency})`);
        console.log(`     Utilisateur: ${user ? `${user.email} (Discord: ${user.discordId})` : 'Non connecté Discord'}`);
        console.log(`     Prochain rappel: ${goal.nextReminderDate || 'Non programmé'}`);
      }
    }

    // 5. Vérifier les objectifs avec rappels en retard
    const now = new Date();
    const overdueReminders = eligibleGoals.filter(goal => 
      goal.nextReminderDate && new Date(goal.nextReminderDate) <= now
    );

    console.log(`\n⏰ Rappels en retard: ${overdueReminders.length}`);

    if (overdueReminders.length > 0) {
      console.log("\n📋 Rappels en retard:");
      for (const goal of overdueReminders) {
        const user = discordUsers.find(u => u.id === goal.userId);
        console.log(`   - ${goal.title} (${goal.reminderFrequency})`);
        console.log(`     Utilisateur: ${user ? `${user.email} (Discord: ${user.discordId})` : 'Non connecté Discord'}`);
        console.log(`     Date de rappel: ${goal.nextReminderDate}`);
      }
    }

    console.log("\n🎯 Recommandations:");
    if (allGoals.length === 0) {
      console.log("   - Créez des objectifs dans l'application");
    }
    if (goalsWithReminders.length === 0) {
      console.log("   - Activez les rappels sur vos objectifs");
    }
    if (discordUsers.length === 0) {
      console.log("   - Connectez-vous à Discord dans votre profil");
    }
    if (overdueReminders.length === 0 && eligibleGoals.length > 0) {
      console.log("   - Les rappels sont à jour, aucun DM à envoyer");
    }

  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
  }
}

// Exécuter le diagnostic
diagnoseReminders()
  .then(() => {
    console.log("\n✅ Diagnostic terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  }); 