import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingAssets } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateTradingAssetSchema } from "../validators";

export const updateTradingAssetBase = protectedProcedure.input(
    updateTradingAssetSchema
);

export const updateTradingAssetHandler = updateTradingAssetBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;
        const { id, ...updateData } = input;

        const [asset] = await db
            .update(tradingAssets)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(eq(tradingAssets.id, id), eq(tradingAssets.userId, userId))
            )
            .returning();

        if (!asset) {
            throw new ORPCError("NOT_FOUND", {
                message: "Asset not found",
            });
        }

        return asset;
    }
);
