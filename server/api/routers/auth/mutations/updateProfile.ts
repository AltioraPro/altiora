import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { user } from "@/server/db/schema";
import type { AuthMutationContext } from "./types";

const updateProfileSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(255, "Le nom est trop long"),
});

export async function updateProfile(
    { db, session }: AuthMutationContext<z.infer<typeof updateProfileSchema>>,
    input: z.infer<typeof updateProfileSchema>
) {
    if (!session?.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Vous devez être connecté pour modifier votre profil",
        });
    }

    try {
        const { name } = updateProfileSchema.parse(input);

        const [updatedUser] = await db
            .update(user)
            .set({
                name,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id))
            .returning({
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
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

        console.error("Erreur lors de la mise à jour du profil:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la mise à jour du profil",
        });
    }
}
