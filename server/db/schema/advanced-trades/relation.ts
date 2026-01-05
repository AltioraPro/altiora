import { relations } from "drizzle-orm";
import { tradesConfirmations } from "../trades-confirmations";
import { brokerConnections } from "../integrations";
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
