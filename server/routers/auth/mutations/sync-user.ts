import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import { syncUserSchema } from "../validators";

export const syncUserBase = publicProcedure.input(syncUserSchema);

export const syncUserHandler = syncUserBase.handler(
    async ({ context, input }) => {
        const { db } = context;

        try {
            const existingUser = await db.query.user.findFirst({
                where: eq(user.id, input.id),
            });

            if (existingUser) {
                const [updatedUser] = await db
                    .update(user)
                    .set({
                        email: input.email,
                        name: input.name || existingUser.name,
                        image: input.image,
                        updatedAt: new Date(),
                    })
                    .where(eq(user.id, input.id))
                    .returning();

                return {
                    ...updatedUser,
                };
            }

            const [createdUser] = await db
                .insert(user)
                .values({
                    id: input.id,
                    email: input.email,
                    name: input.name || input.email.split("@")[0],
                    image: input.image,
                    emailVerified: true,
                    rank: "NEW",
                    isLeaderboardPublic: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return createdUser;
        } catch (error) {
            console.error(
                "Erreur lors de la synchronisation de l'utilisateur:",
                error
            );
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Erreur lors de la synchronisation de l'utilisateur",
            });
        }
    }
);
