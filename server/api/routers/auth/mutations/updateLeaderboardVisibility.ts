import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { user } from "@/server/db/schema";
import type { AuthMutationContext } from "./types";

const updateLeaderboardVisibilitySchema = z.object({
    isPublic: z.boolean(),
});

export async function updateLeaderboardVisibility(
    {
        db,
        session,
    }: AuthMutationContext<z.infer<typeof updateLeaderboardVisibilitySchema>>,
    input: z.infer<typeof updateLeaderboardVisibilitySchema>
) {
    if (!session?.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Vous devez être connecté pour modifier vos paramètres",
        });
    }

    try {
        const { isPublic } = updateLeaderboardVisibilitySchema.parse(input);

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
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser;
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

        console.error("Erreur lors de la mise à jour de la visibilité:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la mise à jour de la visibilité",
        });
    }
}
