#!/usr/bin/env tsx

/**
 * Script de diagnostic pour les problèmes d'authentification en production
 * Utilisation: npx tsx scripts/debug-auth-production.ts
 */

import { auth } from "@/lib/auth";

async function diagnoseAuth() {
  console.log("🔍 Diagnostic d'authentification Altiora");
  console.log("==========================================\n");

  // 1. Configuration de base
  console.log("📋 Configuration:");
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || "non défini"}`);
  console.log(`- VERCEL_URL: ${process.env.VERCEL_URL || "non défini"}`);
  console.log(`- BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? "✅ défini" : "❌ manquant"}`);
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? "✅ défini" : "❌ manquant"}`);

  // 2. Résolution de baseURL
  const computedBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  console.log(`\n🌐 BaseURL résolu: ${computedBaseUrl}`);

  // 3. Test de connexion base de données
  console.log("\n🗄️  Test de connexion base de données...");
  try {
    // Simple test de connexion via auth
    const testSession = await auth.api.getSession({ 
      headers: new Headers({ "cookie": "" }) 
    });
    console.log("✅ Connexion base de données OK");
  } catch (error) {
    console.log("❌ Erreur connexion base de données:", error);
  }

  // 4. Instructions pour le débogage en production
  console.log("\n🚀 Instructions pour le débogage en production:");
  console.log("1. Vérifiez que NEXT_PUBLIC_APP_URL est défini dans Vercel");
  console.log("2. Vérifiez que BETTER_AUTH_SECRET est défini et unique");
  console.log("3. Vérifiez les logs de la fonction Vercel pour /api/auth/session-check");
  console.log("4. Testez l'authentification avec les outils de développement du navigateur");
  console.log("5. Vérifiez que les cookies sont correctement définis (Domain, Secure, SameSite)");

  console.log("\n🔧 Commandes utiles:");
  console.log("- Logs Vercel: vercel logs");
  console.log("- Test API session: curl -H 'Cookie: your-cookies' https://yourdomain.com/api/auth/session-check");

  console.log("\n✨ Diagnostic terminé!");
}

// Exécution du diagnostic
diagnoseAuth().catch(console.error);
