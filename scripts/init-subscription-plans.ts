import { db } from "@/server/db";
import { subscriptionPlans } from "@/server/db/schema";
import { createId } from "@paralleldrive/cuid2";

async function initSubscriptionPlans() {
  console.log("🔄 Initialisation des plans d'abonnement...");

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
      
      // Limitations
      maxHabits: 3,
      maxTradingEntries: 10,
      maxAnnualGoals: 1,
      maxQuarterlyGoals: 1,
      maxCustomGoals: 0,
      
      // Fonctionnalités
      hasDiscordIntegration: false,
      hasPrioritySupport: false,
      hasEarlyAccess: false,
      hasMonthlyChallenges: false,
      hasPremiumDiscord: false,
    },
    {
      id: createId(),
      name: "PRO",
      displayName: "Pro Plan",
      description: "Plan professionnel avec fonctionnalités avancées",
      price: 2900, // 29€ en centimes
      currency: "EUR",
      billingInterval: "monthly",
      stripePriceId: null, // À configurer avec Stripe
      isActive: true,
      
      // Limitations
      maxHabits: 999, // Illimité
      maxTradingEntries: 999, // Illimité
      maxAnnualGoals: 5,
      maxQuarterlyGoals: 999, // Illimité
      maxCustomGoals: 0,
      
      // Fonctionnalités
      hasDiscordIntegration: true,
      hasPrioritySupport: true,
      hasEarlyAccess: false,
      hasMonthlyChallenges: false,
      hasPremiumDiscord: false,
    },
    {
      id: createId(),
      name: "ALTIORANS",
      displayName: "Altiorans",
      description: "Plan premium avec accès exclusif",
      price: 4900, // 49€ en centimes
      currency: "EUR",
      billingInterval: "monthly",
      stripePriceId: null, // À configurer avec Stripe
      isActive: true,
      
      // Limitations
      maxHabits: 999, // Illimité
      maxTradingEntries: 999, // Illimité
      maxAnnualGoals: 999, // Illimité
      maxQuarterlyGoals: 999, // Illimité
      maxCustomGoals: 999, // Illimité
      
      // Fonctionnalités
      hasDiscordIntegration: true,
      hasPrioritySupport: true,
      hasEarlyAccess: true,
      hasMonthlyChallenges: true,
      hasPremiumDiscord: true,
    },
  ];

  try {
    // Supprimer les plans existants
    await db.delete(subscriptionPlans);
    console.log("✅ Plans existants supprimés");

    // Insérer les nouveaux plans
    await db.insert(subscriptionPlans).values(plans);
    console.log("✅ Plans d'abonnement créés avec succès");

    console.log("\n📋 Plans créés :");
    plans.forEach(plan => {
      console.log(`  - ${plan.displayName} (${plan.name})`);
      console.log(`    Prix: ${plan.price / 100}€/${plan.billingInterval}`);
      console.log(`    Habitudes: ${plan.maxHabits === 999 ? 'Illimité' : plan.maxHabits}`);
      console.log(`    Entrées trading: ${plan.maxTradingEntries === 999 ? 'Illimité' : plan.maxTradingEntries}/mois`);
      console.log(`    Objectifs annuels: ${plan.maxAnnualGoals === 999 ? 'Illimité' : plan.maxAnnualGoals}`);
      console.log(`    Objectifs trimestriels: ${plan.maxQuarterlyGoals === 999 ? 'Illimité' : plan.maxQuarterlyGoals}`);
      console.log(`    Objectifs personnalisés: ${plan.maxCustomGoals === 999 ? 'Illimité' : plan.maxCustomGoals}`);
      console.log("");
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des plans:", error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initSubscriptionPlans()
    .then(() => {
      console.log("✅ Initialisation terminée avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

export { initSubscriptionPlans };