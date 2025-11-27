import { eq } from "drizzle-orm";
import { discordProfile } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getDiscordProfileBase = protectedProcedure;

export const getDiscordProfileHandler = getDiscordProfileBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        const discordProfileData = await db.query.discordProfile.findFirst({
            where: eq(discordProfile.userId, session.user.id),
        });

        return discordProfileData;
    }
);
