import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateTimezoneSchema } from "../validators";

export const updateTimezoneBase = protectedProcedure.input(updateTimezoneSchema);

export const updateTimezoneHandler = updateTimezoneBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { timezone } = input;

        const [updatedUser] = await db
            .update(user)
            .set({
                timezone,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id))
            .returning({
                id: user.id,
                timezone: user.timezone,
            });

        if (!updatedUser) {
            throw new ORPCError("NOT_FOUND", {
                message: "Utilisateur non trouvé",
            });
        }

        return updatedUser;
    }
);

