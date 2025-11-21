import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const deleteAccountBase = protectedProcedure;

export const deleteAccountHandler = deleteAccountBase.handler(
    async ({ context }) => {
        const { db, session: currentSession } = context;

        if (!currentSession) {
            throw new ORPCError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }

        const userId = currentSession.user.id;

        // Delete the user - cascade deletes will handle related data
        // (sessions, trades, habits, goals, etc. are all set to cascade)
        await db.delete(user).where(eq(user.id, userId));

        return { success: true };
    }
);
