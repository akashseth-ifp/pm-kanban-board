ALTER TABLE "tickets" DROP CONSTRAINT "tickets_assignee_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_reporter_user_id_fk";
--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "version" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "assignee_id" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "reporter_id" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "assignee";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "reporter";