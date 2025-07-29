CREATE TABLE "altiora_goal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(20) NOT NULL,
	"target_value" varchar(100),
	"current_value" varchar(100) DEFAULT '0',
	"unit" varchar(50),
	"deadline" timestamp with time zone,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD CONSTRAINT "altiora_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_user_id_idx" ON "altiora_goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_type_idx" ON "altiora_goal" USING btree ("type");--> statement-breakpoint
CREATE INDEX "goal_active_idx" ON "altiora_goal" USING btree ("is_active");