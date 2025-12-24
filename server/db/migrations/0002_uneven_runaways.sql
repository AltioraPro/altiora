CREATE TABLE "broker_connection" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"journal_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"broker_name" varchar(100),
	"broker_account_id" varchar(255),
	"account_number" varchar(100),
	"external_service_url" varchar(255),
	"external_service_type" varchar(50),
	"ata_account_id" varchar(255),
	"platform" varchar(10),
	"meta_api_deployment_status" varchar(20),
	"auto_undeploy_enabled" boolean DEFAULT true,
	"auto_undeploy_delay_minutes" varchar(10) DEFAULT '60',
	"meta_api_last_deployed_at" timestamp,
	"meta_api_last_used_at" timestamp,
	"account_type" varchar(20),
	"currency" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp,
	"last_sync_status" varchar(20),
	"last_sync_error" text,
	"sync_count" varchar(10) DEFAULT '0',
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "broker_connection_journal_id_unique" UNIQUE("journal_id")
);
--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "source" varchar(50) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "external_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "sync_status" varchar(20) DEFAULT 'synced';--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "advanced_trade" ADD COLUMN "sync_metadata" text;--> statement-breakpoint
ALTER TABLE "broker_connection" ADD CONSTRAINT "broker_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_connection" ADD CONSTRAINT "broker_connection_journal_id_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "broker_connection_user_id_idx" ON "broker_connection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "broker_connection_journal_id_idx" ON "broker_connection" USING btree ("journal_id");--> statement-breakpoint
CREATE INDEX "broker_connection_provider_idx" ON "broker_connection" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "broker_connection_active_idx" ON "broker_connection" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "advanced_trade_source_idx" ON "advanced_trade" USING btree ("source");--> statement-breakpoint
CREATE INDEX "advanced_trade_external_id_idx" ON "advanced_trade" USING btree ("external_id");