import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { discordProfile, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";

export const syncRankBase = protectedProcedure;

export const syncRankHandler = syncRankBase.handler(async ({ context }) => {
    const { db, session } = context;

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
        throw new ORPCError("BAD_REQUEST", {
            message: "Discord not connected or no rank available",
        });
    }

    try {
        await DiscordService.syncUserRank(userData.discordId, userData.rank);

        const now = new Date();
        await db
            .update(discordProfile)
            .set({
                discordRoleSynced: true,
                lastDiscordSync: now,
            })
            .where(eq(discordProfile.userId, session.user.id));

        return { success: true };
    } catch (error) {
        console.error("Failed to sync rank:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to sync rank with Discord",
        });
    }
});
