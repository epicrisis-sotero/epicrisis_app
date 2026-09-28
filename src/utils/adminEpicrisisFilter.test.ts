import { describe, expect, it } from 'vitest'
import { matchesAssignee, matchesEpicrisisIdentifier, matchesProgress, parseAssigneeFilter } from './adminEpicrisisFilter'
import type { AdminEpicrisisRow } from '@/services/admin.service'

const row: AdminEpicrisisRow = {
  id: 605,
  patientId: 'E364F032C1F6309E',
  status: 'in_review',
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  assigneeEmail: null,
  assignees: [],
  annotationCount: 12,
  assignedCount: 2,
  completedCount: 1,
}

describe('admin epicrisis filters', () => {
  it.each(['EPC-00605', 'epc00605', '605', 'E364F032C1F6309E', 'e364f032']) (
    'encuentra la epicrisis por %s',
    query => expect(matchesEpicrisisIdentifier(row, query)).toBe(true),
  )

  it('rechaza identificadores que no corresponden', () => {
    expect(matchesEpicrisisIdentifier(row, 'EPC-00123')).toBe(false)
  })

  it('filtra por avance de anotadores', () => {
    expect(matchesProgress(row, 'annotated')).toBe(true)
    expect(matchesProgress(row, 'completed_any')).toBe(true)
    expect(matchesProgress(row, 'completed_all')).toBe(false)
    expect(matchesProgress({ ...row, completedCount: 2 }, 'completed_all')).toBe(true)
  })
})

describe('filtro por anotador asignado', () => {
  const conDos: AdminEpicrisisRow = {
    ...row,
    assignees: [
      { id: 8,  email: 'marceloandia@epicrisis.cl', annotatedCount: 222, activeTimeMs: 0, completedAt: '2026-09-26T00:00:00.000Z' },
      { id: 10, email: 'jorgelopez@epicrisis.cl',   annotatedCount: 0,   activeTimeMs: 0, completedAt: null },
    ],
  }
  const sinNadie: AdminEpicrisisRow = { ...row, assignees: [] }

  it("'all' no filtra nada", () => {
    expect(matchesAssignee(conDos, 'all')).toBe(true)
    expect(matchesAssignee(sinNadie, 'all')).toBe(true)
  })

  it('encuentra por cualquiera de los asignados, no solo el primero', () => {
    expect(matchesAssignee(conDos, 8)).toBe(true)
    expect(matchesAssignee(conDos, 10)).toBe(true)
  })

  it('descarta a quien no está asignado', () => {
    expect(matchesAssignee(conDos, 99)).toBe(false)
  })

  it("'unassigned' deja solo las que no tienen a nadie", () => {
    expect(matchesAssignee(sinNadie, 'unassigned')).toBe(true)
    expect(matchesAssignee(conDos, 'unassigned')).toBe(false)
  })

  it('tolera que assignees venga ausente', () => {
    const sinCampo = { ...row, assignees: undefined } as unknown as AdminEpicrisisRow
    expect(matchesAssignee(sinCampo, 8)).toBe(false)
    expect(matchesAssignee(sinCampo, 'unassigned')).toBe(true)
  })
})

describe('parseAssigneeFilter', () => {
  it('conserva los valores especiales', () => {
    expect(parseAssigneeFilter('all')).toBe('all')
    expect(parseAssigneeFilter('unassigned')).toBe('unassigned')
  })

  it('convierte el id a número, que es lo que compara matchesAssignee', () => {
    expect(parseAssigneeFilter('8')).toBe(8)
    expect(typeof parseAssigneeFilter('8')).toBe('number')
  })

  it('ante basura cae en "all" en vez de filtrar todo fuera', () => {
    expect(parseAssigneeFilter('')).toBe('all')
    expect(parseAssigneeFilter('abc')).toBe('all')
    expect(parseAssigneeFilter('0')).toBe('all')
    expect(parseAssigneeFilter('-3')).toBe('all')
  })

  it('el id convertido sí encuentra a su anotador', () => {
    const fila: AdminEpicrisisRow = {
      ...row,
      assignees: [{ id: 8, email: 'marceloandia@epicrisis.cl', annotatedCount: 0, activeTimeMs: 0, completedAt: null }],
    }
    expect(matchesAssignee(fila, parseAssigneeFilter('8'))).toBe(true)
    expect(matchesAssignee(fila, '8' as unknown as number)).toBe(false)  // sin convertir, falla
  })
})
