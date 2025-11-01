import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateProfileSchema } from "../validators";

export const updateProfileBase = protectedProcedure.input(updateProfileSchema);

export const updateProfileHandler = updateProfileBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { name } = input;

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
            throw new ORPCError("NOT_FOUND", {
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser;
    }
);
