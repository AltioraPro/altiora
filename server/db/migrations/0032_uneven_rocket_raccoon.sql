ALTER TABLE "setup" RENAME TO "confirmation";--> statement-breakpoint
ALTER TABLE "advanced_trade" RENAME COLUMN "setup_id" TO "confirmation_id";--> statement-breakpoint
ALTER TABLE "advanced_trade" DROP CONSTRAINT "advanced_trade_setup_id_setup_id_fk";
--> statement-breakpoint
ALTER TABLE "confirmation" DROP CONSTRAINT "setup_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "confirmation" DROP CONSTRAINT "setup_journal_id_journal_id_fk";
--> statement-breakpoint
DROP INDEX "advanced_trade_setup_id_idx";--> statement-breakpoint
DROP INDEX "setup_user_id_idx";--> statement-breakpoint
DROP INDEX "setup_journal_id_idx";--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD CONSTRAINT "advanced_trade_confirmation_id_confirmation_id_fk" FOREIGN KEY ("confirmation_id") REFERENCES "public"."confirmation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confirmation" ADD CONSTRAINT "confirmation_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "advanced_trade_confirmation_id_idx" ON "advanced_trade" USING btree ("confirmation_id");--> statement-breakpoint
CREATE INDEX "confirmation_user_id_idx" ON "confirmation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "confirmation_journal_id_idx" ON "confirmation" USING btree ("journal_id");