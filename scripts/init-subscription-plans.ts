import { db } from "../server/db";
import { subscriptionPlans } from "../server/db/schema";
import { createId } from "@paralleldrive/cuid2";

async function initSubscriptionPlans() {
  console.log("🚀 Initialisation des plans d'abonnement...");

  try {
    // Supprimer les plans existants
    await db.delete(subscriptionPlans);
    console.log("✅ Plans existants supprimés");

    // Insérer les nouveaux plans (alignés avec la page pricing)
    const plans = [
      {
        id: createId(),
        name: "FREE",
        displayName: "Free Plan",
        description: "Plan gratuit avec fonctionnalités de base",
        price: 0,
        currency: "EUR",
        billingInterval: "monthly",
        stripePriceId: null,
        isActive: true,
        maxHabits: 3,
        maxTradingEntries: 10,
        maxAnnualGoals: 1,
        maxQuarterlyGoals: 1,
        maxMonthlyGoals: 0,
        hasDiscordIntegration: false,
        hasPrioritySupport: false,
        hasEarlyAccess: false,
        hasMonthlyChallenges: false,
        hasPremiumDiscord: false,
      },
      {
        id: createId(),
        name: "ALTIORANS",
        displayName: "Altioran",
        description: "Unlimited access to everything",
        price: 1499, // 14.99€ en centimes
        currency: "EUR",
        billingInterval: "monthly",
        stripePriceId: null,
        isActive: true,
        maxHabits: 999,
        maxTradingEntries: 9999999,
        maxAnnualGoals: 999,
        maxQuarterlyGoals: 999,
        maxMonthlyGoals: 999,
        hasDiscordIntegration: true,
        hasPrioritySupport: true,
        hasEarlyAccess: true,
        hasMonthlyChallenges: true,
        hasPremiumDiscord: true,
      },
    ];

    await db.insert(subscriptionPlans).values(plans);
    console.log("✅ Plans d'abonnement créés avec succès");

    // Afficher les plans créés
    const createdPlans = await db.select().from(subscriptionPlans);
    console.log("\n📋 Plans créés:");
    createdPlans.forEach(plan => {
      console.log(`- ${plan.displayName} (${plan.name}): ${plan.price / 100}€/mois`);
      console.log(`  Habitudes: ${plan.maxHabits}, Trading: ${plan.maxTradingEntries}, Objectifs: ${plan.maxAnnualGoals}A/${plan.maxQuarterlyGoals}Q/${plan.maxMonthlyGoals}M`);
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des plans:", error);
    throw error;
  }
}

// Exécuter le script
initSubscriptionPlans()
  .then(() => {
    console.log("✅ Initialisation terminée");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Échec de l'initialisation:", error);
    process.exit(1);
  });