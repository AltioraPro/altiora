import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { discordProfile, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getConnectionStatusBase = protectedProcedure;

export const getConnectionStatusHandler = getConnectionStatusBase.handler(
  async ({ context }) => {
    const { db, session } = context;

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
      .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData) {
      throw new ORPCError("NOT_FOUND", {
        message: "User not found",
      });
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
  }
);
