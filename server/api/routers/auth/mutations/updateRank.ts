import { eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { users } from "@/server/db/schema";
import { type AuthMutationContext } from "./types";

const updateRankSchema = z.object({
  rank: z.enum(["NEW", "BEGINNER", "RISING", "CHAMPION", "EXPERT", "LEGEND"]),
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
      .update(users)
      .set({
        rank,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        rank: users.rank,
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
    
    console.error("Erreur lors de la mise à jour du rank:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la mise à jour du rank",
    });
  }
} 