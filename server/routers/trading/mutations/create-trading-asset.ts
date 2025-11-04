import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingAssets, tradingJournals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createTradingAssetSchema } from "../validators";

export const createTradingAssetBase = protectedProcedure.input(
    createTradingAssetSchema
);

export const createTradingAssetHandler = createTradingAssetBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const journal = await db
            .select()
            .from(tradingJournals)
            .where(
                and(
                    eq(tradingJournals.id, input.journalId),
                    eq(tradingJournals.userId, userId)
                )
            )
            .limit(1);

        if (!journal.length) {
            throw new ORPCError("NOT_FOUND", {
                message: "Trading journal not found",
            });
        }

        const [asset] = await db
            .insert(tradingAssets)
            .values({
                id: crypto.randomUUID(),
                userId,
                journalId: input.journalId,
                name: input.name,
                symbol: input.symbol || input.name,
                type: input.type,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return asset;
    }
);
