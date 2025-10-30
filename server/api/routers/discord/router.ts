import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { discordProfile, user } from "@/server/db/schema";
import { DiscordService } from "@/server/services/discord";

export const discordRouter = createTRPCRouter({
    getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
        const { db, session } = ctx;

        const [userData] = await db
            .select({
                discordConnected: discordProfile.discordConnected,
                discordRoleSynced: discordProfile.discordRoleSynced,
                discordUsername: discordProfile.discordUsername,
                discordDiscriminator: discordProfile.discordDiscriminator,
                discordAvatar: discordProfile.discordAvatar,
                lastDiscordSync: discordProfile.lastDiscordSync,
                rank: user.rank,
            })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

        if (!userData) {
            throw new Error("User not found");
        }

        return {
            connected: userData.discordConnected ?? false,
            roleSynced: userData.discordRoleSynced ?? false,
            username: userData.discordUsername,
            discriminator: userData.discordDiscriminator,
            avatar: userData.discordAvatar,
            lastSync: userData.lastDiscordSync,
            currentRank: userData.rank,
        };
    }),

    disconnect: protectedProcedure.mutation(async ({ ctx }) => {
        const { db, session } = ctx;

        await db
            .update(discordProfile)
            .set({
                discordId: "",
                discordUsername: "",
                discordDiscriminator: "",
                discordAvatar: "",
                discordConnected: false,
                discordRoleSynced: false,
                lastDiscordSync: null,
            })
            .where(eq(discordProfile.id, session.user.id));

        return { success: true };
    }),

    syncRank: protectedProcedure.mutation(async ({ ctx }) => {
        const { db, session } = ctx;

        const [userData] = await db
            .select({
                discordId: discordProfile.discordId,
                rank: user.rank,
            })
            .from(user)
            .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
            .where(eq(user.id, session.user.id))
            .limit(1);

        if (!(userData?.discordId && userData?.rank)) {
            throw new Error("Discord not connected or no rank available");
        }

        try {
            await DiscordService.syncUserRank(
                userData.discordId,
                userData.rank
            );

            const now = new Date();
            await db
                .update(discordProfile)
                .set({
                    discordRoleSynced: true,
                    lastDiscordSync: now,
                })
                .where(eq(discordProfile.id, session.user.id));

            return { success: true };
        } catch (error) {
            console.error("Failed to sync rank:", error);
            throw new Error("Failed to sync rank with Discord");
        }
    }),

    autoSyncRank: protectedProcedure.mutation(async ({ ctx }) => {
        const { db, session } = ctx;

        const [userData] = await db
            .select({
                discordId: discordProfile.discordId,
                rank: user.rank,
            })
            .from(user)
            .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
            .where(eq(user.id, session.user.id))
            .limit(1);

        if (!(userData?.discordId && userData?.rank)) {
            throw new Error("Discord not connected or no rank available");
        }

        try {
            await DiscordService.autoSyncUserRank(
                userData.discordId,
                userData.rank
            );

            const now = new Date();
            await db
                .update(discordProfile)
                .set({
                    discordRoleSynced: true,
                    lastDiscordSync: now,
                })
                .where(eq(discordProfile.id, session.user.id));

            return { success: true };
        } catch (error) {
            console.error("Failed to auto sync rank:", error);
            throw new Error("Failed to sync rank with Discord");
        }
    }),

    syncAllUsers: protectedProcedure.mutation(async () => {
        try {
            const result = await DiscordService.syncAllConnectedUsers();
            return result;
        } catch (error) {
            console.error("Failed to sync all users:", error);
            throw new Error("Failed to sync all users with Discord");
        }
    }),

    checkBotStatus: protectedProcedure.query(async () => {
        try {
            const botUrl =
                process.env.DISCORD_BOT_WEBHOOK_URL || "http://localhost:3001";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${botUrl}/health`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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
                error: error instanceof Error ? error.message : "Unknown error",
                url:
                    process.env.DISCORD_BOT_WEBHOOK_URL ||
                    "http://localhost:3001",
            };
        }
    }),

    getAuthUrl: protectedProcedure.mutation(() => {
        const state = crypto.randomUUID();
        const authUrl = DiscordService.getAuthUrl(state);

        return { authUrl, state };
    }),
});
