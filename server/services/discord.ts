import { z } from "zod";

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

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_BOT_WEBHOOK_URL =
  process.env.DISCORD_BOT_WEBHOOK_URL || "http://localhost:3001";
const REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

if (!REDIRECT_URI) {
  throw new Error("DISCORD_REDIRECT_URI must be defined");
}

if (
  !DISCORD_CLIENT_ID ||
  !DISCORD_CLIENT_SECRET ||
  !DISCORD_GUILD_ID ||
  !DISCORD_BOT_TOKEN ||
  !REDIRECT_URI
) {
  console.error("Discord configuration missing:", {
    clientId: !!DISCORD_CLIENT_ID,
    clientSecret: !!DISCORD_CLIENT_SECRET,
    guildId: !!DISCORD_GUILD_ID,
    botToken: !!DISCORD_BOT_TOKEN,
    redirectUri: !!REDIRECT_URI,
  });
}

const RANK_ROLE_MAPPING: Record<string, string> = {
  NEW: process.env.DISCORD_ROLE_NEW!,
  BEGINNER: process.env.DISCORD_ROLE_BEGINNER!,
  RISING: process.env.DISCORD_ROLE_RISING!,
  CHAMPION: process.env.DISCORD_ROLE_CHAMPION!,
  EXPERT: process.env.DISCORD_ROLE_EXPERT!,
  LEGEND: process.env.DISCORD_ROLE_LEGEND!,
  MASTER: process.env.DISCORD_ROLE_MASTER!,
  GRANDMASTER: process.env.DISCORD_ROLE_GRANDMASTER!,
  IMMORTAL: process.env.DISCORD_ROLE_IMMORTAL!,
};

export class DiscordService {
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "identify guilds.join",
      state,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    code: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
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
  }

  static async getUserInfo(accessToken: string): Promise<DiscordUser> {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Discord user info");
    }

    return response.json();
  }

  static async addUserToGuild(
    discordId: string,
    accessToken: string
  ): Promise<void> {
    const response = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
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
  }

  static async updateUserRole(discordId: string, rank: string): Promise<void> {
    const roleId = RANK_ROLE_MAPPING[rank];
    if (!roleId) {
      throw new Error(`No Discord role mapping found for rank: ${rank}`);
    }

    const memberResponse = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
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
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
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
  }

  static async isUserInGuild(discordId: string): Promise<boolean> {
    const response = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    return response.ok;
  }

  static async syncUserRank(discordId: string, rank: string): Promise<void> {
    try {
      const isInGuild = await this.isUserInGuild(discordId);
      if (!isInGuild) {
        throw new Error("User is not in Discord guild");
      }

      await this.updateUserRole(discordId, rank);
    } catch (error) {
      console.error("Failed to sync user rank with Discord:", error);
      throw error;
    }
  }

  static async sendWebhookSync(discordId: string, rank: string): Promise<void> {
    console.log(
      `🔄 [Discord Webhook] Tentative de synchronisation pour ${discordId} -> ${rank}`
    );

    try {
      const webhookUrl = `${DISCORD_BOT_WEBHOOK_URL}/webhook/sync-rank`;
      console.log(`📡 [Discord Webhook] Envoi vers: ${webhookUrl}`);

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

      console.log(
        `📊 [Discord Webhook] Réponse: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ [Discord Webhook] Erreur HTTP: ${response.status} - ${errorText}`
        );
        throw new Error(`Webhook failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [Discord Webhook] Résultat:`, result);

      if (!result.success) {
        console.error(
          `❌ [Discord Webhook] Échec de la synchronisation:`,
          result
        );
        throw new Error("Webhook returned failure");
      }

      console.log(
        `🎉 [Discord Webhook] Synchronisation réussie pour ${discordId} -> ${rank}`
      );
    } catch (error) {
      console.error(
        `💥 [Discord Webhook] Erreur lors de l'envoi du webhook:`,
        error
      );
      throw error;
    }
  }

  static async autoSyncUserRank(
    discordId: string,
    rank: string
  ): Promise<void> {
    console.log(
      `🚀 [Discord AutoSync] Début de synchronisation automatique pour ${discordId} -> ${rank}`
    );
    try {
      console.log(`🔄 [Discord AutoSync] Tentative webhook...`);
      await this.sendWebhookSync(discordId, rank);
      console.log(`✅ [Discord AutoSync] Synchronisation webhook réussie`);
    } catch (webhookError) {
      console.warn(
        `⚠️ [Discord AutoSync] Webhook échoué, fallback vers API directe:`,
        webhookError
      );
      console.log(`🔄 [Discord AutoSync] Tentative API directe...`);
      await this.syncUserRank(discordId, rank);
      console.log(`✅ [Discord AutoSync] Synchronisation API directe réussie`);
    }

    console.log(
      `🎉 [Discord AutoSync] Synchronisation terminée pour ${discordId} -> ${rank}`
    );
  }

  static async syncAllConnectedUsers(): Promise<{
    success: number;
    failed: number;
  }> {
    console.log(
      `🚀 [Discord BulkSync] Début de synchronisation de tous les utilisateurs`
    );
    const { db } = await import("@/server/db");
    const { users } = await import("@/server/db/schema");
    const { and, isNotNull, eq } = await import("drizzle-orm");

    try {
      console.log(
        `📊 [Discord BulkSync] Récupération des utilisateurs connectés...`
      );
      const connectedUsers = await db.query.users.findMany({
        where: and(
          isNotNull(users.discordId),
          eq(users.discordConnected, true)
        ),
        columns: {
          id: true,
          discordId: true,
          rank: true,
          discordRoleSynced: true,
          lastDiscordSync: true,
        },
      });

      console.log(
        `👥 [Discord BulkSync] ${connectedUsers.length} utilisateurs connectés trouvés`
      );

      let successCount = 0;
      let failedCount = 0;

      for (const user of connectedUsers) {
        if (!user.discordId || !user.rank) {
          console.warn(
            `⚠️ [Discord BulkSync] Utilisateur ${user.id} sans discordId ou rank`
          );
          continue;
        }

        console.log(
          `🔄 [Discord BulkSync] Synchronisation de ${user.discordId} -> ${user.rank}`
        );

        try {
          await this.autoSyncUserRank(user.discordId, user.rank);

          await db
            .update(users)
            .set({
              discordRoleSynced: true,
              lastDiscordSync: new Date(),
            })
            .where(eq(users.id, user.id));

          successCount++;
          console.log(`✅ [Discord BulkSync] Succès pour ${user.discordId}`);
        } catch (error) {
          console.error(`❌ [Discord BulkSync] Échec pour ${user.id}:`, error);
          failedCount++;
        }
      }

      console.log(
        `📊 [Discord BulkSync] Résultat final: ${successCount} succès, ${failedCount} échecs`
      );
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error(`💥 [Discord BulkSync] Erreur générale:`, error);
      throw error;
    }
  }

  static async sendDirectMessage(
    discordId: string,
    message: string | object
  ): Promise<void> {
    try {
      const createDMResponse = await fetch(
        "https://discord.com/api/users/@me/channels",
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
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
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messagePayload),
        }
      );

      if (!sendMessageResponse.ok) {
        throw new Error(`Failed to send DM: ${sendMessageResponse.status}`);
      }

      console.log(`✅ [Discord DM] Message envoyé à ${discordId}`);
    } catch (error) {
      console.error(
        `❌ [Discord DM] Erreur lors de l'envoi du DM à ${discordId}:`,
        error
      );
      throw error;
    }
  }

  static async sendGoalReminder(discordId: string, goal: Goal): Promise<void> {
    const message = this.formatGoalReminderMessage(goal);
    await this.sendDirectMessage(discordId, message);
  }

  static async sendGoalCompletion(
    discordId: string,
    goal: Goal
  ): Promise<void> {
    const message = this.formatGoalCompletionMessage(goal);
    await this.sendDirectMessage(discordId, message);
  }

  private static formatGoalReminderMessage(goal: Goal): object {
    const deadline = goal.deadline
      ? new Date(goal.deadline).toLocaleDateString("en-US")
      : "No deadline";
    const daysLeft = goal.deadline
      ? Math.ceil(
          (new Date(goal.deadline).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    let color = 0x3498db; // Blue by default
    let urgencyText = "";
    let urgencyEmoji = "⏰";

    if (daysLeft !== null) {
      if (daysLeft < 0) {
        color = 0xe74c3c; // Red
        urgencyEmoji = "🚨";
        urgencyText = "**OVERDUE**";
      } else if (daysLeft === 0) {
        color = 0xf39c12; // Orange
        urgencyEmoji = "⚡";
        urgencyText = "**DUE TODAY**";
      } else if (daysLeft <= 3) {
        color = 0xe67e22; // Dark orange
        urgencyEmoji = "🔥";
        urgencyText = "**Due Soon**";
      } else if (daysLeft <= 7) {
        color = 0xf1c40f; // Yellow
        urgencyEmoji = "⏳";
        urgencyText = "**This Week**";
      }
    }

    const fields = [];

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
          color: color,
          fields: fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Keep pushing forward! 💪",
          },
        },
      ],
    };
  }

  private static formatGoalCompletionMessage(goal: Goal): object {
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

    const fields = [];

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
          color: 0x2ecc71, // Green for success
          fields: fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: randomMessage,
          },
        },
      ],
    };
  }
}

export const discordAuthSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const discordSyncSchema = z.object({
  discordId: z.string(),
  rank: z.string(),
});
