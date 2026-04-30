import { api } from './api'
import type { AuthUser } from '@/stores/auth'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ user: AuthUser }>('/auth', { email, password }),

  logout: () => api.delete<{ ok: boolean }>('/auth'),

  me: () => api.get<{ user: AuthUser }>('/auth'),

  acceptTerms: () => api.patch<{ user: AuthUser }>('/auth', {}),
}
