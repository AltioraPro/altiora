import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { users, type NewUser } from "@/server/db/schema";
import { type AuthMutationContext } from "./types";

interface SyncUserInput {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}

export async function syncUser({
  input,
  db,
}: AuthMutationContext<SyncUserInput>) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, input.clerkId),
    });

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const [updatedUser] = await db
        .update(users)
        .set({
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          imageUrl: input.imageUrl,
          username: input.username,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, input.clerkId))
        .returning();

      return {
        ...updatedUser,
        fullName: `${updatedUser?.firstName || ""} ${updatedUser?.lastName || ""}`.trim() || null,
      };
    } else {
      // Créer un nouvel utilisateur
      const newUser: NewUser = {
        clerkId: input.clerkId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        imageUrl: input.imageUrl,
        username: input.username,
        isProUser: false,
        preferences: {},
      };

      const [createdUser] = await db
        .insert(users)
        .values(newUser)
        .returning();

      return {
        ...createdUser,
        fullName: `${createdUser.firstName || ""} ${createdUser.lastName || ""}`.trim() || null,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation de l'utilisateur:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de la synchronisation de l'utilisateur",
    });
  }
} 