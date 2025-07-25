import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { users } from "@/server/db/schema";
import { type AuthQueryContext } from "./types";

export async function getCurrentUser({ db, session }: AuthQueryContext) {
  if (!session?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour accéder à cette ressource",
    });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        rank: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        stripeSubscriptionEndDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    return {
      ...user,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la récupération de l'utilisateur",
    });
  }
} 