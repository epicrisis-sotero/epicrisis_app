import { api } from './api'

export interface AdminEpicrisisRow {
  id: number
  status: 'pending' | 'in_review' | 'reviewed'
  assigneeId: number | null
  createdAt: string
  assigneeEmail: string | null
  annotatedCount: number
}

export interface AdminMatrixRow {
  id: number
  status: 'pending' | 'in_review' | 'reviewed'
  assigneeEmail: string | null
  annotations: Record<string, { isPresent: boolean | null; evidenceText: string | null }>
}

export interface AdminStats {
  total: number
  unassigned: number
  pending: number
  in_review: number
  reviewed: number
}

export interface AdminUser {
  id: number
  email: string
  role: string
}

export const adminService = {
  getEpicrises: () =>
    api.get<{ epicrises: AdminEpicrisisRow[]; stats: AdminStats }>('/admin?resource=epicrisis'),

  getUsers: () =>
    api.get<{ users: AdminUser[] }>('/admin?resource=users'),

  getMatrix: () =>
    api.get<{ matrix: AdminMatrixRow[] }>('/admin?resource=matrix'),

  assign: (epicrisisId: number, userId: number | null) =>
    api.patch<{ ok: boolean }>('/admin', { epicrisisId, userId }),
}
