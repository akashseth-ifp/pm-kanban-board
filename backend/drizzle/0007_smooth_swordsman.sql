ALTER TABLE "board_events" DROP CONSTRAINT "board_events_board_id_boards_id_fk";
--> statement-breakpoint
ALTER TABLE "board_events" DROP CONSTRAINT "board_events_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "board_members" DROP CONSTRAINT "board_members_board_id_boards_id_fk";
--> statement-breakpoint
ALTER TABLE "board_members" DROP CONSTRAINT "board_members_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "board_events" ADD CONSTRAINT "board_events_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_events" ADD CONSTRAINT "board_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;