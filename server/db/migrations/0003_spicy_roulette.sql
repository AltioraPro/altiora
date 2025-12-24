CREATE TABLE "oauth_states" (
	"id" text PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"provider" text NOT NULL,
	"user_id" text NOT NULL,
	"journal_id" text,
	"metadata" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_states_state_unique" UNIQUE("state")
);
