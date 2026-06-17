import { api } from './api'

export interface CriterionPayload {
  criterionName: string
  isPresent: boolean | null | 'unknown'
  evidenceText: string | null
  comments: string | null
}

export interface EpicrisisMetadata {
  fechaIngresoHosp?: string
  fechaEgresoHosp?: string
  fechaIngresoUci?: string
  fechaEgresoUci?: string
  comentarioFinal?: string
  activeTimeMs?: number
}

export interface SubmitPayload {
  epicrisisId: number
  criteria: CriterionPayload[]
  isFinal: boolean
  epicrisisMetadata?: EpicrisisMetadata
}

export interface ServerAnnotation {
  criterionName: string
  isPresent: boolean | null
  isUnknown: boolean
  evidenceText: string | null
  comments: string | null
}

export const annotationService = {
  getForEpicrisis: (epicrisisId: number) =>
    api.get<{ annotations: any[]; clinicalDifficulty: Record<string, { difficulty: string | null; notes: string }> }>(`/annotations?epicrisisId=${epicrisisId}`),

  submit: (epicrisisId: number, criteria: any[], isFinal: boolean, epicrisisMetadata?: EpicrisisMetadata) =>
    api.post<{ ok: boolean; status: string }>('/annotations', { epicrisisId, criteria, isFinal, epicrisisMetadata }),

  lock: (epicrisisId: number) =>
    api.post<{ ok: boolean }>('/lock', { epicrisisId, action: 'lock' }),

  unlock: (epicrisisId: number) =>
    api.post<{ ok: boolean }>('/lock', { epicrisisId, action: 'unlock' }),
}
