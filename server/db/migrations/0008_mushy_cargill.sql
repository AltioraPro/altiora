CREATE TABLE "altiora_goal_reminder" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'sent',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "altiora_goal_task" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp with time zone,
	"is_completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "altiora_sub_goal" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"goal_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD COLUMN "goal_type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD COLUMN "reminders_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD COLUMN "reminder_frequency" varchar(20);--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD COLUMN "last_reminder_sent" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "altiora_goal" ADD COLUMN "next_reminder_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "altiora_goal_reminder" ADD CONSTRAINT "altiora_goal_reminder_goal_id_altiora_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."altiora_goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_goal_reminder" ADD CONSTRAINT "altiora_goal_reminder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_goal_task" ADD CONSTRAINT "altiora_goal_task_goal_id_altiora_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."altiora_goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_goal_task" ADD CONSTRAINT "altiora_goal_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_sub_goal" ADD CONSTRAINT "altiora_sub_goal_goal_id_altiora_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."altiora_goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altiora_sub_goal" ADD CONSTRAINT "altiora_sub_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_reminder_goal_id_idx" ON "altiora_goal_reminder" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "goal_reminder_user_id_idx" ON "altiora_goal_reminder" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_reminder_sent_at_idx" ON "altiora_goal_reminder" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "goal_task_goal_id_idx" ON "altiora_goal_task" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "goal_task_user_id_idx" ON "altiora_goal_task" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_task_due_date_idx" ON "altiora_goal_task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "sub_goal_goal_id_idx" ON "altiora_sub_goal" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "sub_goal_user_id_idx" ON "altiora_sub_goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_reminder_idx" ON "altiora_goal" USING btree ("reminders_enabled","next_reminder_date");