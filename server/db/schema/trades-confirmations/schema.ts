import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { advancedTrades } from "../advanced-trades";
import { user } from "../auth/schema";
import { confirmations } from "../confirmations";

export const tradesConfirmations = pgTable("trades_confirmation", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .references(() => user.id, { onDelete: "cascade" })
        .notNull(),
    advancedTradeId: varchar("advanced_trade_id", { length: 255 })
        .references(() => advancedTrades.id, { onDelete: "cascade" })
        .notNull(),
    confirmationId: varchar("confirmation_id", { length: 255 })
        .references(() => confirmations.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});
