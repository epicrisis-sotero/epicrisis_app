<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

const declarationNoAI = ref(false)
const declarationUnderstood = ref(false)
const declarationHonest = ref(false)
const loading = ref(false)
const scrolledToBottom = ref(false)

const canAccept = computed(() => declarationNoAI.value && declarationUnderstood.value && declarationHonest.value)

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    scrolledToBottom.value = true
  }
}

async function handleAccept() {
  loading.value = true
  try {
    await auth.acceptTerms()
    router.push(auth.isAdmin ? { name: 'admin' } : { name: 'dashboard' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden bg-slate-50">
    <!-- Left decorative panel -->
    <div class="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-brand-600 flex-col justify-between p-14">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-700 via-brand-600 to-brand-800" />

      <!-- Subtle grid overlay -->
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,.3) 39px, rgba(255,255,255,.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,.3) 39px, rgba(255,255,255,.3) 40px);"
      />

      <div class="relative z-10 flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span class="text-white font-black tracking-tight text-lg">EPICRISIS AI</span>
      </div>

      <div class="relative z-10 space-y-8">
        <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 class="text-3xl font-black text-white leading-tight mb-4">
            Integridad científica<br/>
            <span class="text-brand-200">ante todo.</span>
          </h2>
          <p class="text-brand-100/80 text-sm leading-relaxed">
            Este experimento compara el rendimiento de modelos de lenguaje con el juicio clínico humano. Tu participación honesta es el cimiento de resultados válidos.
          </p>
        </div>

        <div class="space-y-3">
          <div v-for="item in [
            'Confidencialidad de los datos clínicos',
            'Evaluación 100% independiente de IA',
            'Contribución al avance médico-científico',
          ]" :key="item" class="flex items-center gap-3">
            <div class="w-5 h-5 rounded-full bg-brand-400/20 border border-brand-300/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-3 h-3 text-brand-200" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-brand-100 text-xs font-medium">{{ item }}</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-brand-300/50 text-[10px] font-bold uppercase tracking-widest">
        iHealth — 2026
      </div>
    </div>

    <!-- Right panel: terms content -->
    <div class="w-full lg:w-3/5 flex flex-col overflow-hidden bg-white">
      <!-- Mobile header -->
      <div class="lg:hidden flex items-center gap-3 px-6 pt-8 pb-4 border-b border-slate-100">
        <div class="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span class="font-black text-slate-900 tracking-tight">EPICRISIS AI</span>
      </div>

      <!-- Content wrapper -->
      <div class="flex-1 flex flex-col overflow-hidden px-8 sm:px-12 lg:px-16 pt-10 pb-8">
        <div class="mb-6">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Paso requerido
          </span>
          <h1 class="text-2xl font-black text-slate-900 leading-tight mb-2">
            Términos y Condiciones
          </h1>
          <p class="text-slate-500 text-sm leading-relaxed">
            Lee el siguiente documento y confirma tus declaraciones para acceder a la plataforma.
          </p>
        </div>

        <!-- Scrollable terms document -->
        <div
          class="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-700 leading-relaxed space-y-5 scroll-smooth"
          @scroll="onScroll"
        >
          <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <p class="text-amber-800 text-xs font-semibold">
              Este documento constituye un acuerdo formal de participación en el protocolo de investigación clínica. La aceptación queda registrada con fecha, hora e identidad del participante.
            </p>
          </div>

          <div>
            <h3 class="font-black text-slate-900 text-base mb-2">1. Propósito del Experimento</h3>
            <p>
              Este estudio tiene por objetivo comparar la capacidad de modelos de lenguaje de gran escala (LLMs) con el juicio clínico humano en la identificación y codificación de comorbilidades a partir de epicrisis médicas. El <strong>ground truth</strong> del experimento corresponde exclusivamente a las evaluaciones realizadas por los revisores humanos registrados en esta plataforma.
            </p>
          </div>

          <div>
            <h3 class="font-black text-slate-900 text-base mb-2">2. Prohibición del Uso de Inteligencia Artificial</h3>
            <p class="mb-3">
              Queda <strong>estrictamente prohibido</strong> el uso de cualquier herramienta de inteligencia artificial generativa — incluyendo, sin limitarse a, ChatGPT, Claude, Gemini, Copilot, Perplexity u otros sistemas similares — para:
            </p>
            <ul class="list-none space-y-2 pl-2">
              <li v-for="item in [
                'Evaluar o clasificar criterios clínicos en las epicrisis asignadas',
                'Interpretar, resumir o analizar el contenido de los documentos clínicos',
                'Sugerir respuestas, justificaciones o evidencias textuales',
                'Auxiliar de cualquier manera en el proceso de anotación',
              ]" :key="item" class="flex items-start gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-black text-slate-900 text-base mb-2">3. Impacto del Incumplimiento</h3>
            <p>
              El uso de IA para realizar anotaciones comprometería gravemente la validez científica del experimento, ya que introduciría las mismas predicciones que se pretenden evaluar como referencia de comparación. Esto invalidaría la variable dependiente del estudio y contaminaría irremediablemente los resultados.
            </p>
            <p class="mt-3 font-semibold text-slate-800">
              Si por cualquier motivo utilizaste IA en una evaluación previa, debes comunicarlo de inmediato al equipo investigador antes de continuar.
            </p>
          </div>

          <div>
            <h3 class="font-black text-slate-900 text-base mb-2">4. Confidencialidad</h3>
            <p>
              Las epicrisis presentadas en esta plataforma contienen información clínica anonimizada. Está prohibida su reproducción, distribución o comunicación a terceros bajo cualquier formato.
            </p>
          </div>

          <div>
            <h3 class="font-black text-slate-900 text-base mb-2">5. Registro y Trazabilidad</h3>
            <p>
              Al aceptar estos términos, tu identidad, la fecha y hora de aceptación quedan registradas de forma permanente en la base de datos del experimento. Esta información podrá ser utilizada para auditorías de calidad del proceso de anotación.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p class="text-brand-800 text-xs font-semibold leading-relaxed">
              Al continuar, reconoces que has leído, comprendido y aceptas cumplir íntegramente con los presentes términos y condiciones durante toda tu participación en el experimento.
            </p>
          </div>
        </div>

        <!-- Scroll hint -->
        <div v-if="!scrolledToBottom" class="flex items-center gap-2 mt-2 mb-1">
          <svg class="w-3.5 h-3.5 text-slate-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
          <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Desplázate para leer el documento completo</span>
        </div>

        <!-- Declarations -->
        <div class="mt-5 space-y-3">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mis declaraciones</p>

          <label
            v-for="(decl, idx) in [
              { model: declarationNoAI, text: 'Declaro que no utilizaré ninguna herramienta de inteligencia artificial (ChatGPT, Claude, Gemini u otras) para evaluar las epicrisis asignadas.' },
              { model: declarationUnderstood, text: 'Entiendo que el uso de IA en las anotaciones perjudicaría gravemente el experimento, cuyo objetivo es comparar el rendimiento de los LLMs con el ground truth humano.' },
              { model: declarationHonest, text: 'Me comprometo a realizar evaluaciones independientes y honestas, basadas únicamente en mi criterio clínico.' },
            ]"
            :key="idx"
            :class="[
              'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none',
              idx === 0 ? (declarationNoAI ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-slate-300')
              : idx === 1 ? (declarationUnderstood ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-slate-300')
              : (declarationHonest ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-slate-300'),
            ]"
          >
            <input
              v-if="idx === 0"
              type="checkbox"
              v-model="declarationNoAI"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 flex-shrink-0 cursor-pointer accent-brand-600"
            />
            <input
              v-else-if="idx === 1"
              type="checkbox"
              v-model="declarationUnderstood"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 flex-shrink-0 cursor-pointer accent-brand-600"
            />
            <input
              v-else
              type="checkbox"
              v-model="declarationHonest"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 flex-shrink-0 cursor-pointer accent-brand-600"
            />
            <span class="text-xs text-slate-700 font-medium leading-relaxed">{{ decl.text }}</span>
          </label>
        </div>

        <!-- Actions -->
        <div class="mt-5 flex items-center gap-3">
          <BaseButton
            variant="secondary"
            class="!rounded-xl !py-3 !text-xs font-bold"
            @click="auth.logout().then(() => $router.push({ name: 'login' }))"
          >
            Salir
          </BaseButton>
          <BaseButton
            :disabled="!canAccept"
            :loading="loading"
            class="flex-1 !rounded-xl !py-3 font-black !text-sm shadow-lg shadow-brand-200/50 disabled:shadow-none transition-all"
            @click="handleAccept"
          >
            <svg v-if="canAccept" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Acepto los Términos y Condiciones
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
