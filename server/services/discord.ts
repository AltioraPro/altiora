import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { DISCORD_ROLE } from "@/constants/discord";
import { env } from "@/env";
import { db } from "@/server/db";
import { user } from "../db/schema/auth";
import { discordProfile } from "../db/schema/discord-profile";

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
}

export interface DiscordGuildMember {
    user: DiscordUser;
    roles: string[];
    nick?: string;
}

export interface Goal {
    id: string;
    title: string;
    description?: string | null;
    deadline?: Date | null;
    userId: string;
}

const REDIRECT_URI =
    process.env.DISCORD_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

if (!REDIRECT_URI) {
    throw new Error("DISCORD_REDIRECT_URI must be defined");
}

if (
    !(
        env.DISCORD_CLIENT_ID &&
        env.DISCORD_CLIENT_SECRET &&
        env.DISCORD_GUILD_ID &&
        env.DISCORD_BOT_TOKEN &&
        REDIRECT_URI
    )
) {
    console.error("Discord configuration missing:", {
        clientId: !!env.DISCORD_CLIENT_ID,
        clientSecret: !!env.DISCORD_CLIENT_SECRET,
        guildId: !!env.DISCORD_GUILD_ID,
        botToken: !!env.DISCORD_BOT_TOKEN,
        redirectUri: !!env.DISCORD_REDIRECT_URI,
    });
}

const RANK_ROLE_MAPPING: Record<string, string> = {
    NEW: DISCORD_ROLE.NEW,
    BEGINNER: DISCORD_ROLE.BEGINNER,
    RISING: DISCORD_ROLE.RISING,
    CHAMPION: DISCORD_ROLE.CHAMPION,
    EXPERT: DISCORD_ROLE.EXPERT,
    LEGEND: DISCORD_ROLE.LEGEND,
    MASTER: DISCORD_ROLE.MASTER,
    GRANDMASTER: DISCORD_ROLE.GRANDMASTER,
    IMMORTAL: DISCORD_ROLE.IMMORTAL,
};

export const DiscordService = {
    getAuthUrl: (state: string): string => {
        const params = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "code",
            scope: "identify guilds.join",
            state,
        });

        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    },

    exchangeCodeForToken: async (
        code: string
    ): Promise<{ access_token: string; refresh_token: string }> => {
        const body = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
        });

        const response = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Discord token exchange failed:",
                response.status,
                errorText
            );
            throw new Error(
                `Failed to exchange code for token: ${response.status} ${errorText}`
            );
        }

        return response.json();
    },

    getUserInfo: async (accessToken: string): Promise<DiscordUser> => {
        const response = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch Discord user info");
        }

        return response.json();
    },

    addUserToGuild: async (
        discordId: string,
        accessToken: string
    ): Promise<void> => {
        const response = await fetch(
            `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: accessToken,
                }),
            }
        );

        if (!response.ok && response.status !== 204) {
            throw new Error("Failed to add user to Discord guild");
        }
    },

    updateUserRole: async (discordId: string, rank: string): Promise<void> => {
        const roleId = RANK_ROLE_MAPPING[rank];
        if (!roleId) {
            throw new Error(`No Discord role mapping found for rank: ${rank}`);
        }

        const memberResponse = await fetch(
            `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                },
            }
        );

        if (!memberResponse.ok) {
            throw new Error("Failed to fetch Discord member info");
        }

        const member: DiscordGuildMember = await memberResponse.json();

        const newRoles = [
            ...member.roles.filter(
                (roleId) => !Object.values(RANK_ROLE_MAPPING).includes(roleId)
            ),
            roleId,
        ];

        const response = await fetch(
            `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roles: newRoles,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update Discord user role");
        }
    },

    isUserInGuild: async (discordId: string): Promise<boolean> => {
        const response = await fetch(
            `https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                },
            }
        );

        return response.ok;
    },

    syncUserRank: async (discordId: string, rank: string): Promise<void> => {
        try {
            const isInGuild = await DiscordService.isUserInGuild(discordId);
            if (!isInGuild) {
                throw new Error("User is not in Discord guild");
            }

            await DiscordService.updateUserRole(discordId, rank);
        } catch (error) {
            console.error("Failed to sync user rank with Discord:", error);
            throw error;
        }
    },

    sendWebhookSync: async (discordId: string, rank: string): Promise<void> => {
        console.info(
            `🔄 [Discord Webhook] Tentative de synchronisation pour ${discordId} -> ${rank}`
        );

        try {
            const webhookUrl = `${env.DISCORD_BOT_WEBHOOK_URL}/webhook/sync-rank`;
            console.info(`📡 [Discord Webhook] Envoi vers: ${webhookUrl}`);

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    discordId,
                    rank,
                }),
            });

            console.info(
                `📊 [Discord Webhook] Réponse: ${response.status} ${response.statusText}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    `❌ [Discord Webhook] Erreur HTTP: ${response.status} - ${errorText}`
                );
                throw new Error(
                    `Webhook failed: ${response.status} ${errorText}`
                );
            }

            const result = await response.json();
            console.info("✅ [Discord Webhook] Résultat:", result);

            if (!result.success) {
                console.error(
                    "❌ [Discord Webhook] Échec de la synchronisation:",
                    result
                );
                throw new Error("Webhook returned failure");
            }

            console.info(
                `🎉 [Discord Webhook] Synchronisation réussie pour ${discordId} -> ${rank}`
            );
        } catch (error) {
            console.error(
                `💥 [Discord Webhook] Erreur lors de l'envoi du webhook:`,
                error
            );
            throw error;
        }
    },

    autoSyncUserRank: async (
        discordId: string,
        rank: string
    ): Promise<void> => {
        console.info(
            `🚀 [Discord AutoSync] Début de synchronisation automatique pour ${discordId} -> ${rank}`
        );
        try {
            console.info("🔄 [Discord AutoSync] Tentative webhook...");
            await DiscordService.sendWebhookSync(discordId, rank);
            console.info(
                "✅ [Discord AutoSync] Synchronisation webhook réussie"
            );
        } catch (webhookError) {
            console.warn(
                "⚠️ [Discord AutoSync] Webhook échoué, fallback vers API directe:",
                webhookError
            );
            console.info("🔄 [Discord AutoSync] Tentative API directe...");
            await DiscordService.syncUserRank(discordId, rank);
            console.info(
                "✅ [Discord AutoSync] Synchronisation API directe réussie"
            );
        }

        console.info(
            `🎉 [Discord AutoSync] Synchronisation terminée pour ${discordId} -> ${rank}`
        );
    },

    syncAllConnectedUsers: async (): Promise<{
        success: number;
        failed: number;
    }> => {
        console.info(
            "🚀 [Discord BulkSync] Début de synchronisation de tous les utilisateurs"
        );

        try {
            console.info(
                "📊 [Discord BulkSync] Récupération des utilisateurs connectés..."
            );

            const connectedUsers = await db
                .select({
                    id: user.id,
                    rank: user.rank,
                    discordRoleSynced: discordProfile.discordRoleSynced,
                    lastDiscordSync: discordProfile.lastDiscordSync,
                    discordId: discordProfile.discordId,
                })
                .from(user)
                .where(
                    and(
                        isNotNull(discordProfile.discordId),
                        eq(discordProfile.discordConnected, true)
                    )
                )
                .leftJoin(discordProfile, eq(user.id, discordProfile.userId));

            console.info(
                `👥 [Discord BulkSync] ${connectedUsers.length} utilisateurs connectés trouvés`
            );

            let successCount = 0;
            let failedCount = 0;

            for (const user of connectedUsers) {
                if (!(user.discordId && user.rank)) {
                    console.warn(
                        `⚠️ [Discord BulkSync] Utilisateur ${user.id} sans discordId ou rank`
                    );
                    continue;
                }

                console.info(
                    `🔄 [Discord BulkSync] Synchronisation de ${discordProfile.discordId} -> ${user.rank}`
                );

                try {
                    await DiscordService.autoSyncUserRank(
                        user.discordId,
                        user.rank
                    );

                    await db
                        .update(discordProfile)
                        .set({
                            discordRoleSynced: true,
                            lastDiscordSync: new Date(),
                        })
                        .where(eq(discordProfile.id, user.id));

                    successCount++;
                    console.info(
                        `✅ [Discord BulkSync] Succès pour ${user.discordId}`
                    );
                } catch (error) {
                    console.error(
                        `❌ [Discord BulkSync] Échec pour ${user.id}:`,
                        error
                    );
                    failedCount++;
                }
            }

            console.info(
                `📊 [Discord BulkSync] Résultat final: ${successCount} succès, ${failedCount} échecs`
            );
            return { success: successCount, failed: failedCount };
        } catch (error) {
            console.error("💥 [Discord BulkSync] Erreur générale:", error);
            throw error;
        }
    },

    sendDirectMessage: async (
        discordId: string,
        message: string | object
    ): Promise<void> => {
        try {
            const createDMResponse = await fetch(
                "https://discord.com/api/users/@me/channels",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        recipient_id: discordId,
                    }),
                }
            );

            if (!createDMResponse.ok) {
                throw new Error(
                    `Failed to create DM channel: ${createDMResponse.status}`
                );
            }

            const dmChannel = await createDMResponse.json();

            const messagePayload =
                typeof message === "string" ? { content: message } : message;

            const sendMessageResponse = await fetch(
                `https://discord.com/api/channels/${dmChannel.id}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(messagePayload),
                }
            );

            if (!sendMessageResponse.ok) {
                throw new Error(
                    `Failed to send DM: ${sendMessageResponse.status}`
                );
            }

            console.info(`✅ [Discord DM] Message envoyé à ${discordId}`);
        } catch (error) {
            console.error(
                `❌ [Discord DM] Erreur lors de l'envoi du DM à ${discordId}:`,
                error
            );
            throw error;
        }
    },

    sendGoalReminder: async (discordId: string, goal: Goal): Promise<void> => {
        const message = await DiscordService.formatGoalReminderMessage(goal);
        await DiscordService.sendDirectMessage(discordId, message);
    },

    sendGoalCompletion: async (
        discordId: string,
        goal: Goal
    ): Promise<void> => {
        const message = await DiscordService.formatGoalCompletionMessage(goal);
        await DiscordService.sendDirectMessage(discordId, message);
    },

    formatGoalReminderMessage: (goal: Goal): object => {
        const deadline = goal.deadline
            ? new Date(goal.deadline).toLocaleDateString("en-US")
            : "No deadline";
        const daysLeft = goal.deadline
            ? Math.ceil(
                  (new Date(goal.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
              )
            : null;

        let color = 0x34_98_db; // Blue by default
        let urgencyText = "";
        let urgencyEmoji = "⏰";

        if (daysLeft !== null) {
            if (daysLeft < 0) {
                color = 0xe7_4c_3c; // Red
                urgencyEmoji = "🚨";
                urgencyText = "**OVERDUE**";
            } else if (daysLeft === 0) {
                color = 0xf3_9c_12; // Orange
                urgencyEmoji = "⚡";
                urgencyText = "**DUE TODAY**";
            } else if (daysLeft <= 3) {
                color = 0xe6_7e_22; // Dark orange
                urgencyEmoji = "🔥";
                urgencyText = "**Due Soon**";
            } else if (daysLeft <= 7) {
                color = 0xf1_c4_0f; // Yellow
                urgencyEmoji = "⏳";
                urgencyText = "**This Week**";
            }
        }

        const fields: { name: string; value: string; inline: boolean }[] = [];

        if (goal.description) {
            fields.push({
                name: "📝 Description",
                value: goal.description,
                inline: false,
            });
        }

        fields.push({
            name: "📅 Deadline",
            value: deadline,
            inline: true,
        });

        if (daysLeft !== null) {
            let timeLeftText = "";
            if (daysLeft > 0) {
                timeLeftText = `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
            } else if (daysLeft === 0) {
                timeLeftText = "Due today!";
            } else {
                timeLeftText = `${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? "s" : ""} overdue`;
            }

            fields.push({
                name: "⏰ Time Remaining",
                value: timeLeftText,
                inline: true,
            });
        }

        return {
            embeds: [
                {
                    title: `${urgencyEmoji} Goal Reminder`,
                    description: urgencyText
                        ? `${urgencyText}\n\n**${goal.title}**`
                        : `**${goal.title}**`,
                    color,
                    fields,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Keep pushing forward! 💪",
                    },
                },
            ],
        };
    },

    formatGoalCompletionMessage: (goal: Goal) => {
        const completionDate = new Date().toLocaleDateString("en-US");
        const completionTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const motivationalMessages = [
            "🌟 You're absolutely incredible! Keep up the amazing work! 🌟",
            "🔥 Another goal crushed! Your success streak continues! 🔥",
            "💫 Your perseverance is paying off beautifully! 💫",
            "⭐ Every achievement brings you closer to your dreams! ⭐",
            "🚀 You're proving that anything is possible with determination! 🚀",
        ];

        const randomMessage =
            motivationalMessages[
                Math.floor(Math.random() * motivationalMessages.length)
            ];

        const fields: { name: string; value: string; inline: boolean }[] = [];

        if (goal.description) {
            fields.push({
                name: "📝 Description",
                value: goal.description,
                inline: false,
            });
        }

        fields.push({
            name: "✅ Completed On",
            value: `${completionDate} at ${completionTime}`,
            inline: true,
        });

        fields.push({
            name: "🎯 Goal Type",
            value: "Personal Achievement",
            inline: true,
        });

        return {
            embeds: [
                {
                    title: "🎉 Goal Completed!",
                    description: `**${goal.title}**`,
                    color: 0x2e_cc_71, // Green for success
                    fields,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: randomMessage,
                    },
                },
            ],
        };
    },
};

export const discordAuthSchema = z.object({
    code: z.string(),
    state: z.string(),
});

export const discordSyncSchema = z.object({
    discordId: z.string(),
    rank: z.string(),
});
