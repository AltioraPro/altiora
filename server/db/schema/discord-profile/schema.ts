import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "../auth";

export const discordProfile = pgTable("discord_profile", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .references(() => user.id, { onDelete: "cascade" })
        .notNull(),
    discordId: varchar("discord_id", { length: 255 }).notNull(),
    discordUsername: varchar("discord_username", { length: 255 }).notNull(),
    discordDiscriminator: varchar("discord_discriminator", {
        length: 10,
    }).notNull(),
    discordAvatar: varchar("discord_avatar", { length: 1024 }).notNull(),
    discordConnected: boolean("discord_connected").notNull(),
    discordRoleSynced: boolean("discord_role_synced"),
    lastDiscordSync: timestamp("last_discord_sync", { withTimezone: true }),
});
