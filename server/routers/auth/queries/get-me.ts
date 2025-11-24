import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { discordProfile, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getMeBase = protectedProcedure;

export const getMeHandler = getMeBase.handler(async ({ context }) => {
    const { db, session } = context;

    const currentUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
        columns: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            rank: true,
            isLeaderboardPublic: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!currentUser) {
        throw new ORPCError("NOT_FOUND", {
            message: "User not found",
        });
    }

    const discordProfileData = await db.query.discordProfile.findFirst({
        where: eq(discordProfile.id, session.user.id),
        columns: {
            discordId: true,
            discordUsername: true,
            discordDiscriminator: true,
            discordAvatar: true,
            discordConnected: true,
            discordRoleSynced: true,
        },
    });

    const getDiscordAvatarUrl = (
        discordId: string | undefined,
        avatarHash: string | undefined
    ) => {
        if (!(discordId && avatarHash)) {
            return null;
        }
        return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
    };

    const userData = {
        ...currentUser,
        image:
            discordProfileData?.discordConnected &&
            discordProfileData?.discordAvatar
                ? getDiscordAvatarUrl(
                      discordProfileData.discordId,
                      discordProfileData.discordAvatar
                  )
                : currentUser.image,
        discordProfile: {
            discordId: discordProfileData?.discordId,
            discordUsername: discordProfileData?.discordUsername,
            discordDiscriminator: discordProfileData?.discordDiscriminator,
            discordConnected: discordProfileData?.discordConnected,
            discordRoleSynced: discordProfileData?.discordRoleSynced,
        },
    };

    return userData;
});
