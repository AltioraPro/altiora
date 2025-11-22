import { relations } from "drizzle-orm";
import { advancedTrades } from "../advanced-trades/schema";
import { user } from "../auth/schema";
import { confirmations } from "../confirmations";
import { tradesConfirmations } from "./schema";

export const tradesConfirmationsRelations = relations(
    tradesConfirmations,
    ({ one }) => ({
        advancedTrade: one(advancedTrades, {
            fields: [tradesConfirmations.advancedTradeId],
            references: [advancedTrades.id],
        }),
        confirmations: one(confirmations, {
            fields: [tradesConfirmations.confirmationId],
            references: [confirmations.id],
        }),
        user: one(user, {
            fields: [tradesConfirmations.userId],
            references: [user.id],
        }),
    })
);
