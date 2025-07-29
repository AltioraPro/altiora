import { db } from "@/server/db";
import { SubscriptionLimitsService } from "@/server/services/subscription-limits";
import { users, habits, trades, goals } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function testSubscriptionLimits() {
  console.log("🧪 Test du système de limitations d'abonnement...\n");

  try {
    // Récupérer un utilisateur de test
    const testUser = await db
      .select()
      .from(users)
      .limit(1);

    if (!testUser[0]) {
      console.log("❌ Aucun utilisateur trouvé pour les tests");
      return;
    }

    const userId = testUser[0].id;
    console.log(`👤 Utilisateur de test: ${testUser[0].email} (${testUser[0].subscriptionPlan})`);

    // Test 1: Récupérer les limites du plan
    console.log("\n📊 Test 1: Limites du plan");
    const limits = await SubscriptionLimitsService.getUserPlanLimits(userId);
    console.log("Limites récupérées:", {
      maxHabits: limits.maxHabits,
      maxTradingEntries: limits.maxTradingEntries,
      maxAnnualGoals: limits.maxAnnualGoals,
      maxQuarterlyGoals: limits.maxQuarterlyGoals,
      hasDiscordIntegration: limits.hasDiscordIntegration,
    });

    // Test 2: Récupérer les statistiques d'utilisation
    console.log("\n📈 Test 2: Statistiques d'utilisation");
    const usage = await SubscriptionLimitsService.getUserUsageStats(userId);
    console.log("Utilisation actuelle:", {
      currentHabits: usage.currentHabits,
      monthlyTradingEntries: usage.monthlyTradingEntries,
      currentAnnualGoals: usage.currentAnnualGoals,
      currentQuarterlyGoals: usage.currentQuarterlyGoals,
    });

    // Test 3: Vérifier les permissions
    console.log("\n🔒 Test 3: Vérifications de permissions");
    
    const canCreateHabit = await SubscriptionLimitsService.canCreateHabit(userId);
    console.log("Peut créer une habitude:", canCreateHabit);

    const canCreateTradingEntry = await SubscriptionLimitsService.canCreateTradingEntry(userId);
    console.log("Peut créer une entrée de trading:", canCreateTradingEntry);

    const canCreateAnnualGoal = await SubscriptionLimitsService.canCreateGoal(userId, "annual");
    console.log("Peut créer un objectif annuel:", canCreateAnnualGoal);

    const canCreateQuarterlyGoal = await SubscriptionLimitsService.canCreateGoal(userId, "quarterly");
    console.log("Peut créer un objectif trimestriel:", canCreateQuarterlyGoal);

    // Test 4: Vérifier l'accès aux fonctionnalités
    console.log("\n✨ Test 4: Accès aux fonctionnalités");
    
    const hasDiscord = await SubscriptionLimitsService.hasFeatureAccess(userId, "hasDiscordIntegration");
    console.log("Accès Discord:", hasDiscord);

    const hasPrioritySupport = await SubscriptionLimitsService.hasFeatureAccess(userId, "hasPrioritySupport");
    console.log("Support prioritaire:", hasPrioritySupport);

    const hasEarlyAccess = await SubscriptionLimitsService.hasFeatureAccess(userId, "hasEarlyAccess");
    console.log("Accès anticipé:", hasEarlyAccess);

    // Test 5: Résumé complet
    console.log("\n📋 Test 5: Résumé complet");
    const summary = {
      limits,
      usage,
      canCreateHabit: usage.currentHabits < limits.maxHabits,
      canCreateTradingEntry: usage.monthlyTradingEntries < limits.maxTradingEntries,
      canCreateAnnualGoal: usage.currentAnnualGoals < limits.maxAnnualGoals,
      canCreateQuarterlyGoal: usage.currentQuarterlyGoals < limits.maxQuarterlyGoals,
    };
    console.log("Résumé:", summary);

    console.log("\n✅ Tous les tests terminés avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testSubscriptionLimits()
    .then(() => {
      console.log("\n🎉 Tests terminés");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erreur:", error);
      process.exit(1);
    });
}

export { testSubscriptionLimits };