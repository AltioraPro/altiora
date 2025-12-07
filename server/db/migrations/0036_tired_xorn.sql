ALTER TABLE "discord_profile" ADD COLUMN "habit_reminders_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "discord_profile" ADD COLUMN "last_habit_reminder_sent" timestamp with time zone;

