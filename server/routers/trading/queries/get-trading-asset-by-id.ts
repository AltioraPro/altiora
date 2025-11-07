import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { tradingAssets } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { idSchema } from "../validators";

export const getTradingAssetByIdBase = protectedProcedure.input(idSchema);

export const getTradingAssetByIdHandler = getTradingAssetByIdBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const userId = session.user.id;

        const [asset] = await db
            .select()
            .from(tradingAssets)
            .where(
                and(
                    eq(tradingAssets.id, input.id),
                    eq(tradingAssets.userId, userId)
                )
            )
            .limit(1);

        if (!asset) {
            throw new ORPCError("NOT_FOUND", {
                message: "Asset not found",
            });
        }

        return asset;
    }
);
