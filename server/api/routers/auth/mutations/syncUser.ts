import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { users, type NewUser } from "@/server/db/schema";
import { type AuthMutationContext } from "./types";

interface SyncUserInput {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export async function syncUser({
  input,
  db,
}: AuthMutationContext<SyncUserInput>) {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, input.id),
    });

    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          email: input.email,
          name: input.name || existingUser.name,
          image: input.image,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning();

      return {
        ...updatedUser,
      };
    } else {
      const newUser: NewUser = {
        id: input.id,
        email: input.email,
        name: input.name || input.email.split('@')[0],
        image: input.image,
        emailVerified: new Date(),
      };

      const [createdUser] = await db
        .insert(users)
        .values(newUser)
        .returning();

      return {
        ...createdUser,
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