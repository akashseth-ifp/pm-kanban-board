CREATE TABLE "board_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"board_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"payload" jsonb,
	"version" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_type_check" CHECK ("board_events"."event_type" IN ('GET_BOARDS', 'ADD_BOARD', 'GET_BOARD', 'UPDATE_BOARD', 'DELETE_BOARD', 'GET_LISTS', 'ADD_LIST', 'UPDATE_LIST', 'MOVE_LIST', 'DELETE_LIST', 'GET_TICKETS', 'ADD_TICKET', 'GET_TICKET', 'MOVE_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET')),
	CONSTRAINT "entity_type_check" CHECK ("board_events"."entity_type" IN ('Ticket', 'List', 'Board', 'Member'))
);
--> statement-breakpoint
CREATE TABLE "board_members" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"board_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'Member' NOT NULL,
	"version" bigint DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_check" CHECK ("board_members"."role" IN ('Admin', 'Member', 'Viewer'))
);
--> statement-breakpoint
ALTER TABLE "board_events" ADD CONSTRAINT "board_events_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_events" ADD CONSTRAINT "board_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;