import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { user } from "@/server/db/schema";
import type { AuthMutationContext } from "./types";

const updateRankSchema = z.object({
    rank: z.enum([
        "NEW",
        "BEGINNER",
        "RISING",
        "CHAMPION",
        "EXPERT",
        "LEGEND",
        "MASTER",
        "GRANDMASTER",
        "IMMORTAL",
    ]),
});

export async function updateRank(
    { db, session }: AuthMutationContext<z.infer<typeof updateRankSchema>>,
    input: z.infer<typeof updateRankSchema>
) {
    if (!session?.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Vous devez être connecté pour modifier votre rank",
        });
    }

    try {
        const { rank } = updateRankSchema.parse(input);

        const updatedUser = await db
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

        if (!updatedUser[0]) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser[0];
    } catch (error) {
        if (error instanceof TRPCError) {
            throw error;
        }

        if (error instanceof z.ZodError) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: error.message || "Données invalides",
            });
        }

        console.error("Erreur lors de la mise à jour du rank:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la mise à jour du rank",
        });
    }
}
