import { relations } from "drizzle-orm";
import { brokerConnections } from "../integrations";
import { tradesConfirmations } from "../trades-confirmations";
import { advancedTrades } from "./schema";

export const advancedTradesRelations = relations(
    advancedTrades,
    ({ many, one }) => ({
        tradesConfirmations: many(tradesConfirmations),
        brokerConnection: one(brokerConnections, {
            fields: [advancedTrades.journalId],
            references: [brokerConnections.journalId],
        }),
    })
);
