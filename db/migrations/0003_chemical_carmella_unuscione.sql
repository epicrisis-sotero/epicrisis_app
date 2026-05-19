ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "patient_id" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "direccion" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "quintil_estimado" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "prevision" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "tipo_prevision" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "quintil_teorico" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "concordancia_gse" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "hacinamiento_manzana" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "confianza_geocodificacion" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "estado_mortalidad" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "fecha_ingreso_hosp" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "fecha_egreso_hosp" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "fecha_ingreso_uci" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "fecha_egreso_uci" text;--> statement-breakpoint
ALTER TABLE "epicrisis" ADD COLUMN IF NOT EXISTS "comentario_final" text;
