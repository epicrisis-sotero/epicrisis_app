import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  json,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['admin', 'annotator'])
export const epicrisisStatusEnum = pgEnum('epicrisis_status', [
  'pending',
  'in_review',
  'reviewed',
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
  contentMarkdown: text('content_markdown').notNull(),
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
  evidenceText: text('evidence_text'),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const epicrisisClinicalData = pgTable('epicrisis_clinical_data', {
  epicrisisId: integer('epicrisis_id')
    .primaryKey()
    .references(() => epicrisis.id, { onDelete: 'cascade' }),
  
  // Antecedentes
  cirugiaPrevias: boolean('cirugia_previas'),
  cirugiasPreviasCantidad: integer('cirugias_previas_cantidad'),
  farmacos: text('farmacos'),

  // Soporte Ventilatorio
  vmi: boolean('vmi'),
  vmiEvidencia: text('vmi_evidencia'),
  vmiMotivo: text('vmi_motivo'),
  vmiUrgente: boolean('vmi_urgente'),
  vmiProno: boolean('vmi_prono'),
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
}))

export const epicrisisClinicalDataRelations = relations(epicrisisClinicalData, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [epicrisisClinicalData.epicrisisId], references: [epicrisis.id] }),
}))

export const annotationsRelations = relations(annotations, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [annotations.epicrisisId], references: [epicrisis.id] }),
  user: one(users, { fields: [annotations.userId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type Epicrisis = typeof epicrisis.$inferSelect
export type Annotation = typeof annotations.$inferSelect
export type NewAnnotation = typeof annotations.$inferInsert
