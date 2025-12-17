CREATE TABLE "goal_category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20) DEFAULT '#6366f1' NOT NULL,
	"icon" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "category_id" varchar(255);--> statement-breakpoint
ALTER TABLE "goal_category" ADD CONSTRAINT "goal_category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_category_user_id_idx" ON "goal_category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_category_name_idx" ON "goal_category" USING btree ("name");--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_category_id_goal_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."goal_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_category_id_idx" ON "goal" USING btree ("category_id");