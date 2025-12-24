import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

/**
 * Temporary OAuth state storage
 * Stores state and metadata for OAuth flows
 * Automatically cleaned up after expiry (10 minutes)
 */
export const oauthStates = pgTable("oauth_states", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	state: text("state").notNull().unique(),
	provider: text("provider").notNull(), // 'ctrader', 'metatrader', etc.
	userId: text("user_id").notNull(),
	journalId: text("journal_id"),
	metadata: text("metadata"), // JSON string for extra data
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
