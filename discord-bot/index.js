import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Configuration
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const LOGS_CHANNEL_ID = process.env.DISCORD_LOGS_CHANNEL_ID; // Nouveau: ID du canal de logs
const RANK_ROLE_MAPPING = {
  NEW: process.env.DISCORD_ROLE_NEW,
  BEGINNER: process.env.DISCORD_ROLE_BEGINNER,
  RISING: process.env.DISCORD_ROLE_RISING,
  CHAMPION: process.env.DISCORD_ROLE_CHAMPION,
  EXPERT: process.env.DISCORD_ROLE_EXPERT,
  LEGEND: process.env.DISCORD_ROLE_LEGEND,
  MASTER: process.env.DISCORD_ROLE_MASTER,
  GRANDMASTER: process.env.DISCORD_ROLE_GRANDMASTER,
  IMMORTAL: process.env.DISCORD_ROLE_IMMORTAL,
};

// Système de logs Discord
class DiscordLogger {
  constructor(client, channelId) {
    this.client = client;
    this.channelId = channelId;
    this.queue = [];
    this.isProcessing = false;
  }

  async sendLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      data,
      timestamp
    };

    // Ajouter à la queue
    this.queue.push(logEntry);

    // Traiter la queue si pas déjà en cours
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const channel = await this.getLogChannel();
      if (!channel) {
        console.error('❌ [Discord Logger] Canal de logs non trouvé');
        return;
      }

      // Traiter les logs par batch (max 10 par message)
      const batchSize = 10;
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, batchSize);
        await this.sendBatch(channel, batch);
        
        // Attendre un peu entre les envois pour éviter le rate limiting
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('❌ [Discord Logger] Erreur lors de l\'envoi des logs:', error);
    } finally {
      this.isProcessing = false;
      
      // Si de nouveaux logs sont arrivés pendant le traitement, continuer
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  async getLogChannel() {
    if (!this.channelId) return null;

    try {
      const guild = this.client.guilds.cache.get(GUILD_ID);
      if (!guild) return null;

      const channel = await guild.channels.fetch(this.channelId);
      return channel instanceof TextChannel ? channel : null;
    } catch (error) {
      console.error('❌ [Discord Logger] Erreur lors de la récupération du canal:', error);
      return null;
    }
  }

  async sendBatch(channel, logs) {
    const embed = new EmbedBuilder()
      .setTitle(`🤖 Logs du Bot - ${new Date().toLocaleString('fr-FR')}`)
      .setColor(this.getColorForLevel(logs[0]?.level))
      .setTimestamp();

    let description = '';
    for (const log of logs) {
      const emoji = this.getEmojiForLevel(log.level);
      const time = new Date(log.timestamp).toLocaleTimeString('fr-FR');
      description += `${emoji} **${time}** [${log.level.toUpperCase()}] ${log.message}\n`;
      
      if (log.data) {
        description += `\`\`\`json\n${JSON.stringify(log.data, null, 2)}\`\`\`\n`;
      }
    }

    embed.setDescription(description);

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('❌ [Discord Logger] Erreur lors de l\'envoi du batch:', error);
    }
  }

  getColorForLevel(level) {
    switch (level) {
      case 'error': return 0xFF0000; // Rouge
      case 'warn': return 0xFFA500;  // Orange
      case 'info': return 0x0099FF;  // Bleu
      case 'success': return 0x00FF00; // Vert
      default: return 0x808080; // Gris
    }
  }

  getEmojiForLevel(level) {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📝';
    }
  }

  // Méthodes de convenance
  async error(message, data) {
    await this.sendLog('error', message, data);
  }

  async warn(message, data) {
    await this.sendLog('warn', message, data);
  }

  async info(message, data) {
    await this.sendLog('info', message, data);
  }

  async success(message, data) {
    await this.sendLog('success', message, data);
  }
}

// Initialiser le logger Discord
const discordLogger = new DiscordLogger(client, LOGS_CHANNEL_ID);

// Fonction pour logger vers Discord ET console
const log = {
  error: (message, data) => {
    console.error(`❌ ${message}`, data);
    discordLogger.error(message, data);
  },
  warn: (message, data) => {
    console.warn(`⚠️ ${message}`, data);
    discordLogger.warn(message, data);
  },
  info: (message, data) => {
    console.log(`ℹ️ ${message}`, data);
    discordLogger.info(message, data);
  },
  success: (message, data) => {
    console.log(`✅ ${message}`, data);
    discordLogger.success(message, data);
  }
};

client.once('ready', () => {
  log.success(`Bot connecté en tant que ${client.user.tag}`);
  log.info(`Serveur: ${client.guilds.cache.get(GUILD_ID)?.name}`);
  log.info(`Nombre de serveurs: ${client.guilds.cache.size}`);
  log.info(`Nombre total de membres: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`);
  
  // Vérifier les permissions du bot
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    const botMember = guild.members.cache.get(client.user.id);
    if (botMember) {
      log.info(`Permissions du bot:`, {
        permissions: botMember.permissions.toArray(),
        hasSendMessages: botMember.permissions.has('SendMessages'),
        hasReadMessageHistory: botMember.permissions.has('ReadMessageHistory'),
        hasViewChannel: botMember.permissions.has('ViewChannel'),
        hasUseExternalEmojis: botMember.permissions.has('UseExternalEmojis'),
        hasEmbedLinks: botMember.permissions.has('EmbedLinks')
      });
    }
    
    log.info(`Rôles configurés:`, {
      roles: Object.entries(RANK_ROLE_MAPPING).map(([rank, roleId]) => {
        const role = guild.roles.cache.get(roleId);
        return { rank, roleName: role ? role.name : 'Non trouvé', roleId };
      })
    });
  }

  // Vérifier le canal de logs
  if (LOGS_CHANNEL_ID) {
    log.info(`Canal de logs configuré: ${LOGS_CHANNEL_ID}`);
  } else {
    log.warn('Aucun canal de logs configuré - les logs ne seront envoyés que dans la console');
  }
  
  // Log de test pour vérifier que les commandes fonctionnent
  log.info(`Bot prêt à recevoir des commandes. Testez avec !help`);
});

// Log des événements de connexion/déconnexion
client.on('disconnect', () => {
  log.warn('Bot déconnecté');
});

client.on('reconnecting', () => {
  log.info('Bot en cours de reconnexion...');
});

client.on('resume', (replayed) => {
  log.success(`Bot reconnecté, ${replayed} événements rejoués`);
});

// Log des changements de membres
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
  
  if (addedRoles.size > 0) {
    log.info(`Rôles ajoutés à ${newMember.user.tag}`, {
      user: { id: newMember.id, tag: newMember.user.tag },
      roles: addedRoles.map(r => ({ id: r.id, name: r.name }))
    });
  }
  
  if (removedRoles.size > 0) {
    log.info(`Rôles supprimés de ${newMember.user.tag}`, {
      user: { id: newMember.id, tag: newMember.user.tag },
      roles: removedRoles.map(r => ({ id: r.id, name: r.name }))
    });
  }
});

// Log des nouveaux membres
client.on('guildMemberAdd', (member) => {
  log.success(`Nouveau membre: ${member.user.tag}`, {
    user: { id: member.id, tag: member.user.tag },
    joinedAt: member.joinedAt
  });
});

// Log des départs de membres
client.on('guildMemberRemove', (member) => {
  log.warn(`Membre parti: ${member.user.tag}`, {
    user: { id: member.id, tag: member.user.tag }
  });
});

// Commande pour synchroniser un utilisateur
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Log de debug pour voir si les messages sont reçus
  console.log(`📨 [Debug] Message reçu: "${message.content}" de ${message.author.tag}`);
  
  log.info(`Message de ${message.author.tag}`, {
    user: { id: message.author.id, tag: message.author.tag },
    content: message.content,
    channel: { id: message.channel.id, name: message.channel.name }
  });
  
  // Vérifier si le message commence par une commande
  if (!message.content.startsWith('!')) {
    console.log(`📨 [Debug] Message ignoré (pas de commande): "${message.content}"`);
    return;
  }
  
  console.log(`🤖 [Debug] Commande détectée: "${message.content}"`);
  
  // Commande !sync pour synchroniser un utilisateur
  if (message.content.startsWith('!sync')) {
    log.info(`Commande sync détectée`, {
      user: { id: message.author.id, tag: message.author.tag },
      content: message.content
    });

    const args = message.content.split(' ');
    if (args.length !== 3) {
      log.warn(`Usage incorrect de la commande sync`, {
        user: { id: message.author.id, tag: message.author.tag },
        content: message.content,
        expectedFormat: '!sync <discord_id> <rank>'
      });
      return message.reply('Usage: !sync <discord_id> <rank>');
    }
    
    const discordId = args[1];
    const rank = args[2].toUpperCase();
    
    log.info(`Synchronisation manuelle demandée`, {
      user: { id: message.author.id, tag: message.author.tag },
      targetUser: discordId,
      rank: rank
    });
    
    try {
      await syncUserRank(discordId, rank);
      log.success(`Synchronisation manuelle réussie`, {
        targetUser: discordId,
        rank: rank,
        requestedBy: { id: message.author.id, tag: message.author.tag }
      });
      message.reply(`✅ Rôle ${rank} synchronisé pour l'utilisateur <@${discordId}>`);
    } catch (error) {
      log.error(`Erreur de synchronisation manuelle`, {
        targetUser: discordId,
        rank: rank,
        requestedBy: { id: message.author.id, tag: message.author.tag },
        error: error.message
      });
      message.reply('❌ Erreur lors de la synchronisation');
    }
  }

  // Commande !health pour vérifier l'état du bot
  if (message.content === '!health') {
    log.info(`Commande health demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      const status = {
        bot: client.user ? '🟢 Connecté' : '🔴 Déconnecté',
        guild: client.guilds.cache.get(GUILD_ID) ? '🟢 Disponible' : '🔴 Indisponible',
        uptime: formatUptime(client.uptime),
        ping: `${client.ws.ping}ms`,
        guildCount: client.guilds.cache.size,
        memberCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        timestamp: new Date().toLocaleString('fr-FR')
      };

      const embed = new EmbedBuilder()
        .setTitle('🤖 État du Bot Discord')
        .setColor(0x0099FF)
        .addFields(
          { name: 'Bot', value: status.bot, inline: true },
          { name: 'Serveur', value: status.guild, inline: true },
          { name: 'Uptime', value: status.uptime, inline: true },
          { name: 'Ping', value: status.ping, inline: true },
          { name: 'Serveurs', value: status.guildCount.toString(), inline: true },
          { name: 'Membres', value: status.memberCount.toString(), inline: true },
          { name: 'Dernière mise à jour', value: status.timestamp, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
      log.success(`Statut de santé envoyé`, { status });
    } catch (error) {
      log.error(`Erreur lors de la commande health`, { error: error.message });
      message.reply('❌ Erreur lors de la récupération du statut');
    }
  }

  // Commande !roles pour lister les rôles configurés
  if (message.content === '!roles') {
    log.info(`Commande roles demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) {
        message.reply('❌ Serveur non trouvé');
        return;
      }

      const rolesInfo = Object.entries(RANK_ROLE_MAPPING).map(([rank, roleId]) => {
        const role = guild.roles.cache.get(roleId);
        return {
          rank,
          roleName: role ? role.name : 'Non trouvé',
          roleId,
          color: role ? role.hexColor : '#000000'
        };
      });

      const embed = new EmbedBuilder()
        .setTitle('🎭 Rôles Configurés')
        .setColor(0x00FF00)
        .setDescription('Liste des rôles de rank configurés pour la synchronisation');

      rolesInfo.forEach(({ rank, roleName, roleId, color }) => {
        embed.addFields({
          name: `${rank}`,
          value: `**Nom:** ${roleName}\n**ID:** ${roleId}\n**Couleur:** ${color}`,
          inline: true
        });
      });

      embed.setTimestamp();
      message.reply({ embeds: [embed] });
      log.success(`Liste des rôles envoyée`, { rolesCount: rolesInfo.length });
    } catch (error) {
      log.error(`Erreur lors de la commande roles`, { error: error.message });
      message.reply('❌ Erreur lors de la récupération des rôles');
    }
  }

  // Commande !help pour afficher l'aide
  if (message.content === '!help') {
    log.info(`Commande help demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    const embed = new EmbedBuilder()
      .setTitle('🤖 Commandes du Bot Discord')
      .setColor(0x0099FF)
      .setDescription('Liste des commandes disponibles')
      .addFields(
        { name: '📊 Statistiques', value: '`!stats` - Affiche les statistiques du serveur', inline: true },
        { name: '🔄 Synchronisation', value: '`!syncall` - Synchronise tous les utilisateurs', inline: true },
        { name: '🧪 Test', value: '`!test` - Teste la connexion API', inline: true },
        { name: '📝 Messages', value: '`!send` - Envoie un message avec image\n`!sendsimple` - Message simple avec image', inline: false },
        { name: '🗑️ Modération', value: '`!clear <nombre|max>` - Supprime des messages', inline: true },
        { name: '📋 Logs', value: '`!logs` - Affiche les logs récents', inline: true }
      )
      .addFields({
        name: 'Rangs disponibles',
        value: Object.keys(RANK_ROLE_MAPPING).join(', '),
        inline: false
      })
      .addFields({
        name: '📝 Exemples',
        value: '`!sync 123456789 BEGINNER`\n`!send 987654321 Voici un message simple !`\n`!send 987654321 https://example.com/image.jpg Voici un message avec image !`\n`!send 987654321 https://example.com/banner.jpg Voici un message avec bannière !`\n`!send 987654321 https://example.com/image.jpg https://example.com/banner.jpg Message avec image et bannière !`\n`!sendsimple Message simple`\n`!sendsimple https://cdn.discordapp.com/attachments/... Image avec message`\n`!sendsimple https://example.com/banner.jpg Message avec bannière !`\n`!sendsimple https://example.com/image.jpg https://example.com/banner.jpg Message avec image et bannière !`',
        inline: false
      })
      .addFields({
        name: '🔐 Permissions requises',
        value: '• `!send` : Admin, Modérateur, Staff ou permissions de gestion des messages\n• `!sendsimple` : Admin, Modérateur, Staff ou permissions de gestion des messages\n• `!clear` : Administrateur uniquement\n• Autres commandes : Aucune permission spéciale requise',
        inline: false
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
    log.info(`Aide envoyée`);
  }

  // Commande !stats pour afficher les statistiques du serveur
  if (message.content === '!stats') {
    log.info(`Commande stats demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) {
        message.reply('❌ Serveur non trouvé');
        return;
      }

      // Compter les membres par rôle de rank
      const roleStats = {};
      Object.entries(RANK_ROLE_MAPPING).forEach(([rank, roleId]) => {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          roleStats[rank] = role.members.size;
        }
      });

      const totalRankMembers = Object.values(roleStats).reduce((acc, count) => acc + count, 0);
      const totalMembers = guild.memberCount;

      const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques du Serveur: ${guild.name}`)
        .setColor(0x00FF00)
        .addFields(
          { name: '👥 Total Membres', value: totalMembers.toString(), inline: true },
          { name: '🎭 Membres avec Rangs', value: totalRankMembers.toString(), inline: true },
          { name: '📈 Pourcentage', value: `${((totalRankMembers / totalMembers) * 100).toFixed(1)}%`, inline: true }
        );

      // Ajouter les statistiques par rang
      Object.entries(roleStats).forEach(([rank, count]) => {
        embed.addFields({
          name: rank,
          value: `${count} membres`,
          inline: true
        });
      });

      embed.setTimestamp();
      message.reply({ embeds: [embed] });
      log.success(`Statistiques envoyées`, { 
        totalMembers, 
        totalRankMembers, 
        roleStats 
      });
    } catch (error) {
      log.error(`Erreur lors de la commande stats`, { error: error.message });
      message.reply('❌ Erreur lors de la récupération des statistiques');
    }
  }

  // Commande !syncall pour synchroniser tous les utilisateurs connectés
  if (message.content === '!syncall') {
    log.info(`Commande syncall demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      // Envoyer une requête au webhook pour synchroniser tous les utilisateurs
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/sync-all`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      const embed = new EmbedBuilder()
        .setTitle('🔄 Synchronisation Globale')
        .setColor(0x00FF00)
        .addFields(
          { name: '✅ Succès', value: result.success?.toString() || '0', inline: true },
          { name: '❌ Échecs', value: result.failed?.toString() || '0', inline: true },
          { name: '📊 Total', value: ((result.success || 0) + (result.failed || 0)).toString(), inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
      log.success(`Synchronisation globale demandée`, result);
    } catch (error) {
      log.error(`Erreur lors de la synchronisation globale`, { error: error.message });
      message.reply('❌ Erreur lors de la synchronisation globale');
    }
  }

  // Commande !test pour tester la connexion avec l'API
  if (message.content === '!test') {
    log.info(`Commande test demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      const healthUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`;
      const response = await fetch(healthUrl);
      
      const embed = new EmbedBuilder()
        .setTitle('🧪 Test de Connexion API')
        .setColor(response.ok ? 0x00FF00 : 0xFF0000)
        .addFields(
          { name: 'Status', value: response.ok ? '🟢 Connecté' : '🔴 Erreur', inline: true },
          { name: 'Code', value: response.status.toString(), inline: true },
          { name: 'URL', value: healthUrl, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
      log.info(`Test de connexion effectué`, { 
        url: healthUrl, 
        status: response.status, 
        ok: response.ok 
      });
    } catch (error) {
      log.error(`Erreur lors du test de connexion`, { error: error.message });
      message.reply('❌ Erreur lors du test de connexion');
    }
  }

  // Commande !logs pour afficher les derniers logs
  if (message.content === '!logs') {
    log.info(`Commande logs demandée`, {
      user: { id: message.author.id, tag: message.author.tag }
    });

    try {
      // Créer un résumé des logs récents (simulation)
      const embed = new EmbedBuilder()
        .setTitle('📋 Derniers Logs du Bot')
        .setColor(0x0099FF)
        .setDescription('Résumé des activités récentes')
        .addFields(
          { name: '🤖 Bot Status', value: client.user ? '🟢 En ligne' : '🔴 Hors ligne', inline: true },
          { name: '📡 Webhook Status', value: '🟢 Actif', inline: true },
          { name: '🕒 Dernière activité', value: new Date().toLocaleString('fr-FR'), inline: true }
        )
        .addFields({
          name: '📊 Statistiques',
          value: `• Serveurs: ${client.guilds.cache.size}\n• Membres totaux: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\n• Uptime: ${formatUptime(client.uptime)}`,
          inline: false
        })
        .setTimestamp();

      message.reply({ embeds: [embed] });
      log.info(`Résumé des logs envoyé`);
    } catch (error) {
      log.error(`Erreur lors de la commande logs`, { error: error.message });
      message.reply('❌ Erreur lors de la récupération des logs');
    }
  }

  // Commande !send pour envoyer un message avec image
  if (message.content.startsWith('!send')) {
    log.info(`Commande send demandée`, {
      user: { id: message.author.id, tag: message.author.tag },
      content: message.content
    });

    try {
      // Vérifier les permissions de l'utilisateur
      const guild = client.guilds.cache.get(GUILD_ID);
      if (guild) {
        const member = await guild.members.fetch(message.author.id);
        const hasPermission = member.permissions.has('ManageMessages') || 
                            member.permissions.has('Administrator') ||
                            member.permissions.has('ManageGuild') ||
                            member.roles.cache.some(role => 
                              role.name.toLowerCase().includes('admin') || 
                              role.name.toLowerCase().includes('modérateur') ||
                              role.name.toLowerCase().includes('moderator') ||
                              role.name.toLowerCase().includes('staff') ||
                              role.name.toLowerCase().includes('équipe')
                            );
        
        if (!hasPermission) {
          log.warn(`Utilisateur sans permission a tenté d'utiliser !send`, {
            user: { id: message.author.id, tag: message.author.tag },
            roles: member.roles.cache.map(r => r.name)
          });
          message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande. Rôles requis : Admin, Modérateur, Staff ou permissions de gestion des messages.');
          return;
        }
      }

      // Parser la commande: !send <channel_id> [image_url] [banner_url] <message>
      const args = message.content.split(' ');
      if (args.length < 3) {
        message.reply('❌ Usage: `!send <channel_id> [image_url] [banner_url] <message>`\n\n**Exemples:**\n`!send 123456789 Voici un message simple !`\n`!send 123456789 https://example.com/image.jpg Voici un message avec image !`\n`!send 123456789 https://example.com/banner.jpg Voici un message avec bannière !`\n`!send 123456789 https://example.com/image.jpg https://example.com/banner.jpg Message avec image et bannière !`');
        return;
      }

      const channelId = args[1];
      let imageUrl = null;
      let bannerUrl = null;
      let messageText = '';

      // Analyser les arguments pour détecter les URLs
      let currentIndex = 2;
      
      // Vérifier si le premier argument est une URL d'image
      if (currentIndex < args.length && isValidImageUrl(args[currentIndex])) {
        imageUrl = args[currentIndex];
        currentIndex++;
      }
      
      // Vérifier si le deuxième argument est une URL de bannière
      if (currentIndex < args.length && isValidImageUrl(args[currentIndex])) {
        bannerUrl = args[currentIndex];
        currentIndex++;
      }
      
      // Le reste est le message
      messageText = args.slice(currentIndex).join(' ');

      // Récupérer le canal
      const targetChannel = await client.channels.fetch(channelId);
      if (!targetChannel || !targetChannel.isTextBased()) {
        message.reply('❌ Canal invalide ou non trouvé.');
        return;
      }

      // Vérifier les permissions du bot sur le canal cible
      if (!targetChannel.permissionsFor(client.user).has('SendMessages')) {
        message.reply('❌ Le bot n\'a pas la permission d\'envoyer des messages dans ce canal.');
        return;
      }

      // Créer l'embed
      const embed = new EmbedBuilder()
        .setTitle('📸 Message du Bot')
        .setDescription(messageText)
        .setColor(0x0099FF);

      // Ajouter l'image principale si fournie
      if (imageUrl) {
        embed.setImage(imageUrl);
      }

      // Ajouter la bannière si fournie
      if (bannerUrl) {
        embed.setThumbnail(bannerUrl);
      }

      // Envoyer le message
      await targetChannel.send({ embeds: [embed] });

      // Confirmer l'envoi
      const confirmEmbed = new EmbedBuilder()
        .setTitle('✅ Message envoyé avec succès')
        .setColor(0x00FF00)
        .addFields(
          { name: '📺 Canal', value: `<#${channelId}>`, inline: true },
          { name: '🖼️ Image', value: imageUrl ? 'Oui' : 'Non', inline: true },
          { name: '🎨 Bannière', value: bannerUrl ? 'Oui' : 'Non', inline: true },
          { name: '📝 Message', value: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [confirmEmbed] });

      log.success(`Message envoyé`, {
        user: { id: message.author.id, tag: message.author.tag },
        channel: { id: channelId, name: targetChannel.name },
        hasImage: !!imageUrl,
        hasBanner: !!bannerUrl,
        imageUrl: imageUrl,
        bannerUrl: bannerUrl,
        messageLength: messageText.length
      });

    } catch (error) {
      log.error(`Erreur lors de la commande send`, { 
        error: error.message,
        user: { id: message.author.id, tag: message.author.tag }
      });
      message.reply('❌ Erreur lors de l\'envoi du message. Vérifiez l\'URL de l\'image et les permissions.');
    }
  }

  // Commande !clear pour supprimer des messages
  if (message.content.startsWith('!clear')) {
    log.info(`Commande clear demandée`, {
      user: { id: message.author.id, tag: message.author.tag },
      content: message.content
    });

    try {
      // Vérifier les permissions de l'utilisateur (admin uniquement)
      const guild = client.guilds.cache.get(GUILD_ID);
      if (guild) {
        const member = await guild.members.fetch(message.author.id);
        const hasPermission = member.permissions.has('Administrator') ||
                            member.permissions.has('ManageGuild') ||
                            member.roles.cache.some(role => 
                              role.name.toLowerCase().includes('admin') || 
                              role.name.toLowerCase().includes('administrateur')
                            );
        
        if (!hasPermission) {
          log.warn(`Utilisateur sans permission admin a tenté d'utiliser !clear`, {
            user: { id: message.author.id, tag: message.author.tag },
            roles: member.roles.cache.map(r => r.name)
          });
          message.reply('❌ Cette commande est réservée aux administrateurs uniquement.');
          return;
        }
      }

      // Parser la commande: !clear <nombre|max>
      const args = message.content.split(' ');
      if (args.length !== 2) {
        message.reply('❌ Usage: `!clear <nombre|max>`\n\n**Exemples:**\n`!clear 10` - Supprime les 10 derniers messages\n`!clear 50` - Supprime les 50 derniers messages\n`!clear max` - Supprime TOUS les messages (avec confirmation)\n\n**Limites:**\n• Maximum 100 messages par commande normale\n• Minimum 1 message\n• `max` supprime tous les messages disponibles\n• **Limitation Discord :** Seuls les messages de moins de 14 jours peuvent être supprimés');
        return;
      }

      const amount = args[1].toLowerCase();
      
      // Vérifier les permissions du bot
      if (!message.channel.permissionsFor(client.user).has('ManageMessages')) {
        message.reply('❌ Le bot n\'a pas la permission de supprimer des messages dans ce canal.');
        return;
      }

      // Vérifier les permissions pour les réactions (si c'est max)
      if (amount === 'max' && !message.channel.permissionsFor(client.user).has('AddReactions')) {
        message.reply('❌ Le bot n\'a pas la permission d\'ajouter des réactions dans ce canal.');
        return;
      }

      // Si c'est "max", demander confirmation
      if (amount === 'max') {
        const confirmEmbed = new EmbedBuilder()
          .setTitle('⚠️ CONFIRMATION REQUISE')
          .setDescription('Vous êtes sur le point de supprimer **TOUS** les messages de ce canal.')
          .setColor(0xFF0000)
          .addFields(
            { name: '👤 Administrateur', value: `<@${message.author.id}>`, inline: true },
            { name: '📺 Canal', value: `<#${message.channel.id}>`, inline: true },
            { name: '⚠️ Attention', value: 'Cette action est **irréversible** !', inline: false },
            { name: '✅ Confirmer', value: 'Réagissez avec ✅ pour confirmer', inline: true },
            { name: '❌ Annuler', value: 'Réagissez avec ❌ pour annuler', inline: true }
          )
          .setTimestamp();

        const confirmMessage = await message.channel.send({ embeds: [confirmEmbed] });
        
        log.info(`Message de confirmation envoyé`, {
          messageId: confirmMessage.id,
          channelId: confirmMessage.channel.id,
          user: { id: message.author.id, tag: message.author.tag }
        });
        
        // Ajouter les réactions
        try {
          await confirmMessage.react('✅');
          log.info(`Réaction ✅ ajoutée au message de confirmation`);
          await confirmMessage.react('❌');
          log.info(`Réaction ❌ ajoutée au message de confirmation`);
        } catch (error) {
          log.error(`Erreur lors de l'ajout des réactions`, { error: error.message });
          message.channel.send('❌ Erreur lors de la création des réactions de confirmation.');
          return;
        }

        // Collecteur de réactions
        const filter = (reaction, user) => 
          ['✅', '❌'].includes(reaction.emoji.name) && 
          user.id === message.author.id;

        const collector = confirmMessage.createReactionCollector({ 
          filter, 
          time: 30000, // 30 secondes
          max: 1 
        });

        log.info(`Collecteur de réactions créé`, {
          messageId: confirmMessage.id,
          timeout: 30000,
          user: { id: message.author.id, tag: message.author.tag }
        });

        collector.on('collect', async (reaction, user) => {
          log.info(`Réaction reçue pour clear max`, {
            emoji: reaction.emoji.name,
            user: { id: user.id, tag: user.tag },
            author: { id: message.author.id, tag: message.author.tag }
          });

          // Vérifier si le message de confirmation existe encore
          try {
            await confirmMessage.fetch();
          } catch {
            log.info(`Message de confirmation déjà supprimé par le fallback`);
            return;
          }

          if (reaction.emoji.name === '✅') {
            try {
              // Supprimer le message de confirmation
              await confirmMessage.delete();
              
              // Supprimer tous les messages
              let deletedCount = 0;
              let hasMore = true;
              let oldMessagesCount = 0;
              
              while (hasMore) {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                if (messages.size === 0) {
                  hasMore = false;
                  break;
                }
                
                // Filtrer les messages de plus de 14 jours
                const recentMessages = messages.filter(msg => {
                  const messageAge = Date.now() - msg.createdTimestamp;
                  const fourteenDays = 14 * 24 * 60 * 60 * 1000; // 14 jours en millisecondes
                  
                  if (messageAge > fourteenDays) {
                    oldMessagesCount++;
                    return false; // Ne pas supprimer les anciens messages
                  }
                  return true; // Supprimer les messages récents
                });
                
                if (recentMessages.size === 0) {
                  hasMore = false;
                  break;
                }
                
                const deletedMessages = await message.channel.bulkDelete(recentMessages, true);
                deletedCount += deletedMessages.size;
                
                // Si moins de 100 messages supprimés, c'est fini
                if (deletedMessages.size < 100) {
                  hasMore = false;
                }
                
                // Petite pause pour éviter le rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
              }

              // Message de confirmation finale
              const finalEmbed = new EmbedBuilder()
                .setTitle('🗑️ Canal vidé avec succès')
                .setColor(0x00FF00)
                .addFields(
                  { name: '📊 Messages supprimés', value: `${deletedCount} messages`, inline: true },
                  { name: '👤 Administrateur', value: `<@${message.author.id}>`, inline: true },
                  { name: '📺 Canal', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

              // Ajouter un avertissement si des messages anciens n'ont pas pu être supprimés
              if (oldMessagesCount > 0) {
                finalEmbed.addFields({
                  name: '⚠️ Limitation Discord',
                  value: `${oldMessagesCount} messages de plus de 14 jours n'ont pas pu être supprimés (limite Discord)`,
                  inline: false
                });
                finalEmbed.setColor(0xFFA500); // Orange pour avertissement
              }

              const finalMessage = await message.channel.send({ embeds: [finalEmbed] });

              // Supprimer le message de confirmation après 10 secondes
              setTimeout(async () => {
                try {
                  await finalMessage.delete();
                } catch (error) {
                  log.warn(`Impossible de supprimer le message de confirmation finale`, { error: error.message });
                }
              }, 10000);

              log.success(`Canal vidé complètement`, {
                user: { id: message.author.id, tag: message.author.tag },
                channel: { id: message.channel.id, name: message.channel.name },
                deletedCount: deletedCount
              });

            } catch (error) {
              log.error(`Erreur lors du vidage du canal`, { 
                error: error.message,
                user: { id: message.author.id, tag: message.author.tag }
              });
              
              if (error.code === 50034) {
                message.channel.send('❌ Impossible de supprimer des messages de plus de 14 jours.');
              } else {
                message.channel.send('❌ Erreur lors de la suppression des messages.');
              }
            }
          } else if (reaction.emoji.name === '❌') {
            // Annulation
            await confirmMessage.delete();
            message.channel.send('❌ Suppression annulée par l\'administrateur.');
            
            log.info(`Suppression max annulée`, {
              user: { id: message.author.id, tag: message.author.tag },
              channel: { id: message.channel.id, name: message.channel.name }
            });
          }
        });

        collector.on('end', async (collected) => {
          log.info(`Collecteur de réactions terminé`, {
            collectedSize: collected.size,
            user: { id: message.author.id, tag: message.author.tag }
          });
          
          if (collected.size === 0) {
            await confirmMessage.delete();
            message.channel.send('⏰ Temps écoulé. Suppression annulée.');
            
            log.info(`Suppression max annulée (timeout)`, {
              user: { id: message.author.id, tag: message.author.tag },
              channel: { id: message.channel.id, name: message.channel.name }
            });
          }
        });

        // Fallback: Événement messageReactionAdd
        const reactionHandler = async (reaction, user) => {
          // Ignorer les réactions partielles
          if (reaction.partial) {
            try {
              await reaction.fetch();
            } catch (error) {
              log.error(`Erreur lors du fetch de la réaction partielle`, { error: error.message });
              return;
            }
          }

          // Vérifier que c'est la bonne réaction
          if (reaction.message.id !== confirmMessage.id) return;
          if (user.id !== message.author.id) return;
          if (!['✅', '❌'].includes(reaction.emoji.name)) return;

          log.info(`Réaction détectée via fallback`, {
            emoji: reaction.emoji.name,
            user: { id: user.id, tag: user.tag },
            messageId: reaction.message.id
          });

          // Arrêter le collecteur principal pour éviter le double traitement
          collector.stop();

          // Supprimer l'événement fallback immédiatement
          client.off('messageReactionAdd', reactionHandler);

          if (reaction.emoji.name === '✅') {
            try {
              // Vérifier que le message existe encore avant de le supprimer
              try {
                await confirmMessage.delete();
              } catch (deleteError) {
                log.warn(`Message de confirmation déjà supprimé`, { error: deleteError.message });
              }
              
              // Supprimer tous les messages
              let deletedCount = 0;
              let hasMore = true;
              let oldMessagesCount = 0;
              
              while (hasMore) {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                if (messages.size === 0) {
                  hasMore = false;
                  break;
                }
                
                // Filtrer les messages de plus de 14 jours
                const recentMessages = messages.filter(msg => {
                  const messageAge = Date.now() - msg.createdTimestamp;
                  const fourteenDays = 14 * 24 * 60 * 60 * 1000; // 14 jours en millisecondes
                  
                  if (messageAge > fourteenDays) {
                    oldMessagesCount++;
                    return false; // Ne pas supprimer les anciens messages
                  }
                  return true; // Supprimer les messages récents
                });
                
                if (recentMessages.size === 0) {
                  hasMore = false;
                  break;
                }
                
                const deletedMessages = await message.channel.bulkDelete(recentMessages, true);
                deletedCount += deletedMessages.size;
                
                // Si moins de 100 messages supprimés, c'est fini
                if (deletedMessages.size < 100) {
                  hasMore = false;
                }
                
                // Petite pause pour éviter le rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
              }

              // Message de confirmation finale
              const finalEmbed = new EmbedBuilder()
                .setTitle('🗑️ Canal vidé avec succès')
                .setColor(0x00FF00)
                .addFields(
                  { name: '📊 Messages supprimés', value: `${deletedCount} messages`, inline: true },
                  { name: '👤 Administrateur', value: `<@${message.author.id}>`, inline: true },
                  { name: '📺 Canal', value: `<#${message.channel.id}>`, inline: true }
                )
                .setTimestamp();

              // Ajouter un avertissement si des messages anciens n'ont pas pu être supprimés
              if (oldMessagesCount > 0) {
                finalEmbed.addFields({
                  name: '⚠️ Limitation Discord',
                  value: `${oldMessagesCount} messages de plus de 14 jours n'ont pas pu être supprimés (limite Discord)`,
                  inline: false
                });
                finalEmbed.setColor(0xFFA500); // Orange pour avertissement
              }

              const finalMessage = await message.channel.send({ embeds: [finalEmbed] });

              // Supprimer le message de confirmation après 10 secondes
              setTimeout(async () => {
                try {
                  await finalMessage.delete();
                } catch (error) {
                  log.warn(`Impossible de supprimer le message de confirmation finale`, { error: error.message });
                }
              }, 10000);

              log.success(`Canal vidé complètement (via fallback)`, {
                user: { id: message.author.id, tag: message.author.tag },
                channel: { id: message.channel.id, name: message.channel.name },
                deletedCount: deletedCount
              });

            } catch (error) {
              log.error(`Erreur lors du vidage du canal (via fallback)`, { 
                error: error.message,
                user: { id: message.author.id, tag: message.author.tag }
              });
              
              if (error.code === 50034) {
                message.channel.send('❌ Impossible de supprimer des messages de plus de 14 jours.');
              } else {
                message.channel.send('❌ Erreur lors de la suppression des messages.');
              }
            }
          } else if (reaction.emoji.name === '❌') {
            // Annulation
            try {
              await confirmMessage.delete();
            } catch (deleteError) {
              log.warn(`Message de confirmation déjà supprimé`, { error: deleteError.message });
            }
            message.channel.send('❌ Suppression annulée par l\'administrateur.');
            
            log.info(`Suppression max annulée (via fallback)`, {
              user: { id: message.author.id, tag: message.author.tag },
              channel: { id: message.channel.id, name: message.channel.name }
            });
          }
        };

        // Ajouter l'événement fallback
        client.on('messageReactionAdd', reactionHandler);

        // Nettoyer l'événement après 30 secondes
        setTimeout(() => {
          client.off('messageReactionAdd', reactionHandler);
          log.info(`Événement fallback nettoyé`);
        }, 30000);

        return;
      }

      // Validation du nombre pour les commandes normales
      const numberAmount = parseInt(amount);
      if (isNaN(numberAmount) || numberAmount < 1 || numberAmount > 100) {
        message.reply('❌ Le nombre doit être entre 1 et 100, ou utilisez `max` pour tout supprimer.');
        return;
      }

      // Supprimer les messages (commande normale)
      const deletedMessages = await message.channel.bulkDelete(numberAmount + 1, true); // +1 pour inclure la commande
      
      // Confirmer la suppression
      const confirmEmbed = new EmbedBuilder()
        .setTitle('🗑️ Messages supprimés')
        .setColor(0xFF6B6B)
        .addFields(
          { name: '📊 Nombre supprimé', value: `${deletedMessages.size - 1} messages`, inline: true },
          { name: '👤 Administrateur', value: `<@${message.author.id}>`, inline: true },
          { name: '📺 Canal', value: `<#${message.channel.id}>`, inline: true }
        )
        .setTimestamp();

      const confirmMessage = await message.channel.send({ embeds: [confirmEmbed] });

      // Supprimer le message de confirmation après 5 secondes
      setTimeout(async () => {
        try {
          await confirmMessage.delete();
        } catch (error) {
          log.warn(`Impossible de supprimer le message de confirmation`, { error: error.message });
        }
      }, 5000);

      log.success(`Messages supprimés`, {
        user: { id: message.author.id, tag: message.author.tag },
        channel: { id: message.channel.id, name: message.channel.name },
        amount: numberAmount,
        deletedCount: deletedMessages.size - 1
      });

    } catch (error) {
      log.error(`Erreur lors de la commande clear`, { 
        error: error.message,
        user: { id: message.author.id, tag: message.author.tag }
      });
      
      if (error.code === 50034) {
        message.reply('❌ Impossible de supprimer des messages de plus de 14 jours.');
      } else {
        message.reply('❌ Erreur lors de la suppression des messages.');
      }
    }
  }

  // Commande !sendsimple pour envoyer un message simple avec image
  if (message.content.startsWith('!sendsimple')) {
    log.info(`Commande sendsimple demandée`, {
      user: { id: message.author.id, tag: message.author.tag },
      content: message.content
    });

    try {
      // Vérifier les permissions de l'utilisateur
      const guild = client.guilds.cache.get(GUILD_ID);
      if (guild) {
        const member = await guild.members.fetch(message.author.id);
        const hasPermission = member.permissions.has('ManageMessages') || 
                            member.permissions.has('Administrator') ||
                            member.permissions.has('ManageGuild') ||
                            member.roles.cache.some(role => 
                              role.name.toLowerCase().includes('admin') || 
                              role.name.toLowerCase().includes('modérateur') ||
                              role.name.toLowerCase().includes('moderator') ||
                              role.name.toLowerCase().includes('staff') ||
                              role.name.toLowerCase().includes('équipe')
                            );
        
        if (!hasPermission) {
          log.warn(`Utilisateur sans permission a tenté d'utiliser !sendsimple`, {
            user: { id: message.author.id, tag: message.author.tag },
            roles: member.roles.cache.map(r => r.name)
          });
          message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande. Rôles requis : Admin, Modérateur, Staff ou permissions de gestion des messages.');
          return;
        }
      }

      // Parser la commande: !sendsimple [image_url] [banner_url] <message>
      const args = message.content.split(' ');
      if (args.length < 2) {
        message.reply('❌ Usage: `!sendsimple [image_url] [banner_url] <message>`\n\n**Exemples:**\n`!sendsimple Voici un message simple !`\n`!sendsimple https://example.com/image.jpg Voici un message avec image !`\n`!sendsimple https://example.com/banner.jpg Voici un message avec bannière !`\n`!sendsimple https://example.com/image.jpg https://example.com/banner.jpg Message avec image et bannière !`');
        return;
      }

      let imageUrl = null;
      let bannerUrl = null;
      let messageText = '';

      // Analyser les arguments pour détecter les URLs
      let currentIndex = 1;
      
      // Vérifier si le premier argument est une URL d'image
      if (currentIndex < args.length && isValidImageUrl(args[currentIndex])) {
        imageUrl = args[currentIndex];
        currentIndex++;
      }
      
      // Vérifier si le deuxième argument est une URL de bannière
      if (currentIndex < args.length && isValidImageUrl(args[currentIndex])) {
        bannerUrl = args[currentIndex];
        currentIndex++;
      }
      
      // Le reste est le message
      messageText = args.slice(currentIndex).join(' ');

      // Envoyer le message dans le canal actuel
      const embed = new EmbedBuilder()
        .setDescription(messageText)
        .setColor(0x0099FF);

      // Ajouter l'image principale si fournie
      if (imageUrl) {
        embed.setImage(imageUrl);
      }

      // Ajouter la bannière si fournie
      if (bannerUrl) {
        embed.setThumbnail(bannerUrl);
      }

      await message.channel.send({ embeds: [embed] });

      // Supprimer la commande pour garder le canal propre
      try {
        await message.delete();
      } catch (deleteError) {
        log.warn(`Impossible de supprimer la commande`, { error: deleteError.message });
      }

      log.success(`Message simple envoyé`, {
        user: { id: message.author.id, tag: message.author.tag },
        channel: { id: message.channel.id, name: message.channel.name },
        hasImage: !!imageUrl,
        hasBanner: !!bannerUrl,
        imageUrl: imageUrl,
        bannerUrl: bannerUrl,
        messageLength: messageText.length
      });

    } catch (error) {
      log.error(`Erreur lors de la commande sendsimple`, { 
        error: error.message,
        user: { id: message.author.id, tag: message.author.tag }
      });
      message.reply('❌ Erreur lors de l\'envoi du message. Vérifiez l\'URL de l\'image.');
    }
  }
});

// Fonction utilitaire pour formater l'uptime
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}j ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Fonction pour valider les URLs d'images
function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    // Vérifier le protocole
    if (!validProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Vérifier l'extension du fichier
    const pathname = urlObj.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Vérifier si c'est une URL Discord (cdn.discordapp.com)
    const isDiscordUrl = urlObj.hostname === 'cdn.discordapp.com' || 
                        urlObj.hostname === 'media.discordapp.net';
    
    return hasValidExtension || isDiscordUrl;
  } catch {
    return false;
  }
}

async function syncUserRank(discordId, rank) {
  log.info(`Début de synchronisation`, {
    discordId: discordId,
    rank: rank,
    timestamp: new Date().toISOString()
  });
  
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    log.error(`Serveur non trouvé`, { guildId: GUILD_ID });
    throw new Error('Serveur non trouvé');
  }
  
  log.info(`Serveur trouvé`, {
    guildName: guild.name,
    guildId: guild.id,
    memberCount: guild.memberCount
  });
  
  log.info(`Recherche du membre`, { discordId: discordId });
  const member = await guild.members.fetch(discordId);
  if (!member) {
    log.error(`Membre non trouvé`, { discordId: discordId });
    throw new Error('Membre non trouvé');
  }
  
  log.info(`Membre trouvé`, {
    user: { id: member.id, tag: member.user.tag },
    joinedAt: member.joinedAt,
    currentRoles: member.roles.cache.map(r => ({ id: r.id, name: r.name }))
  });
  
  const roleId = RANK_ROLE_MAPPING[rank];
  if (!roleId) {
    log.error(`Rôle ${rank} non configuré`, {
      rank: rank,
      availableRanks: Object.keys(RANK_ROLE_MAPPING)
    });
    throw new Error(`Rôle ${rank} non configuré`);
  }
  
  const role = guild.roles.cache.get(roleId);
  if (!role) {
    log.error(`Rôle ${rank} non trouvé sur le serveur`, {
      rank: rank,
      roleId: roleId,
      serverRoles: guild.roles.cache.map(r => ({ id: r.id, name: r.name }))
    });
    throw new Error(`Rôle ${rank} non trouvé`);
  }
  
  log.info(`Rôle trouvé`, {
    role: { id: role.id, name: role.name, color: role.hexColor, position: role.position }
  });
  
  // Retirer tous les rôles de rank existants
  log.info(`Nettoyage des anciens rôles de rank`);
  const rankRoleIds = Object.values(RANK_ROLE_MAPPING);
  const rolesToRemove = [];
  
  for (const existingRoleId of rankRoleIds) {
    if (member.roles.cache.has(existingRoleId)) {
      const existingRole = guild.roles.cache.get(existingRoleId);
      log.info(`Suppression du rôle`, {
        role: { id: existingRole.id, name: existingRole.name }
      });
      rolesToRemove.push(existingRoleId);
    }
  }
  
  if (rolesToRemove.length > 0) {
    log.info(`Suppression de ${rolesToRemove.length} rôles`);
    for (const roleIdToRemove of rolesToRemove) {
      await member.roles.remove(roleIdToRemove);
      log.success(`Rôle supprimé`, { roleId: roleIdToRemove });
    }
  } else {
    log.info(`Aucun rôle de rank à supprimer`);
  }
  
  // Ajouter le nouveau rôle
  log.info(`Ajout du nouveau rôle`, {
    role: { id: role.id, name: role.name }
  });
  await member.roles.add(roleId);
  log.success(`Rôle ajouté avec succès`);
  
  // Vérifier le résultat
  await member.fetch();
  log.info(`Rôles finaux`, {
    user: { id: member.id, tag: member.user.tag },
    roles: member.roles.cache.map(r => ({ id: r.id, name: r.name }))
  });
  
  log.success(`Synchronisation terminée`, {
    user: { id: member.id, tag: member.user.tag },
    role: { id: role.id, name: role.name }
  });
}

// Webhook pour recevoir les mises à jour depuis l'application
const app = express();
app.use(express.json());

// Endpoint de santé pour vérifier que le bot est en ligne
app.get('/health', (req, res) => {
  log.info(`Vérification de santé demandée`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  const status = { 
    status: 'ok', 
    bot: client.user ? 'connected' : 'disconnected',
    guild: client.guilds.cache.get(GUILD_ID) ? 'available' : 'unavailable',
    timestamp: new Date().toISOString(),
    uptime: client.uptime,
    ping: client.ws.ping,
    guildCount: client.guilds.cache.size,
    memberCount: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
  };
  
  log.info(`Statut de santé`, status);
  res.json(status);
});

// Route proxy pour le callback Discord OAuth
app.get('/api/auth/discord/callback', async (req, res) => {
  log.info(`Callback OAuth reçu`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    queryParams: req.query
  });
  
  try {
    // Construire l'URL de redirection vers l'app Next.js
    const nextJsUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackPath = '/api/auth/discord/callback';
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = `${nextJsUrl}${callbackPath}?${queryString}`;
    
    log.info(`Redirection vers l'app Next.js`, { url: fullUrl });
    
    // Rediriger vers l'app Next.js
    res.redirect(302, fullUrl);
  } catch (error) {
    log.error(`Erreur lors de la redirection`, { error: error.message });
    res.status(500).json({ error: 'Proxy redirect failed' });
  }
});

app.post('/webhook/sync-rank', async (req, res) => {
  log.info(`Webhook reçu`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body
  });
  
  try {
    const { discordId, rank } = req.body;
    
    if (!discordId || !rank) {
      log.error(`Données manquantes dans le webhook`, {
        discordId: discordId,
        rank: rank
      });
      return res.status(400).json({ error: 'discordId et rank requis' });
    }
    
    log.info(`Synchronisation demandée via webhook`, {
      discordId: discordId,
      rank: rank
    });
    
    // Validation du rank
    if (!RANK_ROLE_MAPPING[rank]) {
      log.error(`Rank invalide dans le webhook`, {
        rank: rank,
        availableRanks: Object.keys(RANK_ROLE_MAPPING)
      });
      return res.status(400).json({ error: `Rank invalide: ${rank}` });
    }
    
    log.info(`Rank validé`, {
      rank: rank,
      roleId: RANK_ROLE_MAPPING[rank]
    });
    
    const startTime = Date.now();
    await syncUserRank(discordId, rank);
    const duration = Date.now() - startTime;
    
    log.success(`Rôle synchronisé via webhook`, {
      discordId: discordId,
      rank: rank,
      duration: `${duration}ms`
    });
    
    const result = { 
      success: true, 
      message: `Rôle ${rank} synchronisé`,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
    
    res.json(result);
  } catch (error) {
    log.error(`Erreur dans le webhook`, {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint pour synchroniser plusieurs utilisateurs
app.post('/webhook/sync-multiple', async (req, res) => {
  log.info(`Webhook multiple reçu`, { body: req.body });
  
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users)) {
      log.error(`users n'est pas un tableau dans le webhook multiple`);
      return res.status(400).json({ error: 'users doit être un tableau' });
    }
    
    log.info(`Synchronisation de ${users.length} utilisateurs`);
    
    const results = [];
    for (const user of users) {
      try {
        log.info(`Synchronisation d'un utilisateur dans le batch`, {
          discordId: user.discordId,
          rank: user.rank
        });
        await syncUserRank(user.discordId, user.rank);
        results.push({ discordId: user.discordId, success: true });
        log.success(`Succès pour un utilisateur dans le batch`, {
          discordId: user.discordId
        });
      } catch (error) {
        log.error(`Échec pour un utilisateur dans le batch`, {
          discordId: user.discordId,
          error: error.message
        });
        results.push({ discordId: user.discordId, success: false, error: error.message });
      }
    }
    
    const result = { success: true, results };
    log.success(`Synchronisation multiple terminée`, {
      totalUsers: users.length,
      successCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length
    });
    res.json(result);
  } catch (error) {
    log.error(`Erreur générale dans le webhook multiple`, {
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.BOT_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  log.success(`Webhook server démarré`, {
    port: PORT,
    url: `http://217.154.120.235:${PORT}`
  });
});

client.login(process.env.DISCORD_BOT_TOKEN);