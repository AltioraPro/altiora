import { relations } from "drizzle-orm";
import { account, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
    accounts: many(account),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));
