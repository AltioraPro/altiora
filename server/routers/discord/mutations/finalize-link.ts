import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { discordProfile, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";

export const finalizeDiscordLinkBase = protectedProcedure;

export const finalizeDiscordLinkHandler = finalizeDiscordLinkBase.handler(
    async ({ context }) => {
        const { db, headers, session } = context;
        const userId = session.user.id;

        const tokenResponse = await auth.api.getAccessToken({
            body: {
                providerId: "discord",
                userId,
            },
            headers,
        });

        if (!tokenResponse?.accessToken) {
            throw new ORPCError("BAD_REQUEST", {
                message: "Discord access token not found",
            });
        }

        const discordUser = await DiscordService.getUserInfo(
            tokenResponse.accessToken
        );

        await DiscordService.addUserToGuild(
            discordUser.id,
            tokenResponse.accessToken
        );

        const profileData = {
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            discordDiscriminator: discordUser.discriminator,
            discordAvatar: discordUser.avatar ?? "",
            discordConnected: true,
            discordRoleSynced: false,
            lastDiscordSync: new Date(),
        };

        const existingProfile = await db.query.discordProfile.findFirst({
            where: eq(discordProfile.userId, userId),
        });

        if (existingProfile) {
            await db
                .update(discordProfile)
                .set(profileData)
                .where(eq(discordProfile.userId, userId));
        } else {
            await db.insert(discordProfile).values({
                id: userId,
                userId,
                ...profileData,
            });
        }

        const currentUser = await db.query.user.findFirst({
            columns: {
                rank: true,
            },
            where: eq(user.id, userId),
        });

        if (currentUser?.rank) {
            try {
                await DiscordService.syncUserRank(
                    discordUser.id,
                    currentUser.rank
                );

                await db
                    .update(discordProfile)
                    .set({
                        discordRoleSynced: true,
                        lastDiscordSync: new Date(),
                    })
                    .where(eq(discordProfile.userId, userId));
            } catch {
                // No-op: role synchronization will be retried manually.
            }
        }

        return { success: true };
    }
);
