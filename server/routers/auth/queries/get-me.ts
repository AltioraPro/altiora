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
        where: eq(discordProfile.userId, session.user.id),
    });

    return { ...currentUser, discordProfile: discordProfileData };
});
