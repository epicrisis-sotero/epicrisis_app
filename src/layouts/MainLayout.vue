<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="h-screen overflow-hidden bg-gray-50 flex flex-col font-sans text-slate-900">
    <!-- Top Navbar -->
    <header class="h-16 bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-50">
      <div class="h-full px-4 sm:px-6 flex items-center justify-between">
        <!-- Logo & Main Nav -->
        <div class="flex items-center gap-8">
          <RouterLink to="/dashboard" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/20 transition-transform group-hover:scale-105">
              <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-brand-600">Epicrisis AI</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Platform</span>
            </div>
          </RouterLink>

          <nav class="hidden md:flex items-center gap-1">
            <RouterLink
              v-if="!auth.isAdmin"
              to="/dashboard"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="route.name === 'dashboard' ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-100'"
            >
              Mis Tareas
            </RouterLink>
            <RouterLink
              v-if="auth.isAdmin"
              to="/admin"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="route.name === 'admin' ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-100'"
            >
              Administración
            </RouterLink>
          </nav>
        </div>

        <!-- User Actions -->
        <div class="flex items-center gap-4 border-l border-gray-100 pl-6 ml-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-xs font-bold text-slate-700">{{ auth.user?.email }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ auth.user?.role }}</span>
          </div>
          <button 
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-xs font-bold"
            @click="handleLogout"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <main class="flex-1 overflow-hidden flex flex-col">
      <slot />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>
