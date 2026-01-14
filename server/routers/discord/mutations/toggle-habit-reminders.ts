import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { discordProfile } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const toggleHabitRemindersSchema = z.object({
    enabled: z.boolean(),
});

export const toggleHabitRemindersBase = protectedProcedure.input(
    toggleHabitRemindersSchema
);

export const toggleHabitRemindersHandler = toggleHabitRemindersBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { enabled } = input;

        const [profile] = await db
            .select({
                id: discordProfile.id,
                discordConnected: discordProfile.discordConnected,
            })
            .from(discordProfile)
            .where(eq(discordProfile.userId, session.user.id))
            .limit(1);

        if (!profile) {
            throw new ORPCError("NOT_FOUND", {
                message:
                    "Discord profile not found. Please connect your Discord account first.",
            });
        }

        if (!profile.discordConnected) {
            throw new ORPCError("BAD_REQUEST", {
                message:
                    "Discord is not connected. Please connect your Discord account first.",
            });
        }

        await db
            .update(discordProfile)
            .set({
                habitRemindersEnabled: enabled,
            })
            .where(eq(discordProfile.userId, session.user.id));

        return {
            success: true,
            habitRemindersEnabled: enabled,
            message: enabled
                ? "Habit reminders enabled. You will receive a daily reminder at 7 PM in your timezone."
                : "Habit reminders disabled.",
        };
    }
);
