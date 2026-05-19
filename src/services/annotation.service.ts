import { api } from './api'

export interface CriterionPayload {
  criterionName: string
  isPresent: boolean | null
  evidenceText: string | null
  comments: string | null
}

export interface EpicrisisMetadata {
  fechaIngresoHosp?: string
  fechaEgresoHosp?: string
  fechaIngresoUci?: string
  fechaEgresoUci?: string
  comentarioFinal?: string
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
  evidenceText: string | null
  comments: string | null
}

export const annotationService = {
  getForEpicrisis: (epicrisisId: number) =>
    api.get<{ annotations: any[] }>(`/annotations?epicrisisId=${epicrisisId}`),

  submit: (epicrisisId: number, criteria: any[], isFinal: boolean, epicrisisMetadata?: EpicrisisMetadata) =>
    api.post<{ ok: boolean; status: string }>('/annotations', { epicrisisId, criteria, isFinal, epicrisisMetadata }),

  lock: (epicrisisId: number) =>
    api.post<{ ok: boolean }>('/lock', { epicrisisId, action: 'lock' }),

  unlock: (epicrisisId: number) =>
    api.post<{ ok: boolean }>('/lock', { epicrisisId, action: 'unlock' }),
}
