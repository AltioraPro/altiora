import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { users } from "@/server/db/schema";
import { type AuthMutationContext } from "./types";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255, "Le nom est trop long"),
});

export async function updateProfile(
  { db, session }: AuthMutationContext,
  input: z.infer<typeof updateProfileSchema>
) {
  if (!session?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour modifier votre profil",
    });
  }

  try {
    const { name } = updateProfileSchema.parse(input);

    const updatedUser = await db
      .update(users)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
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
        message: error.errors[0]?.message || "Données invalides",
      });
    }
    
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la mise à jour du profil",
    });
  }
} 