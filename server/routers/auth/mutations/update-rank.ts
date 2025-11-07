import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateRankSchema } from "../validators";

export const updateRankBase = protectedProcedure.input(updateRankSchema);

export const updateRankHandler = updateRankBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { rank } = input;

        const [updatedUser] = await db
            .update(user)
            .set({
                rank,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id))
            .returning({
                id: user.id,
                rank: user.rank,
                updatedAt: user.updatedAt,
            });

        if (!updatedUser) {
            throw new ORPCError("NOT_FOUND", {
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser;
    }
);
