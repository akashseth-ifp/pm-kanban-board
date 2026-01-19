ALTER TABLE "board_members" DROP CONSTRAINT "board_members_invited_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" DROP COLUMN "invite_email_id";