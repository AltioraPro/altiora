import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingSetups } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateTradingSetupSchema } from "../validators";

export const updateTradingSetupBase = protectedProcedure.input(
    updateTradingSetupSchema
);

export const updateTradingSetupHandler = updateTradingSetupBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const { id, ...updateData } = input;

        const [setup] = await db
            .update(tradingSetups)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(eq(tradingSetups.id, id), eq(tradingSetups.userId, userId))
            )
            .returning();

        if (!setup) {
            throw new ORPCError("NOT_FOUND", {
                message: "Setup not found",
            });
        }

        return setup;
    }
);
