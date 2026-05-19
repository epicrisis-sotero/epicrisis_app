ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "locked_by" integer;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "locked_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "epicrisis" ADD CONSTRAINT "epicrisis_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
