ALTER TABLE "boards" DROP CONSTRAINT "background_check";--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "board_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN "background";