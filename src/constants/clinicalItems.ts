import type { ClinicalData } from '@/types/clinical'

export interface TipoOpcion {
  value: string
  label: string
}

export interface FocoItem {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  germenKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
  tipoKey?: keyof ClinicalData
  tipoOpciones?: TipoOpcion[]
  contaminacionKey?: keyof ClinicalData
}

export interface OrganItem {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
  descripcionKey?: keyof ClinicalData
}

export const FOCOS: FocoItem[] = [
  { key: 'infeccionUrinario',         label: 'Urinario',               evidenciaKey: 'infeccionUrinarioEvidencia',         germenKey: 'infeccionUrinarioGermen',         commentsKey: 'infeccionUrinarioComments',     tipoKey: 'infeccionUrinarioTipo',       tipoOpciones: [{ value: 'cistitis', label: 'Cistitis' }, { value: 'pielonefritis', label: 'Pielonefritis' }, { value: 'otro', label: 'Otro' }] },
  { key: 'infeccionRespiratorio',     label: 'Respiratorio',           evidenciaKey: 'infeccionRespiratorioEvidencia',     germenKey: 'infeccionRespiratorioGermen',     commentsKey: 'infeccionRespiratorioComments', tipoKey: 'infeccionRespiratorioTipo',   tipoOpciones: [{ value: 'neumonia', label: 'Neumonía' }, { value: 'nav', label: 'NAV' }, { value: 'otro', label: 'Otro' }] },
  { key: 'infeccionVascular',         label: 'Vascular',               evidenciaKey: 'infeccionVascularEvidencia',         germenKey: 'infeccionVascularGermen',         commentsKey: 'infeccionVascularComments' },
  { key: 'infeccionSangre',           label: 'Sangre',                 evidenciaKey: 'infeccionSangreEvidencia',           germenKey: 'infeccionSangreGermen',           commentsKey: 'infeccionSangreComments',       contaminacionKey: 'infeccionSangreContaminacion' },
  { key: 'infeccionCerebral',         label: 'Cerebral',               evidenciaKey: 'infeccionCerebralEvidencia',         germenKey: 'infeccionCerebralGermen',         commentsKey: 'infeccionCerebralComments' },
  { key: 'infeccionCardiaco',         label: 'Cardíaco',               evidenciaKey: 'infeccionCardiacoEvidencia',         germenKey: 'infeccionCardiacoGermen',         commentsKey: 'infeccionCardiacoComments' },
  { key: 'infeccionQuirurgico',       label: 'Quirúrgico',             evidenciaKey: 'infeccionQuirurgicoEvidencia',       germenKey: 'infeccionQuirurgicoGermen',       commentsKey: 'infeccionQuirurgicoComments' },
  { key: 'infeccionGastrointestinal', label: 'Gastrointestinal',       evidenciaKey: 'infeccionGastrointestinalEvidencia', germenKey: 'infeccionGastrointestinalGermen', commentsKey: 'infeccionGastrointestinalComments' },
  { key: 'infeccionPielTejidos',      label: 'Piel y tejidos blandos', evidenciaKey: 'infeccionPielTejidosEvidencia',      germenKey: 'infeccionPielTejidosGermen',      commentsKey: 'infeccionPielTejidosComments' },
  { key: 'infeccionOsea',            label: 'Ósea',                   evidenciaKey: 'infeccionOseaEvidencia',            germenKey: 'infeccionOseaGermen',            commentsKey: 'infeccionOseaComments' },
  { key: 'infeccionGeneral',         label: 'General',                evidenciaKey: 'infeccionGeneralEvidencia',         germenKey: 'infeccionGeneralGermen',         commentsKey: 'infeccionGeneralComments' },
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
