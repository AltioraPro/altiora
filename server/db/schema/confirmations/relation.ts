import { relations } from "drizzle-orm";
import { advancedTrades } from "../advanced-trades";
import { confirmations } from "./schema";

export const confirmationsRelations = relations(confirmations, ({ many }) => ({
    advancedTrades: many(advancedTrades),
}));
