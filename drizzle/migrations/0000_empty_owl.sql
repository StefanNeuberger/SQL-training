CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."validation_type" AS ENUM('exact', 'count', 'contains');--> statement-breakpoint
CREATE TABLE "app"."challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"difficulty" integer NOT NULL,
	"solution_query" text NOT NULL,
	"hint" text,
	"order_index" integer NOT NULL,
	"validation_type" "validation_type" DEFAULT 'exact' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"level" "level" NOT NULL,
	"order_index" integer NOT NULL,
	"icon" varchar(50),
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app"."user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"completed_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_query" text
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "app"."challenges" ADD CONSTRAINT "challenges_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "app"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_progress" ADD CONSTRAINT "user_progress_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "app"."challenges"("id") ON DELETE no action ON UPDATE no action;