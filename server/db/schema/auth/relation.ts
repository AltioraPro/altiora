import { relations } from "drizzle-orm";
import { accessList, account, passkey, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    passkeys: many(passkey),
    accessLists: many(accessList),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
    user: one(user, {
        fields: [passkey.userId],
        references: [user.id],
    }),
}));

export const accessListRelations = relations(accessList, ({ one }) => ({
    addedBy: one(user, {
        fields: [accessList.addedBy],
        references: [user.id],
    }),
    user: one(user, {
        fields: [accessList.userId],
        references: [user.id],
    }),
}));
