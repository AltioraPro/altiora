import { relations } from "drizzle-orm";
import { tradesConfirmations } from "../trades-confirmations";
import { advancedTrades } from "./schema";

export const advancedTradesRelations = relations(
    advancedTrades,
    ({ many }) => ({
        tradesConfirmations: many(tradesConfirmations),
    })
);
