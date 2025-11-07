import { eq } from "drizzle-orm";
import { discordProfile } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const disconnectBase = protectedProcedure;

export const disconnectHandler = disconnectBase.handler(async ({ context }) => {
    const { db, session } = context;

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
});
