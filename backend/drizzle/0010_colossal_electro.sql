ALTER TABLE "board_members" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "status" text DEFAULT 'Pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "invited_by" uuid;--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "invite_token" text;--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "invite_email_id" uuid;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_pending_invite" ON "board_members" USING btree ("board_id","email") WHERE "board_members"."status" = 'Pending';--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "status_check" CHECK ("board_members"."status" IN ('Pending', 'Active'));