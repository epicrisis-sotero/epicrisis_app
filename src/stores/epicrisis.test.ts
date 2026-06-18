import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEpicrisisStore, type EpicrisisListItem } from './epicrisis'

const mk = (id: number, status: EpicrisisListItem['status']): EpicrisisListItem => ({
  id, status, patientId: null, assigneeId: null, createdAt: '2026-01-01', assigneeEmail: null,
})

describe('epicrisis store — filtros por estado', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('separa cada estado en su computed (incluye needs_expert_review)', () => {
    const s = useEpicrisisStore()
    s.list = [mk(1, 'pending'), mk(2, 'in_review'), mk(3, 'reviewed'), mk(4, 'needs_expert_review'), mk(5, 'pending')]
    expect(s.pending.map(e => e.id)).toEqual([1, 5])
    expect(s.inReview.map(e => e.id)).toEqual([2])
    expect(s.reviewed.map(e => e.id)).toEqual([3])
    expect(s.needsExpertReview.map(e => e.id)).toEqual([4])
  })

  it('una epicrisis needs_expert_review NO aparece en pending/in_review/reviewed', () => {
    const s = useEpicrisisStore()
    s.list = [mk(1, 'needs_expert_review')]
    expect(s.pending).toHaveLength(0)
    expect(s.inReview).toHaveLength(0)
    expect(s.reviewed).toHaveLength(0)
    expect(s.needsExpertReview).toHaveLength(1)
  })

  it('updateStatus actualiza list y current', () => {
    const s = useEpicrisisStore()
    s.list = [mk(1, 'needs_expert_review')]
    s.current = { ...mk(1, 'needs_expert_review') } as any
    s.updateStatus(1, 'reviewed')
    expect(s.list[0].status).toBe('reviewed')
    expect(s.current!.status).toBe('reviewed')
    expect(s.needsExpertReview).toHaveLength(0)
    expect(s.reviewed).toHaveLength(1)
  })
})

// HU-015 — estado del Dashboard (pestaña + scroll) persiste y se limpia en reset
describe('HU-015 estado del Dashboard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('por defecto pestaña pending y scroll 0', () => {
    const s = useEpicrisisStore()
    expect(s.dashboardTab).toBe('pending')
    expect(s.dashboardScrollTop).toBe(0)
  })

  it('conserva pestaña y scroll, y resetDashboardState los limpia', () => {
    const s = useEpicrisisStore()
    s.dashboardTab = 'reviewed'
    s.dashboardScrollTop = 420
    expect(s.dashboardTab).toBe('reviewed')
    expect(s.dashboardScrollTop).toBe(420)
    s.resetDashboardState()
    expect(s.dashboardTab).toBe('pending')
    expect(s.dashboardScrollTop).toBe(0)
  })
})
