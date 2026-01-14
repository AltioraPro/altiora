/**
 * Script de test pour le système de notifications d'habitudes Discord
 *
 * Usage:
 *   bun run scripts/test-habit-reminders.ts              # Mode diagnostic (dry-run)
 *   bun run scripts/test-habit-reminders.ts --send       # Envoie les reminders (respecte l'heure 19h)
 *   bun run scripts/test-habit-reminders.ts --send --force  # Force l'envoi immédiat (ignore l'heure)
 *   bun run scripts/test-habit-reminders.ts --user <id>  # Test pour un utilisateur spécifique
 *   bun run scripts/test-habit-reminders.ts --enable <id> # Active les reminders pour un utilisateur
 *   bun run scripts/test-habit-reminders.ts --disable <id> # Désactive les reminders pour un utilisateur
 */

import "dotenv/config";
import { and, eq } from "drizzle-orm";
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
const forceMode = args.includes("--force");
const userIdIndex = args.indexOf("--user");
const specificUserId = userIdIndex !== -1 ? args[userIdIndex + 1] : undefined;
const enableIndex = args.indexOf("--enable");
const enableUserId = enableIndex !== -1 ? args[enableIndex + 1] : undefined;
const disableIndex = args.indexOf("--disable");
const disableUserId = disableIndex !== -1 ? args[disableIndex + 1] : undefined;

/**
 * Get the current date string in user's timezone (YYYY-MM-DD format)
 */
function getDateInTimezone(timezone: string): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return formatter.format(now);
}

/**
 * Get current hour in user's timezone
 */
function getHourInTimezone(timezone: string): number {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
    });
    return Number.parseInt(formatter.format(now), 10);
}

async function main() {
    log.header("Test du système de Habit Reminders Discord - Altiora");

    // Vérification des variables d'environnement
    log.subheader("Vérification de la configuration");

    if (!process.env.DATABASE_URL) {
        log.error("DATABASE_URL non définie");
        process.exit(1);
    }
    log.success("DATABASE_URL configurée");

    if (process.env.DISCORD_BOT_TOKEN) {
        log.success("DISCORD_BOT_TOKEN configurée");
    } else {
        log.warning(
            "DISCORD_BOT_TOKEN non définie - Les DMs Discord ne fonctionneront pas"
        );
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

    // Mode --enable : Activer les reminders pour un utilisateur
    if (enableUserId) {
        log.header(
            `Activation des reminders pour l'utilisateur ${enableUserId}`
        );

        const [profile] = await db
            .select()
            .from(schema.discordProfile)
            .where(eq(schema.discordProfile.userId, enableUserId))
            .limit(1);

        if (!profile) {
            log.error(
                `Profil Discord non trouvé pour l'utilisateur ${enableUserId}`
            );
            await pool.end();
            process.exit(1);
        }

        await db
            .update(schema.discordProfile)
            .set({ habitRemindersEnabled: true })
            .where(eq(schema.discordProfile.userId, enableUserId));

        log.success(`Habit reminders activés pour ${enableUserId}`);
        await pool.end();
        return;
    }

    // Mode --disable : Désactiver les reminders pour un utilisateur
    if (disableUserId) {
        log.header(
            `Désactivation des reminders pour l'utilisateur ${disableUserId}`
        );

        await db
            .update(schema.discordProfile)
            .set({ habitRemindersEnabled: false })
            .where(eq(schema.discordProfile.userId, disableUserId));

        log.success(`Habit reminders désactivés pour ${disableUserId}`);
        await pool.end();
        return;
    }

    // Statistiques générales
    log.header("Statistiques générales");

    const totalUsers = await db
        .select({ id: schema.user.id })
        .from(schema.user);
    log.info(`Total d'utilisateurs: ${totalUsers.length}`);

    const usersWithDiscord = await db
        .select({
            userId: schema.discordProfile.userId,
            discordId: schema.discordProfile.discordId,
            discordConnected: schema.discordProfile.discordConnected,
            habitRemindersEnabled: schema.discordProfile.habitRemindersEnabled,
            lastHabitReminderSent: schema.discordProfile.lastHabitReminderSent,
        })
        .from(schema.discordProfile)
        .where(eq(schema.discordProfile.discordConnected, true));

    log.info(`Utilisateurs avec Discord connecté: ${usersWithDiscord.length}`);

    const usersWithRemindersEnabled = usersWithDiscord.filter(
        (u) => u.habitRemindersEnabled
    );
    log.info(
        `Utilisateurs avec habit reminders activés: ${usersWithRemindersEnabled.length}`
    );

    // Détail des utilisateurs avec habit reminders
    log.header("Utilisateurs avec habit reminders activés");

    for (const userData of usersWithRemindersEnabled) {
        const [userInfo] = await db
            .select({
                name: schema.user.name,
                email: schema.user.email,
                timezone: schema.user.timezone,
            })
            .from(schema.user)
            .where(eq(schema.user.id, userData.userId))
            .limit(1);

        const timezone = userInfo?.timezone ?? "UTC";
        const currentHour = getHourInTimezone(timezone);
        const is7PM = currentHour === 19;

        console.log(`
  ${colors.cyan}▸ ${userInfo?.name || userInfo?.email || userData.userId}${colors.reset}
    User ID: ${userData.userId}
    Discord ID: ${userData.discordId}
    Timezone: ${timezone}
    Heure actuelle: ${currentHour}:00
    ${is7PM ? `${colors.green}✓ C'est 19h ! Reminder sera envoyé${colors.reset}` : `${colors.yellow}⏳ En attente de 19h${colors.reset}`}
    Dernier reminder: ${userData.lastHabitReminderSent?.toLocaleString("fr-FR") ?? "Jamais"}
`);
    }

    // Vérifier les habitudes des utilisateurs
    if (specificUserId || usersWithRemindersEnabled.length > 0) {
        log.header("Vérification des habitudes");

        const usersToCheck = specificUserId
            ? [{ userId: specificUserId }]
            : usersWithRemindersEnabled;

        for (const userData of usersToCheck) {
            const [userInfo] = await db
                .select({
                    name: schema.user.name,
                    timezone: schema.user.timezone,
                })
                .from(schema.user)
                .where(eq(schema.user.id, userData.userId))
                .limit(1);

            const timezone = userInfo?.timezone ?? "UTC";
            const todayDate = getDateInTimezone(timezone);

            log.subheader(
                `Habitudes de ${userInfo?.name || userData.userId} (${todayDate})`
            );

            // Get habits
            const userHabits = await db
                .select({
                    id: schema.habits.id,
                    title: schema.habits.title,
                    emoji: schema.habits.emoji,
                })
                .from(schema.habits)
                .where(
                    and(
                        eq(schema.habits.userId, userData.userId),
                        eq(schema.habits.isActive, true)
                    )
                );

            if (userHabits.length === 0) {
                log.warning("Aucune habitude active");
                continue;
            }

            // Get today's completions
            const completions = await db
                .select({
                    habitId: schema.habitCompletions.habitId,
                })
                .from(schema.habitCompletions)
                .where(
                    and(
                        eq(schema.habitCompletions.userId, userData.userId),
                        eq(schema.habitCompletions.completionDate, todayDate),
                        eq(schema.habitCompletions.isCompleted, true)
                    )
                );

            const completedHabitIds = new Set(
                completions.map((c) => c.habitId)
            );

            let completedCount = 0;
            for (const habit of userHabits) {
                const isCompleted = completedHabitIds.has(habit.id);
                if (isCompleted) {
                    completedCount++;
                }
                console.log(
                    `    ${isCompleted ? `${colors.green}✅` : `${colors.red}❌`}${colors.reset} ${habit.emoji} ${habit.title}`
                );
            }

            const progress = Math.round(
                (completedCount / userHabits.length) * 100
            );
            console.log(
                `\n    ${colors.cyan}Progression: ${completedCount}/${userHabits.length} (${progress}%)${colors.reset}\n`
            );
        }
    }

    // Mode envoi
    if (shouldSend && usersWithRemindersEnabled.length > 0) {
        log.header(
            forceMode
                ? "Envoi FORCE des reminders (ignore l'heure)"
                : "Envoi des reminders (respect de l'heure 19h)"
        );

        for (const userData of usersWithRemindersEnabled) {
            if (specificUserId && userData.userId !== specificUserId) {
                continue;
            }

            const [userInfo] = await db
                .select({
                    name: schema.user.name,
                    timezone: schema.user.timezone,
                })
                .from(schema.user)
                .where(eq(schema.user.id, userData.userId))
                .limit(1);

            const timezone = userInfo?.timezone ?? "UTC";
            const currentHour = getHourInTimezone(timezone);
            const is7PM = currentHour === 19;

            if (!(forceMode || is7PM)) {
                log.info(
                    `Skip ${userInfo?.name || userData.userId}: pas 19h dans son timezone (${currentHour}:00)`
                );
                continue;
            }

            log.subheader(`Envoi à ${userInfo?.name || userData.userId}`);

            const todayDate = getDateInTimezone(timezone);

            // Get habits
            const userHabits = await db
                .select({
                    id: schema.habits.id,
                    title: schema.habits.title,
                    emoji: schema.habits.emoji,
                })
                .from(schema.habits)
                .where(
                    and(
                        eq(schema.habits.userId, userData.userId),
                        eq(schema.habits.isActive, true)
                    )
                );

            if (userHabits.length === 0) {
                log.warning("Aucune habitude active - skip");
                continue;
            }

            // Get today's completions
            const completions = await db
                .select({
                    habitId: schema.habitCompletions.habitId,
                })
                .from(schema.habitCompletions)
                .where(
                    and(
                        eq(schema.habitCompletions.userId, userData.userId),
                        eq(schema.habitCompletions.completionDate, todayDate),
                        eq(schema.habitCompletions.isCompleted, true)
                    )
                );

            const completedHabitIds = new Set(
                completions.map((c) => c.habitId)
            );

            const habitsWithStatus = userHabits.map((habit) => ({
                ...habit,
                isCompleted: completedHabitIds.has(habit.id),
            }));

            const incompleteHabits = habitsWithStatus.filter(
                (h) => !h.isCompleted
            );

            // Skip if all habits are completed
            if (incompleteHabits.length === 0) {
                log.info(
                    `Skip ${userInfo?.name || userData.userId}: toutes les habitudes sont complétées`
                );
                continue;
            }

            // Build and send Discord message
            try {
                const completedCount =
                    habitsWithStatus.length - incompleteHabits.length;
                const totalCount = habitsWithStatus.length;
                const progress = Math.round(
                    (completedCount / totalCount) * 100
                );

                // Create progress bar
                const progressBarLength = 10;
                const filledBlocks = Math.round(
                    (progress / 100) * progressBarLength
                );
                const emptyBlocks = progressBarLength - filledBlocks;
                const progressBar =
                    "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

                // Create habit list
                const habitsList = habitsWithStatus
                    .map(
                        (h) =>
                            `${h.isCompleted ? "✅" : "❌"} ${h.emoji} ${h.title}`
                    )
                    .join("\n");

                // Color based on progress
                let embedColor = 0xe7_4c_3c; // Red
                if (progress >= 75) {
                    embedColor = 0x2e_cc_71; // Green
                } else if (progress >= 50) {
                    embedColor = 0xf3_9c_12; // Orange
                } else if (progress >= 25) {
                    embedColor = 0xe6_7e_22; // Dark orange
                }

                // Incomplete habits - reminder message
                const message = {
                    embeds: [
                        {
                            title: "🔔 Daily Habit Reminder",
                            description: `Hey! You still have **${incompleteHabits.length}** habit${incompleteHabits.length > 1 ? "s" : ""} to complete today.\n\nDon't forget to check them off before the day ends!`,
                            color: embedColor,
                            fields: [
                                {
                                    name: "📊 Today's Progress",
                                    value: `${progressBar} ${progress}%\n${completedCount}/${totalCount} habits completed`,
                                    inline: false,
                                },
                                {
                                    name: "📋 Your Habits",
                                    value: habitsList,
                                    inline: false,
                                },
                                {
                                    name: "⏰ Incomplete",
                                    value: incompleteHabits
                                        .map((h) => `${h.emoji} ${h.title}`)
                                        .join("\n"),
                                    inline: false,
                                },
                            ],
                            footer: {
                                text: "Altiora - Stay consistent, stay productive! 💪",
                            },
                            timestamp: new Date().toISOString(),
                        },
                    ],
                };

                // Create DM channel
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

                // Send message
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
                    throw new Error(
                        `Failed to send DM: ${sendMessageResponse.status}`
                    );
                }

                // Update last reminder sent
                await db
                    .update(schema.discordProfile)
                    .set({ lastHabitReminderSent: new Date() })
                    .where(eq(schema.discordProfile.userId, userData.userId));

                log.success(`DM envoyé à ${userData.discordId}`);
            } catch (error) {
                log.error(`Échec de l'envoi: ${error}`);
            }
        }
    } else if (shouldSend && usersWithRemindersEnabled.length === 0) {
        log.info("Aucun utilisateur avec habit reminders activés");
    } else {
        log.info("Mode diagnostic (dry-run). Options disponibles:");
        console.log(`
    ${colors.cyan}--send${colors.reset}          Envoie les reminders (respecte l'heure 19h)
    ${colors.cyan}--send --force${colors.reset}  Force l'envoi immédiat (ignore l'heure)
    ${colors.cyan}--user <id>${colors.reset}     Test pour un utilisateur spécifique
    ${colors.cyan}--enable <id>${colors.reset}   Active les reminders pour un utilisateur
    ${colors.cyan}--disable <id>${colors.reset}  Désactive les reminders pour un utilisateur
`);
    }

    // Résumé final
    log.header("Résumé");
    console.log(`
  ${colors.cyan}Configuration:${colors.reset}
    - Mode: ${shouldSend ? (forceMode ? "Envoi FORCE" : "Envoi") : "Diagnostic"}
    - Utilisateur: ${specificUserId ?? "Tous"}

  ${colors.cyan}État du système:${colors.reset}
    - Utilisateurs total: ${totalUsers.length}
    - Discord connecté: ${usersWithDiscord.length}
    - Habit reminders activés: ${usersWithRemindersEnabled.length}
`);

    await pool.end();
    log.success("Test terminé");
}

main().catch((error) => {
    log.error(`Erreur fatale: ${error}`);
    process.exit(1);
});
