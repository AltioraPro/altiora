ALTER TABLE "broker_connection" ADD COLUMN IF NOT EXISTS "webhook_token" varchar(64);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broker_connection_webhook_token_idx" ON "broker_connection" USING btree ("webhook_token");--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "external_service_url";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "external_service_type";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "ata_account_id";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "meta_api_deployment_status";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "auto_undeploy_enabled";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "auto_undeploy_delay_minutes";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "meta_api_last_deployed_at";--> statement-breakpoint
ALTER TABLE "broker_connection" DROP COLUMN IF EXISTS "meta_api_last_used_at";