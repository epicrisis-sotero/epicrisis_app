import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export interface AuthUser {
  id: number
  email: string
  role: 'admin' | 'annotator'
  termsAcceptedAt: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasAcceptedTerms = computed(() => !!user.value?.termsAcceptedAt)

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const data = await authService.login(email, password)
      user.value = data.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authService.logout()
    user.value = null
  }

  async function fetchCurrentUser() {
    try {
      const data = await authService.me()
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  async function acceptTerms() {
    const data = await authService.acceptTerms()
    user.value = data.user
  }

  return { user, loading, isAuthenticated, isAdmin, hasAcceptedTerms, login, logout, fetchCurrentUser, acceptTerms }
})
