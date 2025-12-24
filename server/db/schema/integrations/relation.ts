import { relations } from "drizzle-orm";
import { brokerConnections } from "./broker-connections";
import { oauthStates } from "./oauth-states";
import { tradingJournals } from "../journals";
import { user } from "../auth";

export const brokerConnectionsRelations = relations(
	brokerConnections,
	({ one }) => ({
		user: one(user, {
			fields: [brokerConnections.userId],
			references: [user.id],
		}),
		journal: one(tradingJournals, {
			fields: [brokerConnections.journalId],
			references: [tradingJournals.id],
		}),
	}),
);

export const oauthStatesRelations = relations(
	oauthStates,
	({ one }) => ({
		user: one(user, {
			fields: [oauthStates.userId],
			references: [user.id],
		}),
	}),
);
