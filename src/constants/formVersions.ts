import { FORM_SCHEMA, type FormNode } from './formSchema'

export const LEGACY_FORM_VERSION = 'uci-v3'
export const CURRENT_FORM_VERSION = 'uci-v4-20261015'
export type FormVersion = typeof LEGACY_FORM_VERSION | typeof CURRENT_FORM_VERSION

// Lista cerrada para esta entrega. Las demás decisiones clínicas siguen pendientes.
export const RETIRED_FIELD_ROOTS = [
  'antecedentes.neurologico.parkinson',
  'antecedentes.infeccioso.tuberculosis.activa',
  'antecedentes.inmunologico_reumatologico.inmunosupresion_cronica',
  'antecedentes.psiquiatrico.trastorno_personalidad',
  'falla.neurologica',
  'falla.hematologica',
  'soporte.otros_avanzados',
  'infecciones.focos.osteoarticular',
] as const

function retain(nodes: FormNode[]): FormNode[] {
  return nodes.filter(n => !RETIRED_FIELD_ROOTS.some(k => n.key === k)).map(n => ({
    ...n,
    ...(n.children ? { children: retain(n.children) } : {}),
  }))
}
const CURRENT_SCHEMA = retain(FORM_SCHEMA)

export function schemaForVersion(version: FormVersion): FormNode[] {
  return version === LEGACY_FORM_VERSION ? FORM_SCHEMA : CURRENT_SCHEMA
}

export function parseFormVersion(value: unknown): FormVersion {
  if (value === LEGACY_FORM_VERSION || value === CURRENT_FORM_VERSION) return value
  throw new Error('Versión de formulario desconocida. Recarga la aplicación antes de continuar.')
}

export function versionFromAnnotations(rows: Array<{ evidenceMetadata?: any }>): FormVersion {
  if (!rows.length) return CURRENT_FORM_VERSION
  const versions = new Set(rows.map(row => parseFormVersion(row.evidenceMetadata?.formVersion ?? LEGACY_FORM_VERSION)))
  if (versions.size !== 1) throw new Error('Las respuestas contienen versiones distintas del formulario.')
  return [...versions][0]
}
