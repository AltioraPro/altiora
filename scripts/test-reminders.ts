/**
 * Script de test pour le système de reminders de goals
 *
 * Usage:
 *   pnpm test-reminders              # Mode diagnostic (dry-run)
 *   pnpm test-reminders --send       # Envoie réellement les reminders en retard
 *   pnpm test-reminders --send --force  # Force l'envoi de TOUS les reminders activés (même pas en retard)
 *   pnpm test-reminders --fix        # Corrige les goals mal configurés
 *   pnpm test-reminders --user <id>  # Test pour un utilisateur spécifique
 */

import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../server/db/schema";

const { Pool } = pg;

// Couleurs pour le terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`
    ),
  subheader: (msg: string) =>
    console.log(`${colors.magenta}▸ ${msg}${colors.reset}`),
};

// Parse arguments
const args = process.argv.slice(2);
const shouldSend = args.includes("--send");
const shouldFix = args.includes("--fix");
const forceMode = args.includes("--force");
const userIdIndex = args.indexOf("--user");
const specificUserId = userIdIndex !== -1 ? args[userIdIndex + 1] : undefined;

async function main() {
  log.header("Test du système de Reminders Altiora");

  // Vérification des variables d'environnement
  log.subheader("Vérification de la configuration");

  if (!process.env.DATABASE_URL) {
    log.error("DATABASE_URL non définie");
    process.exit(1);
  }
  log.success("DATABASE_URL configurée");

  if (!process.env.DISCORD_BOT_TOKEN) {
    log.warning(
      "DISCORD_BOT_TOKEN non définie - Les DMs Discord ne fonctionneront pas"
    );
  } else {
    log.success("DISCORD_BOT_TOKEN configurée");
  }

  // Connexion à la base de données
  log.subheader("Connexion à la base de données");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query("SELECT 1");
    log.success("Connexion établie");
  } catch (error) {
    log.error(`Échec de la connexion: ${error}`);
    process.exit(1);
  }

  const db = drizzle(pool, { schema });

  // Statistiques générales
  log.header("Statistiques générales");

  const totalGoals = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.goals);
  log.info(`Total de goals: ${totalGoals[0]?.count ?? 0}`);

  // Debug: Afficher tous les goals avec leurs champs de reminder
  log.subheader("Détail des goals (debug)");
  const allGoalsDebug = await db
    .select({
      id: schema.goals.id,
      title: schema.goals.title,
      isActive: schema.goals.isActive,
      isCompleted: schema.goals.isCompleted,
      remindersEnabled: schema.goals.remindersEnabled,
      reminderFrequency: schema.goals.reminderFrequency,
      nextReminderDate: schema.goals.nextReminderDate,
      lastReminderSent: schema.goals.lastReminderSent,
    })
    .from(schema.goals);

  for (const g of allGoalsDebug) {
    console.log(`
  ${colors.cyan}▸ ${g.title}${colors.reset}
    ID: ${g.id}
    isActive: ${g.isActive}
    isCompleted: ${g.isCompleted}
    ${colors.yellow}remindersEnabled: ${g.remindersEnabled}${colors.reset}
    ${colors.yellow}reminderFrequency: ${g.reminderFrequency ?? "NULL"}${colors.reset}
    ${colors.yellow}nextReminderDate: ${g.nextReminderDate?.toLocaleString("fr-FR") ?? "NULL"}${colors.reset}
    lastReminderSent: ${g.lastReminderSent?.toLocaleString("fr-FR") ?? "NULL"}
`);
  }

  // Mode --fix : Corriger les goals mal configurés
  if (shouldFix) {
    log.header("Correction des goals mal configurés");

    // Goals avec reminderFrequency mais sans remindersEnabled ou nextReminderDate
    const goalsToFix = allGoalsDebug.filter(
      (g) =>
        g.reminderFrequency &&
        g.isActive &&
        !g.isCompleted &&
        (!g.remindersEnabled || !g.nextReminderDate)
    );

    if (goalsToFix.length === 0) {
      log.success("Aucun goal à corriger");
    } else {
      log.warning(`${goalsToFix.length} goal(s) à corriger`);

      for (const goal of goalsToFix) {
        log.subheader(`Correction: ${goal.title}`);

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(9, 0, 0, 0);

        await db
          .update(schema.goals)
          .set({
            remindersEnabled: true,
            nextReminderDate: nextDate,
            updatedAt: new Date(),
          })
          .where(eq(schema.goals.id, goal.id));

        log.success(
          `Corrigé: remindersEnabled=true, nextReminderDate=${nextDate.toLocaleString("fr-FR")}`
        );
      }

      log.success("Corrections terminées");
    }
  }

  const activeGoals = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.goals)
    .where(
      and(eq(schema.goals.isActive, true), eq(schema.goals.isCompleted, false))
    );
  log.info(`Goals actifs non complétés: ${activeGoals[0]?.count ?? 0}`);

  const goalsWithReminders = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.goals)
    .where(
      and(
        eq(schema.goals.isActive, true),
        eq(schema.goals.isCompleted, false),
        eq(schema.goals.remindersEnabled, true)
      )
    );
  log.info(
    `Goals avec reminders activés: ${goalsWithReminders[0]?.count ?? 0}`
  );

  // Goals avec reminders en retard (ou tous si --force)
  log.header(
    forceMode
      ? "Goals avec reminders activés (mode FORCE)"
      : "Goals avec reminders en retard"
  );

  const now = new Date();
  const overdueGoals = await db
    .select({
      id: schema.goals.id,
      userId: schema.goals.userId,
      title: schema.goals.title,
      description: schema.goals.description,
      deadline: schema.goals.deadline,
      remindersEnabled: schema.goals.remindersEnabled,
      reminderFrequency: schema.goals.reminderFrequency,
      nextReminderDate: schema.goals.nextReminderDate,
      lastReminderSent: schema.goals.lastReminderSent,
    })
    .from(schema.goals)
    .where(
      and(
        eq(schema.goals.isActive, true),
        eq(schema.goals.isCompleted, false),
        eq(schema.goals.remindersEnabled, true),
        forceMode ? undefined : lte(schema.goals.nextReminderDate, now),
        isNotNull(schema.goals.reminderFrequency),
        isNotNull(schema.goals.nextReminderDate),
        specificUserId ? eq(schema.goals.userId, specificUserId) : undefined
      )
    );

  if (overdueGoals.length === 0) {
    if (forceMode) {
      log.success("Aucun reminder activé trouvé");
    } else {
      log.success("Aucun reminder en retard");
    }
  } else {
    if (forceMode) {
      log.warning(
        `${overdueGoals.length} reminder(s) activé(s) - ${colors.red}MODE FORCE: envoi immédiat${colors.reset}`
      );
    } else {
      log.warning(`${overdueGoals.length} reminder(s) en retard:`);
    }

    for (const goal of overdueGoals) {
      const delayMs = now.getTime() - (goal.nextReminderDate?.getTime() ?? 0);
      const delayHours = Math.round(delayMs / (1000 * 60 * 60));
      const delayDays = Math.round(delayMs / (1000 * 60 * 60 * 24));
      const isOverdue = delayMs > 0;

      console.log(`
  ${colors.yellow}▸ ${goal.title}${colors.reset}
    ID: ${goal.id}
    User ID: ${goal.userId}
    Fréquence: ${goal.reminderFrequency}
    Prochain rappel prévu: ${goal.nextReminderDate?.toLocaleString("fr-FR")}
    ${
      forceMode
        ? isOverdue
          ? `${colors.red}Retard: ${delayDays > 0 ? `${delayDays} jour(s)` : `${delayHours} heure(s)`}${colors.reset}`
          : `${colors.green}Dans ${Math.abs(delayDays) > 0 ? `${Math.abs(delayDays)} jour(s)` : `${Math.abs(delayHours)} heure(s)`}${colors.reset}`
        : `Retard: ${delayDays > 0 ? `${delayDays} jour(s)` : `${delayHours} heure(s)`}`
    }
    Dernier rappel: ${goal.lastReminderSent?.toLocaleString("fr-FR") ?? "Jamais"}
`);
    }
  }

  // Utilisateurs avec Discord connecté
  log.header("Utilisateurs avec reminders et Discord");

  const usersWithDiscord = await db
    .select({
      id: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      discordId: schema.discordProfile.discordId,
      discordConnected: schema.discordProfile.discordConnected,
    })
    .from(schema.user)
    .leftJoin(
      schema.discordProfile,
      eq(schema.user.id, schema.discordProfile.userId)
    )
    .where(specificUserId ? eq(schema.user.id, specificUserId) : undefined);

  const usersWithGoalReminders = new Set(overdueGoals.map((g) => g.userId));

  for (const user of usersWithDiscord) {
    if (!usersWithGoalReminders.has(user.id)) continue;

    const hasDiscord = user.discordId && user.discordConnected;
    const status = hasDiscord
      ? `${colors.green}Discord connecté${colors.reset}`
      : `${colors.red}Discord non connecté${colors.reset}`;

    console.log(`  ${user.name || user.email} (${user.id}): ${status}`);
  }

  // Historique des reminders envoyés
  log.header("Historique des reminders (30 derniers jours)");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentReminders = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.goalReminders)
    .where(gte(schema.goalReminders.sentAt, thirtyDaysAgo));

  log.info(`Reminders envoyés: ${recentReminders[0]?.count ?? 0}`);

  // Mode envoi
  if (shouldSend && overdueGoals.length > 0) {
    log.header(
      forceMode
        ? "Envoi FORCE des reminders (tous les reminders activés)"
        : "Envoi des reminders en retard"
    );

    for (const goal of overdueGoals) {
      log.subheader(`Traitement: ${goal.title}`);

      // Récupérer les infos Discord de l'utilisateur
      const [userData] = await db
        .select({
          discordId: schema.discordProfile.discordId,
          discordConnected: schema.discordProfile.discordConnected,
        })
        .from(schema.user)
        .leftJoin(
          schema.discordProfile,
          eq(schema.user.id, schema.discordProfile.userId)
        )
        .where(eq(schema.user.id, goal.userId))
        .limit(1);

      if (!userData?.discordId || !userData.discordConnected) {
        log.warning(`Utilisateur ${goal.userId} sans Discord connecté - skip`);
        continue;
      }

      // Envoyer le DM Discord
      try {
        const frequencyText =
          {
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
          }[goal.reminderFrequency as string] ?? "Unknown";

        const message = {
          embeds: [
            {
              title: "⏰ Goal Reminder",
              description: "Time to work on your goal!",
              color: 0x3498db,
              fields: [
                {
                  name: "🎯 Goal",
                  value: goal.title,
                  inline: false,
                },
                {
                  name: "📝 Description",
                  value: goal.description || "No description",
                  inline: false,
                },
                {
                  name: "⏰ Frequency",
                  value: `${frequencyText} reminder`,
                  inline: true,
                },
              ],
              footer: {
                text: "Altiora - Your productivity assistant",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        // Créer le canal DM
        const createDMResponse = await fetch(
          "https://discord.com/api/users/@me/channels",
          {
            method: "POST",
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient_id: userData.discordId,
            }),
          }
        );

        if (!createDMResponse.ok) {
          throw new Error(
            `Failed to create DM channel: ${createDMResponse.status}`
          );
        }

        const dmChannel = await createDMResponse.json();

        // Envoyer le message
        const sendMessageResponse = await fetch(
          `https://discord.com/api/channels/${dmChannel.id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
          }
        );

        if (!sendMessageResponse.ok) {
          throw new Error(`Failed to send DM: ${sendMessageResponse.status}`);
        }

        log.success(`DM envoyé à ${userData.discordId}`);

        // Enregistrer le reminder
        const reminderId = createId();
        await db.insert(schema.goalReminders).values({
          id: reminderId,
          goalId: goal.id,
          userId: goal.userId,
          reminderType: "discord",
          sentAt: new Date(),
          status: "sent",
        });

        // Mettre à jour la prochaine date
        const nextDate = new Date();
        switch (goal.reminderFrequency) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }
        nextDate.setHours(9, 0, 0, 0);

        await db
          .update(schema.goals)
          .set({
            nextReminderDate: nextDate,
            lastReminderSent: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.goals.id, goal.id));

        log.success(
          `Prochain reminder programmé: ${nextDate.toLocaleString("fr-FR")}`
        );
      } catch (error) {
        log.error(`Échec de l'envoi: ${error}`);
      }
    }
  } else if (shouldSend && overdueGoals.length === 0) {
    log.info("Aucun reminder à envoyer");
  } else {
    log.info(
      `Mode diagnostic (dry-run). Utilisez ${colors.cyan}--send${colors.reset} pour envoyer les reminders en retard, ou ${colors.cyan}--send --force${colors.reset} pour forcer l'envoi de tous les reminders activés.`
    );
  }

  // Résumé final
  log.header("Résumé");
  console.log(`
  ${colors.cyan}Configuration:${colors.reset}
    - Mode: ${shouldSend ? (forceMode ? "Envoi FORCE" : "Envoi") : "Diagnostic"}
    - Fix: ${shouldFix ? "Oui" : "Non"}
    - Utilisateur: ${specificUserId ?? "Tous"}

  ${colors.cyan}État du système:${colors.reset}
    - Goals actifs: ${activeGoals[0]?.count ?? 0}
    - Reminders activés: ${goalsWithReminders[0]?.count ?? 0}
    - Reminders en retard: ${overdueGoals.length}
    - Reminders envoyés (30j): ${recentReminders[0]?.count ?? 0}
`);

  await pool.end();
  log.success("Test terminé");
}

main().catch((error) => {
  log.error(`Erreur fatale: ${error}`);
  process.exit(1);
});
