import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { discordProfile } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const disconnectBase = protectedProcedure;

export const disconnectHandler = disconnectBase.handler(async ({ context }) => {
    const { db, session } = context;

    try {
        await auth.api.unlinkAccount({
            body: {
                provider: "discord",
            },
            headers: context.headers,
        });
    } catch {
        // Provider not linked; continue cleaning local state.
    }

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
        .where(eq(discordProfile.userId, session.user.id));

    return { success: true };
});
