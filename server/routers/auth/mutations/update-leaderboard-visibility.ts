import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateLeaderboardVisibilitySchema } from "../validators";

export const updateLeaderboardVisibilityBase = protectedProcedure.input(
    updateLeaderboardVisibilitySchema
);

export const updateLeaderboardVisibilityHandler =
    updateLeaderboardVisibilityBase.handler(async ({ context, input }) => {
        const { db, session } = context;
        const { isPublic } = input;

        const [updatedUser] = await db
            .update(user)
            .set({
                isLeaderboardPublic: isPublic,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id))
            .returning({
                id: user.id,
                isLeaderboardPublic: user.isLeaderboardPublic,
            });

        if (!updatedUser) {
            throw new ORPCError("NOT_FOUND", {
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser;
    });
