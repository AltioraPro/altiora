CREATE TABLE "trades_confirmation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advanced_trade_id" varchar(255) NOT NULL,
	"confirmation_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_advanced_trade_id_advanced_trade_id_fk" FOREIGN KEY ("advanced_trade_id") REFERENCES "public"."advanced_trade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades_confirmation" ADD CONSTRAINT "trades_confirmation_confirmation_id_confirmation_id_fk" FOREIGN KEY ("confirmation_id") REFERENCES "public"."confirmation"("id") ON DELETE cascade ON UPDATE no action;