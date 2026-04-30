<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/services/api'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    if (auth.isAdmin) {
      router.push({ name: 'admin' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = e.message
    } else {
      error.value = 'Error de conexión. Intenta nuevamente.'
    }
  }
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Left Panel: Brand & Info (Desktop only) -->
    <div class="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-brand-600">
      <!-- Background Image with Overlay -->
      <img 
        src="@/assets/login-bg.png" 
        alt="Clinical Research" 
        class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
      />
      <div class="absolute inset-0 bg-gradient-to-tr from-brand-900/80 via-brand-800/40 to-transparent" />
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-between p-16 w-full">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-white font-bold tracking-tighter text-xl">EPICRISIS AI</span>
        </div>

        <div class="max-w-xl">
          <h2 class="text-5xl font-black text-white leading-tight mb-6">
            Estandarización inteligente de <span class="text-brand-300">datos clínicos.</span>
          </h2>
          <p class="text-brand-100 text-lg leading-relaxed font-medium">
            Plataforma avanzada para la validación de comorbilidades y generación de evidencia médica mediante inteligencia artificial.
          </p>
        </div>

      </div>
    </div>

    <!-- Right Panel: Login Form -->
    <div class="w-full lg:w-2/5 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative">
      <!-- Mobile Logo Header -->
      <div class="lg:hidden absolute top-12 left-8 right-8 flex flex-col items-center">
        <div class="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-100 mb-4">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-xl font-black text-slate-900 tracking-tight">EPICRISIS AI</h1>
      </div>

      <div class="max-w-md w-full mx-auto">
        <div class="mb-10">
          <h2 class="text-3xl font-black text-slate-900 mb-3">Bienvenido</h2>
          <p class="text-slate-500 font-medium">Ingresa tus credenciales institucionales para continuar.</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1" for="email">
              Correo Institucional
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="usuario@institucion.cl"
                class="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-4 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1" for="password">
              Contraseña
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-4 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div
            v-if="error"
            class="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs text-red-700 font-bold animate-shake"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </div>

          <BaseButton 
            type="submit" 
            class="w-full !rounded-2xl !py-4 font-black shadow-xl shadow-brand-200/50 !text-sm tracking-tight" 
            :loading="auth.loading"
          >
            ENTRAR AL PANEL
          </BaseButton>
        </form>

        <p class="text-center text-[10px] text-slate-400 mt-12 font-bold uppercase tracking-widest leading-relaxed">
          Plataforma restringida para fines de investigación clínica.
          <br/>
          <span class="text-slate-300 mt-1 block">iHealth — 2026</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Simplified style */
</style>
