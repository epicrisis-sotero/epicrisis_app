import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  json,
  customType,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})


export const userRoleEnum = pgEnum('user_role', ['admin', 'annotator'])
export const epicrisisStatusEnum = pgEnum('epicrisis_status', [
  'pending',
  'in_review',
  'reviewed',
  'needs_expert_review',
])

export interface LlmPrediction {
  valor: boolean | null
  metodo: string
  confianza: number
  evidencia: string
  conflicto: boolean
  requiere_llm: boolean
  num_presentes: number
  num_ausentes: number
  _evidencia_llm?: string
  _razonamiento_llm?: string
}

export type LlmPredictions = Record<string, LlmPrediction>

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('annotator'),
  termsAcceptedAt: timestamp('terms_accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const epicrisis = pgTable('epicrisis', {
  id: serial('id').primaryKey(),
  patientId: text('patient_id'),
  direccion: text('direccion'),
  quintilEstimado: text('quintil_estimado'),
  prevision: text('prevision'),
  tipoPrevision: text('tipo_prevision'),
  quintilTeorico: text('quintil_teorico'),
  concordanciaGse: text('concordancia_gse'),
  hacinamientoManzana: text('hacinamiento_manzana'),
  confianzaGeocodificacion: text('confianza_geocodificacion'),
  estadoMortalidad: text('estado_mortalidad'),
  fechaIngresoHosp: text('fecha_ingreso_hosp'),
  fechaEgresoHosp: text('fecha_egreso_hosp'),
  fechaIngresoUci: text('fecha_ingreso_uci'),
  fechaEgresoUci: text('fecha_egreso_uci'),
  comentarioFinal: text('comentario_final'),
  pdfPath: text('pdf_path'),
  pdfData: bytea('pdf_data'),
  llmPredictions: json('llm_predictions').$type<LlmPredictions>(),
  status: epicrisisStatusEnum('status').notNull().default('pending'),
  assigneeId: integer('assignee_id').references(() => users.id),
  lockedBy: integer('locked_by').references(() => users.id),
  lockedAt: timestamp('locked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  epicrisisId: integer('epicrisis_id')
    .notNull()
    .references(() => epicrisis.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  criterionName: text('criterion_name').notNull(),
  isPresent: boolean('is_present'),
  isUnknown: boolean('is_unknown').notNull().default(false),
  difficulty: text('difficulty'),        // 'easy' | 'medium' | 'hard'
  difficultyNotes: text('difficulty_notes'),
  evidenceText: text('evidence_text'),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const epicrisisAssignments = pgTable('epicrisis_assignments', {
  id: serial('id').primaryKey(),
  epicrisisId: integer('epicrisis_id')
    .notNull()
    .references(() => epicrisis.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),  // set when annotator submits final; null = in progress
})

export const epicrisisSections = pgTable('epicrisis_sections', {
  epicrisisId: integer('epicrisis_id')
    .notNull()
    .references(() => epicrisis.id, { onDelete: 'cascade' }),
  sectionName: text('section_name').notNull(),
  label: text('label').notNull(),
  content: text('content').notNull(),
  position: integer('position').notNull(),
})

export const epicrisisSectionsRelations = relations(epicrisisSections, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [epicrisisSections.epicrisisId], references: [epicrisis.id] }),
}))

export const epicrisisClinicalData = pgTable('epicrisis_clinical_data', {
  epicrisisId: integer('epicrisis_id')
    .notNull()
    .references(() => epicrisis.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Antecedentes
  cirugiaPrevias: boolean('cirugia_previas'),
  cirugiasPreviasCantidad: integer('cirugias_previas_cantidad'),
  farmacos: text('farmacos'),

  // Consumo de Sustancias
  consumoSustancias: boolean('consumo_sustancias'),
  consumoTabaco: boolean('consumo_tabaco'),
  consumoTabacoEstado: text('consumo_tabaco_estado'),
  consumoTabacoCigarrillosDia: integer('consumo_tabaco_cigarrillos_dia'),
  consumoTabacoAnios: integer('consumo_tabaco_anios'),
  consumoTabacoIpa: text('consumo_tabaco_ipa'),
  consumoAlcohol: boolean('consumo_alcohol'),
  consumoAlcoholEstado: text('consumo_alcohol_estado'),
  consumoAlcoholDetalle: text('consumo_alcohol_detalle'),
  consumoOtrasDrogas: boolean('consumo_otras_drogas'),
  consumoOtrasDrogasEstado: text('consumo_otras_drogas_estado'),
  consumoOtrasDrogasDetalle: text('consumo_otras_drogas_detalle'),

  // Sepsis e infecciones — campos adicionales HU-003
  sepsis: boolean('sepsis'),
  sepsisEvidencia: text('sepsis_evidencia'),
  sepsisComments: text('sepsis_comments'),
  infeccionRespiratorioTipo: text('infeccion_respiratorio_tipo'),
  infeccionUrinarioTipo: text('infeccion_urinario_tipo'),
  infeccionSangreContaminacion: boolean('infeccion_sangre_contaminacion'),

  // Soporte Ventilatorio
  vmi: boolean('vmi'),
  vmiEvidencia: text('vmi_evidencia'),
  vmiMotivo: text('vmi_motivo'),
  vmiUrgente: boolean('vmi_urgente'),
  vmiProno: boolean('vmi_prono'),
  vmiInicio: text('vmi_inicio'),
  vmiFin: text('vmi_fin'),
  vmiComments: text('vmi_comments'),

  // Reanimación
  maniobrasReanimacion: text('maniobras_reanimacion'),
  ciclosParo: integer('ciclos_paro'),
  cantidadParos: integer('cantidad_paros'),

  // Transfusión
  transfusion: boolean('transfusion'),
  transfusionEvidencia: text('transfusion_evidencia'),
  transfusionUnidades: integer('transfusion_unidades'),
  transfusionComments: text('transfusion_comments'),

  // Drogas Vasoactivas
  drogasVasoactivas: boolean('drogas_vasoactivas'),
  drogasVasoactivasEvidencia: text('drogas_vasoactivas_evidencia'),
  drogasVasoactivasMultiples: boolean('drogas_vasoactivas_multiples'),
  drogasVasoactivasComments: text('drogas_vasoactivas_comments'),

  // Cirugías Hosp
  cirugiasHosp: integer('cirugias_hosp'),
  cirugiasHospDescripcion: text('cirugias_hosp_descripcion'),

  // Infecciones
  infeccionUrinario: boolean('infeccion_urinario'),
  infeccionUrinarioEvidencia: text('infeccion_urinario_evidencia'),
  infeccionUrinarioGermen: text('infeccion_urinario_germen'),
  infeccionUrinarioComments: text('infeccion_urinario_comments'),

  infeccionRespiratorio: boolean('infeccion_respiratorio'),
  infeccionRespiratorioEvidencia: text('infeccion_respiratorio_evidencia'),
  infeccionRespiratorioGermen: text('infeccion_respiratorio_germen'),
  infeccionRespiratorioComments: text('infeccion_respiratorio_comments'),

  infeccionVascular: boolean('infeccion_vascular'),
  infeccionVascularEvidencia: text('infeccion_vascular_evidencia'),
  infeccionVascularGermen: text('infeccion_vascular_germen'),
  infeccionVascularComments: text('infeccion_vascular_comments'),

  infeccionSangre: boolean('infeccion_sangre'),
  infeccionSangreEvidencia: text('infeccion_sangre_evidencia'),
  infeccionSangreGermen: text('infeccion_sangre_germen'),
  infeccionSangreComments: text('infeccion_sangre_comments'),

  infeccionCerebral: boolean('infeccion_cerebral'),
  infeccionCerebralEvidencia: text('infeccion_cerebral_evidencia'),
  infeccionCerebralGermen: text('infeccion_cerebral_germen'),
  infeccionCerebralComments: text('infeccion_cerebral_comments'),

  infeccionCardiaco: boolean('infeccion_cardiaco'),
  infeccionCardiacoEvidencia: text('infeccion_cardiaco_evidencia'),
  infeccionCardiacoGermen: text('infeccion_cardiaco_germen'),
  infeccionCardiacoComments: text('infeccion_cardiaco_comments'),

  infeccionQuirurgico: boolean('infeccion_quirurgico'),
  infeccionQuirurgicoEvidencia: text('infeccion_quirurgico_evidencia'),
  infeccionQuirurgicoGermen: text('infeccion_quirurgico_germen'),
  infeccionQuirurgicoComments: text('infeccion_quirurgico_comments'),

  infeccionGastrointestinal: boolean('infeccion_gastrointestinal'),
  infeccionGastrointestinalEvidencia: text('infeccion_gastrointestinal_evidencia'),
  infeccionGastrointestinalGermen: text('infeccion_gastrointestinal_germen'),
  infeccionGastrointestinalComments: text('infeccion_gastrointestinal_comments'),

  infeccionPielTejidos: boolean('infeccion_piel_tejidos'),
  infeccionPielTejidosEvidencia: text('infeccion_piel_tejidos_evidencia'),
  infeccionPielTejidosGermen: text('infeccion_piel_tejidos_germen'),
  infeccionPielTejidosComments: text('infeccion_piel_tejidos_comments'),

  infeccionOsea: boolean('infeccion_osea'),
  infeccionOseaEvidencia: text('infeccion_osea_evidencia'),
  infeccionOseaGermen: text('infeccion_osea_germen'),
  infeccionOseaComments: text('infeccion_osea_comments'),

  infeccionGeneral: boolean('infeccion_general'),
  infeccionGeneralEvidencia: text('infeccion_general_evidencia'),
  infeccionGeneralGermen: text('infeccion_general_germen'),
  infeccionGeneralComments: text('infeccion_general_comments'),

  // Estado desconocido explícito para campos booleanos
  unknownFields: json('unknown_fields').$type<string[]>(),

  // Fechas clínicas capturadas por el anotador (per-user, no sobreescriben la extracción automática)
  fechaIngresoHosp: text('fecha_ingreso_hosp'),
  fechaEgresoHosp: text('fecha_egreso_hosp'),
  fechaIngresoUci: text('fecha_ingreso_uci'),
  fechaEgresoUci: text('fecha_egreso_uci'),
  comentarioFinal: text('comentario_final'),

  // TRR
  trr: boolean('trr'),
  trrEvidencia: text('trr_evidencia'),
  trrTipo: text('trr_tipo'),
  trrComments: text('trr_comments'),

  // Falla Orgánica
  fallaRenal: boolean('falla_renal'),
  fallaRenalEvidencia: text('falla_renal_evidencia'),
  fallaRenalComments: text('falla_renal_comments'),

  fallaNervioso: boolean('falla_nervioso'),
  fallaNerviosoEvidencia: text('falla_nervioso_evidencia'),
  fallaNerviosoComments: text('falla_nervioso_comments'),

  fallaVascular: boolean('falla_vascular'),
  fallaVascularEvidencia: text('falla_vascular_evidencia'),
  fallaVascularComments: text('falla_vascular_comments'),

  fallaCardiaco: boolean('falla_cardiaco'),
  fallaCardiacoEvidencia: text('falla_cardiaco_evidencia'),
  fallaCardiacoComments: text('falla_cardiaco_comments'),

  fallaPulmonar: boolean('falla_pulmonar'),
  fallaPulmonarEvidencia: text('falla_pulmonar_evidencia'),
  fallaPulmonarComments: text('falla_pulmonar_comments'),

  fallaHepatico: boolean('falla_hepatico'),
  fallaHepaticoEvidencia: text('falla_hepatico_evidencia'),
  fallaHepaticoComments: text('falla_hepatico_comments'),

  fallaOtra: boolean('falla_otra'),
  fallaOtraEvidencia: text('falla_otra_evidencia'),
  fallaOtraDescripcion: text('falla_otra_descripcion'),
  fallaOtraComments: text('falla_otra_comments'),

  // Diagnósticos y Egreso
  diagnosticoIngreso: text('diagnostico_ingreso'),
  diagnosticoEgreso: text('diagnostico_egreso'),
  farmacosHosp: text('farmacos_hosp'),
  mortalidad: boolean('mortalidad'),
  mortalidadEvidencia: text('mortalidad_evidencia'),
  mortalidadComments: text('mortalidad_comments'),
  hfav: boolean('hfav'),
  hfavEvidencia: text('hfav_evidencia'),
  hfavComments: text('hfav_comments'),
})

export const usersRelations = relations(users, ({ many }) => ({
  epicrises: many(epicrisis),
  annotations: many(annotations),
}))

export const epicrisisRelations = relations(epicrisis, ({ one, many }) => ({
  assignee: one(users, { fields: [epicrisis.assigneeId], references: [users.id] }),
  annotations: many(annotations),
  clinicalData: one(epicrisisClinicalData),
  sections: many(epicrisisSections),
}))

export const epicrisisClinicalDataRelations = relations(epicrisisClinicalData, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [epicrisisClinicalData.epicrisisId], references: [epicrisis.id] }),
}))

export const annotationsRelations = relations(annotations, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [annotations.epicrisisId], references: [epicrisis.id] }),
  user: one(users, { fields: [annotations.userId], references: [users.id] }),
}))

export const epicrisisAssignmentsRelations = relations(epicrisisAssignments, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [epicrisisAssignments.epicrisisId], references: [epicrisis.id] }),
  user: one(users, { fields: [epicrisisAssignments.userId], references: [users.id] }),
}))

export const annotationClinicalDifficulty = pgTable('annotation_clinical_difficulty', {
  id: serial('id').primaryKey(),
  epicrisisId: integer('epicrisis_id').notNull().references(() => epicrisis.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sectionName: text('section_name').notNull(),
  difficulty: text('difficulty'),        // 'easy' | 'medium' | 'hard'
  difficultyNotes: text('difficulty_notes'),
})

export type User = typeof users.$inferSelect
export type Epicrisis = typeof epicrisis.$inferSelect
export type Annotation = typeof annotations.$inferSelect
export type NewAnnotation = typeof annotations.$inferInsert
