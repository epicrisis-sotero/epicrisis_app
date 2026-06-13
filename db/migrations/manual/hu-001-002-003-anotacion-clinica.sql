-- ============================================================================
-- Migración manual — HU-001 / HU-002 / HU-003
-- ----------------------------------------------------------------------------
-- Aplica de forma idempotente los cambios de schema de tres historias de usuario.
-- El proyecto aplica DDL directo a la base (el journal de drizzle está
-- desincronizado), por eso este archivo vive fuera de db/migrations/*.sql.
--
-- Ejecutar en prod con:
--   psql "$DATABASE_URL" -f db/migrations/manual/hu-001-002-003-anotacion-clinica.sql
--
-- Todos los cambios son ADITIVOS y no destructivos. Se puede correr varias veces.
-- ============================================================================

-- ── HU-002 (anotador): Jerarquía de consumo de sustancias ───────────────────
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_sustancias              boolean;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_tabaco                  boolean;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_tabaco_estado           text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_tabaco_cigarrillos_dia  integer;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_tabaco_anios            integer;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_tabaco_ipa              text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_alcohol                 boolean;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_alcohol_estado          text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_alcohol_detalle         text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_otras_drogas            boolean;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_otras_drogas_estado     text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS consumo_otras_drogas_detalle    text;

-- ── HU-003 (anotador): Árbol de infecciones y sepsis ────────────────────────
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS sepsis                          boolean;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS sepsis_evidencia                text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS sepsis_comments                 text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS infeccion_respiratorio_tipo     text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS infeccion_urinario_tipo         text;
ALTER TABLE epicrisis_clinical_data ADD COLUMN IF NOT EXISTS infeccion_sangre_contaminacion  boolean;

-- ── HU-001 (admin): Derivación a revisión experta ───────────────────────────
-- Nuevo valor del enum de estado. ADD VALUE no corre dentro de transacción y no
-- es reversible, pero es no destructivo para los registros existentes.
ALTER TYPE epicrisis_status ADD VALUE IF NOT EXISTS 'needs_expert_review';
