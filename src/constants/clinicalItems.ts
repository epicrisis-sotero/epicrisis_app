import type { ClinicalData } from '@/types/clinical'

export interface FocoItem {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  germenKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
}

export interface OrganItem {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
  descripcionKey?: keyof ClinicalData
}

export const FOCOS: FocoItem[] = [
  { key: 'infeccionUrinario',         label: 'Urinario',               evidenciaKey: 'infeccionUrinarioEvidencia',         germenKey: 'infeccionUrinarioGermen',         commentsKey: 'infeccionUrinarioComments' },
  { key: 'infeccionRespiratorio',     label: 'Respiratorio',           evidenciaKey: 'infeccionRespiratorioEvidencia',     germenKey: 'infeccionRespiratorioGermen',     commentsKey: 'infeccionRespiratorioComments' },
  { key: 'infeccionVascular',         label: 'Vascular',               evidenciaKey: 'infeccionVascularEvidencia',         germenKey: 'infeccionVascularGermen',         commentsKey: 'infeccionVascularComments' },
  { key: 'infeccionSangre',           label: 'Sangre',                 evidenciaKey: 'infeccionSangreEvidencia',           germenKey: 'infeccionSangreGermen',           commentsKey: 'infeccionSangreComments' },
  { key: 'infeccionCerebral',         label: 'Cerebral',               evidenciaKey: 'infeccionCerebralEvidencia',         germenKey: 'infeccionCerebralGermen',         commentsKey: 'infeccionCerebralComments' },
  { key: 'infeccionCardiaco',         label: 'Cardíaco',               evidenciaKey: 'infeccionCardiacoEvidencia',         germenKey: 'infeccionCardiacoGermen',         commentsKey: 'infeccionCardiacoComments' },
  { key: 'infeccionQuirurgico',       label: 'Quirúrgico',             evidenciaKey: 'infeccionQuirurgicoEvidencia',       germenKey: 'infeccionQuirurgicoGermen',       commentsKey: 'infeccionQuirurgicoComments' },
  { key: 'infeccionGastrointestinal', label: 'Gastrointestinal',       evidenciaKey: 'infeccionGastrointestinalEvidencia', germenKey: 'infeccionGastrointestinalGermen', commentsKey: 'infeccionGastrointestinalComments' },
  { key: 'infeccionPielTejidos',      label: 'Piel y tejidos blandos', evidenciaKey: 'infeccionPielTejidosEvidencia',      germenKey: 'infeccionPielTejidosGermen',      commentsKey: 'infeccionPielTejidosComments' },
]

export const ORGANOS: OrganItem[] = [
  { key: 'fallaRenal',    label: 'Renal',    evidenciaKey: 'fallaRenalEvidencia',    commentsKey: 'fallaRenalComments' },
  { key: 'fallaNervioso', label: 'Nervioso', evidenciaKey: 'fallaNerviosoEvidencia', commentsKey: 'fallaNerviosoComments' },
  { key: 'fallaVascular', label: 'Vascular', evidenciaKey: 'fallaVascularEvidencia', commentsKey: 'fallaVascularComments' },
  { key: 'fallaCardiaco', label: 'Cardíaco', evidenciaKey: 'fallaCardiacoEvidencia', commentsKey: 'fallaCardiacoComments' },
  { key: 'fallaPulmonar', label: 'Pulmonar', evidenciaKey: 'fallaPulmonarEvidencia', commentsKey: 'fallaPulmonarComments' },
  { key: 'fallaHepatico', label: 'Hepático', evidenciaKey: 'fallaHepaticoEvidencia', commentsKey: 'fallaHepaticoComments' },
  { key: 'fallaOtra',     label: 'Otra',     evidenciaKey: 'fallaOtraEvidencia',     commentsKey: 'fallaOtraComments', descripcionKey: 'fallaOtraDescripcion' },
]

export function normalizeSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
