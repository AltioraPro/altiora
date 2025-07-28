import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// Configuration
const GUILD_ID = process.env.DISCORD_GUILD_ID;
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

client.once('ready', () => {
  console.log(`🤖 [Bot Ready] Bot connecté en tant que ${client.user.tag}`);
  console.log(`🏠 [Bot Ready] Serveur: ${client.guilds.cache.get(GUILD_ID)?.name}`);
  console.log(`📊 [Bot Ready] Nombre de serveurs: ${client.guilds.cache.size}`);
  console.log(`👥 [Bot Ready] Nombre total de membres: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`);
  
  // Log des rôles configurés
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    console.log(`🎭 [Bot Ready] Rôles configurés:`);
    Object.entries(RANK_ROLE_MAPPING).forEach(([rank, roleId]) => {
      const role = guild.roles.cache.get(roleId);
      console.log(`   ${rank}: ${role ? role.name : 'Non trouvé'} (${roleId})`);
    });
  }
});

// Log des événements de connexion/déconnexion
client.on('disconnect', () => {
  console.log(`🔌 [Bot Event] Bot déconnecté`);
});

client.on('reconnecting', () => {
  console.log(`🔄 [Bot Event] Bot en cours de reconnexion...`);
});

client.on('resume', (replayed) => {
  console.log(`✅ [Bot Event] Bot reconnecté, ${replayed} événements rejoués`);
});

// Log des changements de membres
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
  
  if (addedRoles.size > 0) {
    console.log(`➕ [Member Update] Rôles ajoutés à ${newMember.user.tag}: ${addedRoles.map(r => r.name).join(', ')}`);
  }
  
  if (removedRoles.size > 0) {
    console.log(`➖ [Member Update] Rôles supprimés de ${newMember.user.tag}: ${removedRoles.map(r => r.name).join(', ')}`);
  }
});

// Log des nouveaux membres
client.on('guildMemberAdd', (member) => {
  console.log(`👋 [Member Join] Nouveau membre: ${member.user.tag} (${member.id})`);
});

// Log des départs de membres
client.on('guildMemberRemove', (member) => {
  console.log(`👋 [Member Leave] Membre parti: ${member.user.tag} (${member.id})`);
});

// Commande pour synchroniser un utilisateur
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  console.log(`💬 [Message] Message de ${message.author.tag}: ${message.content}`);
  
  if (message.content.startsWith('!sync')) {
    console.log(`🔄 [Command] Commande sync détectée`);
    const args = message.content.split(' ');
    if (args.length !== 3) {
      console.log(`❌ [Command] Usage incorrect: ${message.content}`);
      return message.reply('Usage: !sync <discord_id> <rank>');
    }
    
    const discordId = args[1];
    const rank = args[2].toUpperCase();
    
    console.log(`🔄 [Command] Synchronisation manuelle: ${discordId} -> ${rank}`);
    
    try {
      await syncUserRank(discordId, rank);
      console.log(`✅ [Command] Synchronisation manuelle réussie`);
      message.reply(`✅ Rôle ${rank} synchronisé pour l'utilisateur <@${discordId}>`);
    } catch (error) {
      console.error(`❌ [Command] Erreur de synchronisation manuelle:`, error);
      message.reply('❌ Erreur lors de la synchronisation');
    }
  }
});

async function syncUserRank(discordId, rank) {
  console.log(`🔄 [Bot Sync] Début de synchronisation: ${discordId} -> ${rank}`);
  console.log(`⏰ [Bot Sync] Timestamp: ${new Date().toISOString()}`);
  
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error(`❌ [Bot Sync] Serveur non trouvé: ${GUILD_ID}`);
    throw new Error('Serveur non trouvé');
  }
  
  console.log(`🏠 [Bot Sync] Serveur trouvé: ${guild.name} (${guild.id})`);
  console.log(`👥 [Bot Sync] Nombre de membres dans le serveur: ${guild.memberCount}`);
  
  console.log(`🔍 [Bot Sync] Recherche du membre: ${discordId}`);
  const member = await guild.members.fetch(discordId);
  if (!member) {
    console.error(`❌ [Bot Sync] Membre non trouvé: ${discordId}`);
    throw new Error('Membre non trouvé');
  }
  
  console.log(`👤 [Bot Sync] Membre trouvé: ${member.user.tag} (${member.id})`);
  console.log(`📅 [Bot Sync] Membre depuis: ${member.joinedAt}`);
  console.log(`🎭 [Bot Sync] Rôles actuels: ${member.roles.cache.map(r => r.name).join(', ')}`);
  
  const roleId = RANK_ROLE_MAPPING[rank];
  if (!roleId) {
    console.error(`❌ [Bot Sync] Rôle ${rank} non configuré`);
    console.log(`📋 [Bot Sync] Rôles disponibles: ${Object.keys(RANK_ROLE_MAPPING).join(', ')}`);
    throw new Error(`Rôle ${rank} non configuré`);
  }
  
  const role = guild.roles.cache.get(roleId);
  if (!role) {
    console.error(`❌ [Bot Sync] Rôle ${rank} non trouvé sur le serveur`);
    console.log(`🔍 [Bot Sync] Rôles du serveur: ${guild.roles.cache.map(r => `${r.name}(${r.id})`).join(', ')}`);
    throw new Error(`Rôle ${rank} non trouvé`);
  }
  
  console.log(`🎭 [Bot Sync] Rôle trouvé: ${role.name} (${roleId})`);
  console.log(`🎨 [Bot Sync] Couleur du rôle: ${role.hexColor}`);
  console.log(`👑 [Bot Sync] Position du rôle: ${role.position}`);
  
  // Retirer tous les rôles de rank existants
  console.log(`🧹 [Bot Sync] Nettoyage des anciens rôles de rank...`);
  const rankRoleIds = Object.values(RANK_ROLE_MAPPING);
  const rolesToRemove = [];
  
  for (const existingRoleId of rankRoleIds) {
    if (member.roles.cache.has(existingRoleId)) {
      const existingRole = guild.roles.cache.get(existingRoleId);
      console.log(`🗑️ [Bot Sync] Suppression du rôle: ${existingRole.name} (${existingRoleId})`);
      rolesToRemove.push(existingRoleId);
    }
  }
  
  if (rolesToRemove.length > 0) {
    console.log(`🗑️ [Bot Sync] Suppression de ${rolesToRemove.length} rôles...`);
    for (const roleIdToRemove of rolesToRemove) {
      await member.roles.remove(roleIdToRemove);
      console.log(`✅ [Bot Sync] Rôle supprimé: ${roleIdToRemove}`);
    }
  } else {
    console.log(`ℹ️ [Bot Sync] Aucun rôle de rank à supprimer`);
  }
  
  // Ajouter le nouveau rôle
  console.log(`➕ [Bot Sync] Ajout du nouveau rôle: ${role.name} (${roleId})`);
  await member.roles.add(roleId);
  console.log(`✅ [Bot Sync] Rôle ajouté avec succès`);
  
  // Vérifier le résultat
  await member.fetch();
  console.log(`🎭 [Bot Sync] Rôles finaux: ${member.roles.cache.map(r => r.name).join(', ')}`);
  
  console.log(`🎉 [Bot Sync] Synchronisation terminée: ${member.user.tag} -> ${role.name}`);
  console.log(`⏰ [Bot Sync] Durée: ${Date.now() - Date.now()}ms`);
}

// Webhook pour recevoir les mises à jour depuis l'application
const app = express();
app.use(express.json());

// Endpoint de santé pour vérifier que le bot est en ligne
app.get('/health', (req, res) => {
  console.log(`🏥 [Bot Health] Vérification de santé demandée`);
  console.log(`📡 [Bot Health] IP source: ${req.ip}`);
  console.log(`🌐 [Bot Health] User-Agent: ${req.get('User-Agent')}`);
  
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
  
  console.log(`📊 [Bot Health] Statut:`, status);
  res.json(status);
});

// Route proxy pour le callback Discord OAuth
app.get('/api/auth/discord/callback', async (req, res) => {
  console.log(`🔄 [Discord Proxy] Callback OAuth reçu à ${new Date().toISOString()}`);
  console.log(`📡 [Discord Proxy] IP source: ${req.ip}`); 
  console.log(`📦 [Discord Proxy] Query params:`, req.query);
  
  try {
    // Construire l'URL de redirection vers l'app Next.js
    const nextJsUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackPath = '/api/auth/discord/callback';
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = `${nextJsUrl}${callbackPath}?${queryString}`;
    
    console.log(`🔗 [Discord Proxy] Redirection vers: ${fullUrl}`);
    
    // Rediriger vers l'app Next.js
    res.redirect(302, fullUrl);
  } catch (error) {
    console.error(`❌ [Discord Proxy] Erreur lors de la redirection:`, error);
    res.status(500).json({ error: 'Proxy redirect failed' });
  }
});

app.post('/webhook/sync-rank', async (req, res) => {
  console.log(`📥 [Bot Webhook] Webhook reçu à ${new Date().toISOString()}`);
  console.log(`📡 [Bot Webhook] IP source: ${req.ip}`);
  console.log(`🌐 [Bot Webhook] User-Agent: ${req.get('User-Agent')}`);
  console.log(`📦 [Bot Webhook] Données reçues:`, req.body);
  
  try {
    const { discordId, rank } = req.body;
    
    if (!discordId || !rank) {
      console.error(`❌ [Bot Webhook] Données manquantes: discordId=${discordId}, rank=${rank}`);
      return res.status(400).json({ error: 'discordId et rank requis' });
    }
    
    console.log(`🔄 [Bot Webhook] Synchronisation demandée: ${discordId} -> ${rank}`);
    console.log(`⏰ [Bot Webhook] Début du traitement: ${new Date().toISOString()}`);
    
    // Validation du rank
    if (!RANK_ROLE_MAPPING[rank]) {
      console.error(`❌ [Bot Webhook] Rank invalide: ${rank}`);
      console.log(`📋 [Bot Webhook] Ranks valides: ${Object.keys(RANK_ROLE_MAPPING).join(', ')}`);
      return res.status(400).json({ error: `Rank invalide: ${rank}` });
    }
    
    console.log(`✅ [Bot Webhook] Rank validé: ${rank} -> ${RANK_ROLE_MAPPING[rank]}`);
    
    const startTime = Date.now();
    await syncUserRank(discordId, rank);
    const duration = Date.now() - startTime;
    
    console.log(`🎉 [Bot Webhook] Rôle ${rank} synchronisé pour l'utilisateur ${discordId}`);
    console.log(`⏱️ [Bot Webhook] Durée du traitement: ${duration}ms`);
    
    const result = { 
      success: true, 
      message: `Rôle ${rank} synchronisé`,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📤 [Bot Webhook] Réponse:`, result);
    res.json(result);
  } catch (error) {
    console.error(`💥 [Bot Webhook] Erreur:`, error);
    console.error(`💥 [Bot Webhook] Stack trace:`, error.stack);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint pour synchroniser plusieurs utilisateurs
app.post('/webhook/sync-multiple', async (req, res) => {
  console.log(`📥 [Bot Webhook Multiple] Webhook multiple reçu:`, req.body);
  
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users)) {
      console.error(`❌ [Bot Webhook Multiple] users n'est pas un tableau`);
      return res.status(400).json({ error: 'users doit être un tableau' });
    }
    
    console.log(`🔄 [Bot Webhook Multiple] Synchronisation de ${users.length} utilisateurs`);
    
    const results = [];
    for (const user of users) {
      try {
        console.log(`🔄 [Bot Webhook Multiple] Synchronisation de ${user.discordId} -> ${user.rank}`);
        await syncUserRank(user.discordId, user.rank);
        results.push({ discordId: user.discordId, success: true });
        console.log(`✅ [Bot Webhook Multiple] Succès pour ${user.discordId}`);
      } catch (error) {
        console.error(`❌ [Bot Webhook Multiple] Échec pour ${user.discordId}:`, error);
        results.push({ discordId: user.discordId, success: false, error: error.message });
      }
    }
    
    const result = { success: true, results };
    console.log(`📤 [Bot Webhook Multiple] Réponse finale:`, result);
    res.json(result);
  } catch (error) {
    console.error(`💥 [Bot Webhook Multiple] Erreur générale:`, error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.BOT_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 [Bot Server] Webhook server démarré sur 0.0.0.0:${PORT}`);
  console.log(`🔗 [Bot Server] Accessible depuis: http://217.154.120.235:${PORT}`);
});

client.login(process.env.DISCORD_BOT_TOKEN); 