import { z } from "zod";

// Types pour Discord
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

// Configuration Discord
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_BOT_WEBHOOK_URL = process.env.DISCORD_BOT_WEBHOOK_URL || 'http://localhost:3001';
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

// S'assurer que REDIRECT_URI n'est jamais undefined
if (!REDIRECT_URI) {
  throw new Error('DISCORD_REDIRECT_URI must be defined');
}

// Validation de la configuration
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN || !REDIRECT_URI) {
  console.error('Discord configuration missing:', {
    clientId: !!DISCORD_CLIENT_ID,
    clientSecret: !!DISCORD_CLIENT_SECRET,
    guildId: !!DISCORD_GUILD_ID,
    botToken: !!DISCORD_BOT_TOKEN,
    redirectUri: !!REDIRECT_URI,
  });
}

// Mapping des ranks vers les IDs de rôles Discord
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
  /**
   * Génère l'URL d'autorisation Discord OAuth2
   */
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds.join',
      state,
    });
    
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  static async exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord token exchange failed:', response.status, errorText);
      throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Récupère les informations de l'utilisateur Discord
   */
  static async getUserInfo(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Discord user info');
    }

    return response.json();
  }

  /**
   * Ajoute l'utilisateur au serveur Discord
   */
  static async addUserToGuild(discordId: string, accessToken: string): Promise<void> {
    const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to add user to Discord guild');
    }
  }

  /**
   * Met à jour le rôle de l'utilisateur sur Discord
   */
  static async updateUserRole(discordId: string, rank: string): Promise<void> {
    const roleId = RANK_ROLE_MAPPING[rank];
    if (!roleId) {
      throw new Error(`No Discord role mapping found for rank: ${rank}`);
    }

    // Récupérer les rôles actuels de l'utilisateur
    const memberResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!memberResponse.ok) {
      throw new Error('Failed to fetch Discord member info');
    }

    const member: DiscordGuildMember = await memberResponse.json();
    
    // Ajouter le nouveau rôle et retirer les anciens rôles de rank
    const newRoles = [...member.roles.filter(roleId => !Object.values(RANK_ROLE_MAPPING).includes(roleId)), roleId];

    const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roles: newRoles,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update Discord user role');
    }
  }

  /**
   * Vérifie si l'utilisateur est membre du serveur
   */
  static async isUserInGuild(discordId: string): Promise<boolean> {
    const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    return response.ok;
  }

  /**
   * Synchronise le rank de l'utilisateur avec Discord
   */
  static async syncUserRank(discordId: string, rank: string): Promise<void> {
    try {
      // Vérifier si l'utilisateur est dans le serveur
      const isInGuild = await this.isUserInGuild(discordId);
      if (!isInGuild) {
        throw new Error('User is not in Discord guild');
      }

      // Mettre à jour le rôle
      await this.updateUserRole(discordId, rank);
    } catch (error) {
      console.error('Failed to sync user rank with Discord:', error);
      throw error;
    }
  }

  /**
   * Envoie une requête webhook au bot Discord pour synchronisation automatique
   */
  static async sendWebhookSync(discordId: string, rank: string): Promise<void> {
    console.log(`🔄 [Discord Webhook] Tentative de synchronisation pour ${discordId} -> ${rank}`);
    
    try {
      const webhookUrl = `${DISCORD_BOT_WEBHOOK_URL}/webhook/sync-rank`;
      console.log(`📡 [Discord Webhook] Envoi vers: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId,
          rank,
        }),
      });

      console.log(`📊 [Discord Webhook] Réponse: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [Discord Webhook] Erreur HTTP: ${response.status} - ${errorText}`);
        throw new Error(`Webhook failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [Discord Webhook] Résultat:`, result);
      
      if (!result.success) {
        console.error(`❌ [Discord Webhook] Échec de la synchronisation:`, result);
        throw new Error('Webhook returned failure');
      }
      
      console.log(`🎉 [Discord Webhook] Synchronisation réussie pour ${discordId} -> ${rank}`);
    } catch (error) {
      console.error(`💥 [Discord Webhook] Erreur lors de l'envoi du webhook:`, error);
      throw error;
    }
  }

  /**
   * Synchronise automatiquement le rank de l'utilisateur avec Discord
   * Utilise le webhook pour une synchronisation plus rapide
   */
  static async autoSyncUserRank(discordId: string, rank: string): Promise<void> {
    console.log(`🚀 [Discord AutoSync] Début de synchronisation automatique pour ${discordId} -> ${rank}`);
    
    try {
      // Essayer d'abord le webhook pour une synchronisation rapide
      console.log(`🔄 [Discord AutoSync] Tentative webhook...`);
      await this.sendWebhookSync(discordId, rank);
      console.log(`✅ [Discord AutoSync] Synchronisation webhook réussie`);
    } catch (webhookError) {
      console.warn(`⚠️ [Discord AutoSync] Webhook échoué, fallback vers API directe:`, webhookError);
      
      // Fallback vers l'API directe si le webhook échoue
      console.log(`🔄 [Discord AutoSync] Tentative API directe...`);
      await this.syncUserRank(discordId, rank);
      console.log(`✅ [Discord AutoSync] Synchronisation API directe réussie`);
    }
    
    console.log(`🎉 [Discord AutoSync] Synchronisation terminée pour ${discordId} -> ${rank}`);
  }

  /**
   * Synchronise automatiquement tous les utilisateurs Discord connectés
   */
  static async syncAllConnectedUsers(): Promise<{ success: number; failed: number }> {
    console.log(`🚀 [Discord BulkSync] Début de synchronisation de tous les utilisateurs`);
    
    const { db } = await import('@/server/db');
    const { users } = await import('@/server/db/schema');
    const { and, isNotNull, eq } = await import('drizzle-orm');

    try {
      // Récupérer tous les utilisateurs connectés à Discord
      console.log(`📊 [Discord BulkSync] Récupération des utilisateurs connectés...`);
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

      console.log(`👥 [Discord BulkSync] ${connectedUsers.length} utilisateurs connectés trouvés`);

      let successCount = 0;
      let failedCount = 0;

      for (const user of connectedUsers) {
        if (!user.discordId || !user.rank) {
          console.warn(`⚠️ [Discord BulkSync] Utilisateur ${user.id} sans discordId ou rank`);
          continue;
        }

        console.log(`🔄 [Discord BulkSync] Synchronisation de ${user.discordId} -> ${user.rank}`);
        
        try {
          await this.autoSyncUserRank(user.discordId, user.rank);
          
          // Mettre à jour le statut de synchronisation
          await db.update(users)
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

      console.log(`📊 [Discord BulkSync] Résultat final: ${successCount} succès, ${failedCount} échecs`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error(`💥 [Discord BulkSync] Erreur générale:`, error);
      throw error;
    }
  }

  /**
   * Envoie un message privé (DM) à un utilisateur Discord
   */
  static async sendDirectMessage(discordId: string, message: string | object): Promise<void> {
    try {
      // Créer un DM channel avec l'utilisateur
      const createDMResponse = await fetch('https://discord.com/api/users/@me/channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: discordId,
        }),
      });

      if (!createDMResponse.ok) {
        throw new Error(`Failed to create DM channel: ${createDMResponse.status}`);
      }

      const dmChannel = await createDMResponse.json();

      // Préparer le payload du message
      const messagePayload = typeof message === 'string' ? { content: message } : message;

      // Envoyer le message dans le DM
      const sendMessageResponse = await fetch(`https://discord.com/api/channels/${dmChannel.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      if (!sendMessageResponse.ok) {
        throw new Error(`Failed to send DM: ${sendMessageResponse.status}`);
      }

      console.log(`✅ [Discord DM] Message envoyé à ${discordId}`);
    } catch (error) {
      console.error(`❌ [Discord DM] Erreur lors de l'envoi du DM à ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Envoie un rappel d'objectif via Discord DM
   */
  static async sendGoalReminder(discordId: string, goal: Goal): Promise<void> {
    const message = this.formatGoalReminderMessage(goal);
    await this.sendDirectMessage(discordId, message);
  }

  /**
   * Envoie un message de félicitations quand un objectif est complété
   */
  static async sendGoalCompletion(discordId: string, goal: Goal): Promise<void> {
    const message = this.formatGoalCompletionMessage(goal);
    await this.sendDirectMessage(discordId, message);
  }

  /**
   * Formate le message de rappel d'objectif
   */
  private static formatGoalReminderMessage(goal: Goal): string {
    const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString('fr-FR') : 'Aucune date limite';
    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    // Emoji dynamique selon l'urgence
    let urgencyEmoji = '⏰';
    let urgencyText = '';
    if (daysLeft !== null) {
      if (daysLeft < 0) {
        urgencyEmoji = '🚨';
        urgencyText = '**URGENT**';
      } else if (daysLeft === 0) {
        urgencyEmoji = '⚡';
        urgencyText = '**AUJOURD\'HUI**';
      } else if (daysLeft <= 3) {
        urgencyEmoji = '🔥';
        urgencyText = '**Bientôt dû**';
      }
    }
    
    let message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${urgencyEmoji} **RAPPEL D'OBJECTIF** ${urgencyEmoji}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🎯 **${goal.title}**\n`;
    if (urgencyText) {
      message += `⚠️ ${urgencyText}\n\n`;
    }
    
    if (goal.description) {
      message += `📝 **Description:**\n> ${goal.description}\n\n`;
    }
    
    message += `📅 **Date limite:** ${deadline}`;
    
    if (daysLeft !== null) {
      if (daysLeft > 0) {
        message += ` \`${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}\``;
      } else if (daysLeft === 0) {
        message += ` \`À faire aujourd'hui !\``;
      } else {
        message += ` \`En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}\``;
      }
    }
    
    message += `\n\n💪 **N'oubliez pas de travailler sur cet objectif !**\n`;
    message += `🚀 **Chaque petit pas compte vers votre succès !**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    return message;
  }

  /**
   * Formate le message de félicitations pour un objectif complété
   */
  private static formatGoalCompletionMessage(goal: Goal): string {
    const completionDate = new Date().toLocaleDateString('fr-FR');
    const completionTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    let message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🎉 **FÉLICITATIONS ! OBJECTIF ATTEINT !** 🎉\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🏆 **${goal.title}**\n\n`;
    
    if (goal.description) {
      message += `📝 **Description:**\n> ${goal.description}\n\n`;
    }
    
    message += `✅ **Complété le:** ${completionDate} à ${completionTime}\n\n`;
    
    // Messages de motivation aléatoires
    const motivationalMessages = [
      "🌟 **Vous êtes incroyable ! Continuez comme ça !** 🌟",
      "🔥 **Un objectif de plus dans votre collection de succès !** 🔥",
      "💫 **Votre persévérance porte ses fruits !** 💫",
      "⭐ **Chaque accomplissement vous rapproche de vos rêves !** ⭐",
      "🚀 **Vous prouvez que tout est possible avec de la détermination !** 🚀"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    message += `${randomMessage}\n\n`;
    
    message += `💪 **Prochain défi ?** Créez un nouvel objectif pour continuer votre progression !\n`;
    message += `📈 **Votre parcours d'excellence continue...**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    return message;
  }
}

// Schémas de validation
export const discordAuthSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const discordSyncSchema = z.object({
  discordId: z.string(),
  rank: z.string(),
}); 