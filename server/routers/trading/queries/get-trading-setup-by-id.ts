import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingSetups } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getTradingSetupByIdBase = protectedProcedure.input(idSchema);

export const getTradingSetupByIdHandler = getTradingSetupByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [setup] = await db
            .select()
            .from(tradingSetups)
            .where(
                and(
                    eq(tradingSetups.id, input.id),
                    eq(tradingSetups.userId, userId)
                )
            )
            .limit(1);

        if (!setup) {
            throw new ORPCError("NOT_FOUND", {
                message: "Setup not found",
            });
        }

        return setup;
    }
);
