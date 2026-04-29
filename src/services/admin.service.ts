import { api } from './api'
import type { LlmPredictions } from '@/types/db'

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
  llmPredictions: LlmPredictions | null
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
  role: 'admin' | 'annotator'
  createdAt: string
}

export const adminService = {
  getEpicrises: () =>
    api.get<{ epicrises: AdminEpicrisisRow[]; stats: AdminStats }>('/admin?resource=epicrisis'),

  getUsers: () =>
    api.get<{ users: AdminUser[] }>('/admin?resource=users'),

  getAllUsers: () =>
    api.get<{ users: AdminUser[] }>('/admin?resource=allUsers'),

  getMatrix: () =>
    api.get<{ matrix: AdminMatrixRow[] }>('/admin?resource=matrix'),

  assign: (epicrisisId: number, userId: number | null) =>
    api.patch<{ ok: boolean }>('/admin', { epicrisisId, userId }),

  createUser: (email: string, password: string, role: 'admin' | 'annotator') =>
    api.post<{ ok: boolean; user: AdminUser }>('/admin', { action: 'createUser', email, password, role }),

  updateUserRole: (userId: number, role: 'admin' | 'annotator') =>
    api.post<{ ok: boolean }>('/admin', { action: 'updateRole', userId, role }),

  deleteUser: (userId: number) =>
    api.post<{ ok: boolean }>('/admin', { action: 'deleteUser', userId }),

  resetUserPassword: (userId: number, newPassword: string) =>
    api.post<{ ok: boolean }>('/admin', { action: 'resetPassword', userId, newPassword }),
}
