import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { DiscordService } from "@/server/services/discord";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const discordRouter = createTRPCRouter({
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        discordConnected: true,
        discordRoleSynced: true,
        discordUsername: true,
        discordDiscriminator: true,
        discordAvatar: true,
        lastDiscordSync: true,
        rank: true,
      },
    });

    return {
      connected: user?.discordConnected ?? false,
      roleSynced: user?.discordRoleSynced ?? false,
      username: user?.discordUsername,
      discriminator: user?.discordDiscriminator,
      avatar: user?.discordAvatar,
      lastSync: user?.lastDiscordSync,
      currentRank: user?.rank,
    };
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, session } = ctx;
    
    await db.update(users)
      .set({
        discordId: null,
        discordUsername: null,
        discordDiscriminator: null,
        discordAvatar: null,
        discordConnected: false,
        discordRoleSynced: false,
        lastDiscordSync: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true };
  }),

  syncRank: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, session } = ctx;
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        discordId: true,
        rank: true,
      },
    });

    if (!user?.discordId || !user?.rank) {
      throw new Error('Discord not connected or no rank available');
    }

    try {
      await DiscordService.syncUserRank(user.discordId, user.rank);
      
      const now = new Date();
      await db.update(users)
        .set({
          discordRoleSynced: true,
          lastDiscordSync: now,
          updatedAt: now,
        })
        .where(eq(users.id, session.user.id));

      return { success: true };
    } catch (error) {
      console.error('Failed to sync rank:', error);
      throw new Error('Failed to sync rank with Discord');
    }
  }),

  autoSyncRank: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, session } = ctx;
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        discordId: true,
        rank: true,
      },
    });

    if (!user?.discordId || !user?.rank) {
      throw new Error('Discord not connected or no rank available');
    }

    try {
      await DiscordService.autoSyncUserRank(user.discordId, user.rank);
      
      const now = new Date();
      await db.update(users)
        .set({
          discordRoleSynced: true,
          lastDiscordSync: now,
          updatedAt: now,
        })
        .where(eq(users.id, session.user.id));

      return { success: true };
    } catch (error) {
      console.error('Failed to auto sync rank:', error);
      throw new Error('Failed to sync rank with Discord');
    }
  }),

  syncAllUsers: protectedProcedure.mutation(async () => {
    try {
      const result = await DiscordService.syncAllConnectedUsers();
      return result;
    } catch (error) {
      console.error('Failed to sync all users:', error);
      throw new Error('Failed to sync all users with Discord');
    }
  }),

  checkBotStatus: protectedProcedure.query(async () => {
    try {
      const botUrl = process.env.DISCORD_BOT_WEBHOOK_URL || 'http://localhost:3001';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 
      
      const response = await fetch(`${botUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        online: response.ok,
        status: response.status,
        url: botUrl,
      };
    } catch (error) {
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: process.env.DISCORD_BOT_WEBHOOK_URL || 'http://localhost:3001',
      };
    }
  }),

  getAuthUrl: protectedProcedure.mutation(async () => {
    const state = crypto.randomUUID();
    const authUrl = DiscordService.getAuthUrl(state);
    
    return { authUrl, state };
  }),
}); 