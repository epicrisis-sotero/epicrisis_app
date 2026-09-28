import type { AdminEpicrisisRow } from '@/services/admin.service'

export type AdminProgressFilter = 'all' | 'annotated' | 'completed_any' | 'completed_all'

function compact(value: string): string {
  return value.trim().toUpperCase().replace(/[\s_-]+/g, '')
}

export function matchesEpicrisisIdentifier(row: AdminEpicrisisRow, query: string): boolean {
  const needle = compact(query)
  if (!needle) return true

  const paddedId = String(row.id).padStart(5, '0')
  const candidates = [
    String(row.id),
    paddedId,
    `EPC${paddedId}`,
    row.patientId ?? '',
  ].map(compact)

  return candidates.some(candidate => candidate.includes(needle))
}

// Filtra por anotador asignado. 'all' no filtra; 'unassigned' deja solo las que
// no tienen a nadie; un id numérico deja las que tienen a ese anotador entre sus
// asignados — se mira `assignees`, no `assigneeId`, porque una epicrisis puede
// tener varios y `assigneeId` solo guarda al primero.
export type AdminAssigneeFilter = 'all' | 'unassigned' | number

// El value de un <select> siempre llega como string. Sin esta conversión, un id
// numérico se compararía como texto contra `a.id` y el filtro no encontraría nada.
export function parseAssigneeFilter(value: string): AdminAssigneeFilter {
  if (value === 'all' || value === 'unassigned') return value
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : 'all'
}

export function matchesAssignee(row: AdminEpicrisisRow, filter: AdminAssigneeFilter): boolean {
  if (filter === 'all') return true
  const assignees = row.assignees ?? []
  if (filter === 'unassigned') return assignees.length === 0
  return assignees.some(a => a.id === filter)
}

export function matchesProgress(row: AdminEpicrisisRow, filter: AdminProgressFilter): boolean {
  if (filter === 'annotated') return row.annotationCount > 0
  if (filter === 'completed_any') return row.completedCount > 0
  if (filter === 'completed_all') {
    return row.assignedCount > 0 && row.completedCount === row.assignedCount
  }
  return true
}
