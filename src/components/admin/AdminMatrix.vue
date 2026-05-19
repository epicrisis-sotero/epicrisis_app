<script setup lang="ts">
import { ref, computed } from 'vue'
import { COMORBIDITIES } from '@/constants/criteria'
import type { AdminMatrixRow } from '@/services/admin.service'

const props = defineProps<{
  rows: AdminMatrixRow[]
}>()

// ── Tooltip ──────────────────────────────────────────────────────────────────
const hoverData = ref<{ text: string; label: string; x: number; y: number } | null>(null)

function handleMouseEnter(e: MouseEvent, text: string, label: string) {
  if (!text) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hoverData.value = { text, label, x: rect.left + rect.width / 2, y: rect.top }
}

function handleMouseLeave() {
  hoverData.value = null
}

function maskedId(id: number, patientId?: string | null) {
  return patientId
    ? `EPC-${String(id).padStart(5, '0')} (${patientId})`
    : `EPC-${String(id).padStart(5, '0')}`
}

// ── Stats computation ─────────────────────────────────────────────────────────
const annotatedCount = computed(
  () => props.rows.filter(r => Object.keys(r.annotations).length > 0).length
)

interface CriterionStat {
  name: string
  label: string
  icd10: string
  present: number
  absent: number
  notEvaluated: number
  total: number
  prevalence: number
  llmAgreements: number
  llmComparisons: number
  llmAccuracy: number
}

const criterionStats = computed((): CriterionStat[] => {
  const stats = COMORBIDITIES.map(criterion => {
    let present = 0
    let absent = 0
    let notEvaluated = 0
    let llmAgreements = 0
    let llmComparisons = 0

    for (const row of props.rows) {
      const annotation = row.annotations[criterion.name]
      if (!annotation) {
        notEvaluated++
        continue
      }
      if (annotation.isPresent === true) present++
      else if (annotation.isPresent === false) absent++
      else notEvaluated++

      const llmPred = row.llmPredictions?.[criterion.name]
      if (
        llmPred?.valor !== null &&
        llmPred?.valor !== undefined &&
        annotation.isPresent !== null &&
        annotation.isPresent !== undefined
      ) {
        llmComparisons++
        if (llmPred.valor === annotation.isPresent) llmAgreements++
      }
    }

    const total = present + absent
    return {
      name: criterion.name,
      label: criterion.label,
      icd10: criterion.icd10Hint ?? criterion.name,
      present,
      absent,
      notEvaluated,
      total,
      prevalence: total > 0 ? (present / total) * 100 : 0,
      llmAgreements,
      llmComparisons,
      llmAccuracy: llmComparisons > 0 ? (llmAgreements / llmComparisons) * 100 : 0,
    }
  })

  return stats.sort((a, b) => b.prevalence - a.prevalence)
})

function llmAccuracyColor(accuracy: number, comparisons: number): string {
  if (comparisons === 0) return 'text-gray-300'
  if (accuracy >= 80) return 'text-green-600'
  if (accuracy >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

function llmAccuracyBg(accuracy: number, comparisons: number): string {
  if (comparisons === 0) return 'bg-gray-100 text-gray-400'
  if (accuracy >= 80) return 'bg-green-50 text-green-700'
  if (accuracy >= 60) return 'bg-yellow-50 text-yellow-700'
  return 'bg-red-50 text-red-600'
}
</script>

<template>
  <div class="flex flex-col gap-6">

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- PANEL DE ESTADÍSTICAS — siempre visible (mobile + desktop)             -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h3 class="text-sm font-bold text-gray-800">Resumen de Hallazgos</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ annotatedCount }} epicrisis anotadas · {{ rows.length }} total
          </p>
        </div>
        <div class="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block"></span>Presente
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block"></span>Ausente
          </span>
          <span class="hidden sm:flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block"></span>Sin evaluar
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="annotatedCount === 0" class="py-16 text-center text-sm text-gray-400">
        Sin anotaciones registradas aún.
      </div>

      <!-- Stats table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-2.5 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Criterio</th>
              <th class="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-48">Prevalencia</th>
              <th class="text-right px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-12 hidden sm:table-cell">Pres.</th>
              <th class="text-right px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-12 hidden sm:table-cell">Aus.</th>
              <th class="text-center px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-28">LLM Acuerdo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="stat in criterionStats"
              :key="stat.name"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Criterion -->
              <td class="px-5 py-2.5">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-600 flex-shrink-0">
                    {{ stat.icd10 }}
                  </span>
                  <span class="text-gray-700 font-medium leading-tight">{{ stat.label }}</span>
                </div>
              </td>

              <!-- Prevalence bar -->
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[80px]">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="stat.prevalence > 50 ? 'bg-green-400' : stat.prevalence > 25 ? 'bg-yellow-400' : 'bg-red-300'"
                      :style="{ width: stat.total > 0 ? stat.prevalence + '%' : '0%' }"
                    />
                  </div>
                  <span class="text-gray-500 font-semibold w-9 text-right tabular-nums">
                    {{ stat.total > 0 ? Math.round(stat.prevalence) + '%' : '—' }}
                  </span>
                </div>
              </td>

              <!-- Present count -->
              <td class="px-3 py-2.5 text-right text-green-600 font-semibold tabular-nums hidden sm:table-cell">
                {{ stat.present }}
              </td>

              <!-- Absent count -->
              <td class="px-3 py-2.5 text-right text-red-400 font-semibold tabular-nums hidden sm:table-cell">
                {{ stat.absent }}
              </td>

              <!-- LLM agreement -->
              <td class="px-4 py-2.5 text-center">
                <span
                  v-if="stat.llmComparisons > 0"
                  :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', llmAccuracyBg(stat.llmAccuracy, stat.llmComparisons)]"
                >
                  {{ Math.round(stat.llmAccuracy) }}%
                  <span :class="['w-1.5 h-1.5 rounded-full inline-block', llmAccuracyColor(stat.llmAccuracy, stat.llmComparisons).replace('text-', 'bg-')]" />
                </span>
                <span v-else class="text-gray-300 text-[10px] font-medium">Sin datos</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- LLM accuracy legend -->
      <div
        v-if="annotatedCount > 0"
        class="px-5 py-2.5 border-t border-gray-100 flex flex-wrap gap-4 text-[10px] text-gray-400 font-medium"
      >
        <span>LLM Acuerdo:</span>
        <span class="text-green-600">● ≥80% Alto</span>
        <span class="text-yellow-600">● 60–79% Medio</span>
        <span class="text-red-500">● &lt;60% Bajo</span>
        <span class="ml-auto hidden sm:block text-gray-300">Prevalencia = casos presentes / casos evaluados</span>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- TABLA MATRICIAL — solo desktop (md+)                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="hidden md:flex flex-col bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden" style="max-height: calc(100vh - 26rem)">
      <div class="flex-shrink-0 px-5 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tabla detallada</span>
        <span class="text-[10px] text-gray-300">· scroll horizontal disponible</span>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar bg-gray-50/30">
        <table class="w-full text-[11px] border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50">
              <!-- Sticky patient ID header -->
              <th class="sticky left-0 top-0 z-40 bg-gray-100 border-b border-r border-gray-200 px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest min-w-[140px] text-xs">
                ID Paciente
              </th>
              <!-- ICD-10 column headers -->
              <th
                v-for="c in COMORBIDITIES"
                :key="c.name"
                :title="c.label"
                class="sticky top-0 z-30 bg-gray-50 border-b border-r border-gray-200 px-2 py-3 text-center font-bold text-gray-500 uppercase tracking-wider min-w-[60px] cursor-help"
              >
                <span class="font-mono text-[10px]">{{ c.icd10Hint ?? c.name }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="rows.length === 0">
              <td :colspan="COMORBIDITIES.length + 1" class="px-4 py-24 text-center bg-white text-sm text-gray-400">
                Sin datos de hallazgos registrados.
              </td>
            </tr>

            <tr
              v-for="row in rows"
              :key="row.id"
              class="hover:bg-brand-50/30 group transition-colors"
            >
              <!-- Sticky patient ID -->
              <td class="sticky left-0 z-20 bg-white group-hover:bg-brand-50/50 border-r border-gray-200 px-5 py-3 font-mono font-bold text-gray-700 transition-colors">
                <div class="flex flex-col">
                  <span class="text-brand-600 text-xs">{{ maskedId(row.id, row.patientId) }}</span>
                  <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[100px]" :title="row.assigneeEmail ?? 'Sin asignar'">
                    {{ row.assigneeEmail?.split('@')[0] ?? 'Sin asignar' }}
                  </span>
                </div>
              </td>

              <!-- Cells -->
              <td
                v-for="c in COMORBIDITIES"
                :key="c.name"
                class="border-r border-gray-100 p-0 relative"
              >
                <div
                  v-if="row.annotations[c.name]"
                  class="w-full h-10 flex items-center justify-center transition-all relative"
                  :class="[
                    row.annotations[c.name].isPresent === true  ? 'bg-green-50  text-green-700' :
                    row.annotations[c.name].isPresent === false ? 'bg-red-50    text-red-600'   :
                    'bg-gray-50 text-gray-400',
                    row.annotations[c.name].evidenceText ? 'cursor-help' : ''
                  ]"
                  @mouseenter="handleMouseEnter($event, row.annotations[c.name].evidenceText ?? '', c.label)"
                  @mouseleave="handleMouseLeave"
                >
                  <svg v-if="row.annotations[c.name].isPresent === true" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="row.annotations[c.name].isPresent === false" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span v-else class="text-[9px] font-bold opacity-40">NR</span>
                  <!-- Evidence dot -->
                  <div v-if="row.annotations[c.name].evidenceText" class="absolute top-1 right-1 w-1 h-1 rounded-full bg-current opacity-50" />
                </div>
                <div v-else class="w-full h-10 bg-gray-50/30 flex items-center justify-center">
                  <span class="text-[9px] text-gray-200 font-black">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table legend -->
      <div class="flex-shrink-0 bg-white border-t border-gray-200 px-5 py-2.5 flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-400">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-green-100 border border-green-200 rounded flex items-center justify-center text-green-600">
            <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" /></svg>
          </span>
          Presente
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-500">
            <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
          Ausente
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-gray-100 border border-gray-200 rounded text-center text-gray-400 text-[8px] leading-none pt-px">NR</span>
          No evaluado
        </div>
        <div class="flex items-center gap-1.5 ml-2 text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-50" />
          Punto = evidencia textual disponible
        </div>
        <span class="ml-auto text-brand-400 font-black normal-case tracking-normal">Hover sobre celda para ver evidencia</span>
      </div>
    </div>

  </div>

  <!-- Tooltip -->
  <Teleport to="body">
    <div
      v-if="hoverData && hoverData.text"
      :style="{ left: hoverData.x + 'px', top: hoverData.y + 'px' }"
      class="fixed -translate-x-1/2 -translate-y-full mb-3 z-[9999] w-72 p-4 bg-gray-900 text-white rounded-2xl shadow-2xl pointer-events-none"
    >
      <p class="text-[10px] font-black uppercase tracking-[0.15em] text-brand-400 mb-1.5 border-b border-white/10 pb-1.5">
        {{ hoverData.label }}
      </p>
      <p class="text-xs leading-relaxed italic text-gray-200">"{{ hoverData.text }}"</p>
      <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 mt-0" />
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
td.sticky, th.sticky { box-shadow: 1px 0 0 0 #e5e7eb; }
</style>
