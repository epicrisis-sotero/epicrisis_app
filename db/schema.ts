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

export interface ClinicalData {
  cirugiaPrevias: boolean | null; cirugiasPreviasCantidad: number | null; farmacos: string
  vmi: boolean | null; vmiEvidencia: string; vmiMotivo: string; vmiUrgente: boolean | null; vmiProno: boolean | null; vmiComments: string
  maniobrasReanimacion: string; ciclosParo: number | null; cantidadParos: number | null
  transfusion: boolean | null; transfusionEvidencia: string; transfusionUnidades: number | null; transfusionComments: string
  drogasVasoactivas: boolean | null; drogasVasoactivasEvidencia: string; drogasVasoactivasMultiples: boolean | null; drogasVasoactivasComments: string
  cirugiasHosp: number | null; cirugiasHospDescripcion: string
  infeccionUrinario: boolean | null; infeccionUrinarioEvidencia: string; infeccionUrinarioGermen: string; infeccionUrinarioComments: string
  infeccionRespiratorio: boolean | null; infeccionRespiratorioEvidencia: string; infeccionRespiratorioGermen: string; infeccionRespiratorioComments: string
  infeccionVascular: boolean | null; infeccionVascularEvidencia: string; infeccionVascularGermen: string; infeccionVascularComments: string
  infeccionSangre: boolean | null; infeccionSangreEvidencia: string; infeccionSangreGermen: string; infeccionSangreComments: string
  infeccionCerebral: boolean | null; infeccionCerebralEvidencia: string; infeccionCerebralGermen: string; infeccionCerebralComments: string
  infeccionCardiaco: boolean | null; infeccionCardiacoEvidencia: string; infeccionCardiacoGermen: string; infeccionCardiacoComments: string
  infeccionQuirurgico: boolean | null; infeccionQuirurgicoEvidencia: string; infeccionQuirurgicoGermen: string; infeccionQuirurgicoComments: string
  infeccionGastrointestinal: boolean | null; infeccionGastrointestinalEvidencia: string; infeccionGastrointestinalGermen: string; infeccionGastrointestinalComments: string
  infeccionPielTejidos: boolean | null; infeccionPielTejidosEvidencia: string; infeccionPielTejidosGermen: string; infeccionPielTejidosComments: string
  trr: boolean | null; trrEvidencia: string; trrTipo: string; trrComments: string
  fallaRenal: boolean | null; fallaRenalEvidencia: string; fallaRenalComments: string
  fallaNervioso: boolean | null; fallaNerviosoEvidencia: string; fallaNerviosoComments: string
  fallaVascular: boolean | null; fallaVascularEvidencia: string; fallaVascularComments: string
  fallaCardiaco: boolean | null; fallaCardiacoEvidencia: string; fallaCardiacoComments: string
  fallaPulmonar: boolean | null; fallaPulmonarEvidencia: string; fallaPulmonarComments: string
  fallaHepatico: boolean | null; fallaHepaticoEvidencia: string; fallaHepaticoComments: string
  fallaOtra: boolean | null; fallaOtraEvidencia: string; fallaOtraDescripcion: string; fallaOtraComments: string
  diagnosticoIngreso: string; diagnosticoEgreso: string; farmacosHosp: string
  mortalidad: boolean | null; mortalidadEvidencia: string; mortalidadComments: string; hfav: boolean | null; hfavEvidencia: string; hfavComments: string
}

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
  contentMarkdown: text('content_markdown').notNull(),
  llmPredictions: json('llm_predictions').$type<LlmPredictions>(),
  clinicalData: json('clinical_data').$type<ClinicalData>(),
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

export const usersRelations = relations(users, ({ many }) => ({
  epicrises: many(epicrisis),
  annotations: many(annotations),
}))

export const epicrisisRelations = relations(epicrisis, ({ one, many }) => ({
  assignee: one(users, { fields: [epicrisis.assigneeId], references: [users.id] }),
  annotations: many(annotations),
}))

export const annotationsRelations = relations(annotations, ({ one }) => ({
  epicrisis: one(epicrisis, { fields: [annotations.epicrisisId], references: [epicrisis.id] }),
  user: one(users, { fields: [annotations.userId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type Epicrisis = typeof epicrisis.$inferSelect
export type Annotation = typeof annotations.$inferSelect
export type NewAnnotation = typeof annotations.$inferInsert
