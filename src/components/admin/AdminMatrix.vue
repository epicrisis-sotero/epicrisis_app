<script setup lang="ts">
import { ref, computed } from 'vue'
import { COMORBIDITIES } from '@/constants/criteria'
import { V3_LEAF_VARIABLES } from '@/constants/formSchema'
import type { AdminMatrixRow, MatrixAnnotatorEntry } from '@/services/admin.service'

const props = defineProps<{
  rows: AdminMatrixRow[]
}>()

// ── Tooltip ──────────────────────────────────────────────────────────────────
const hoverData = ref<{ content: string; label: string; x: number; y: number } | null>(null)

function handleMouseEnter(e: MouseEvent, annotators: MatrixAnnotatorEntry[], label: string) {
  if (!annotators?.length) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const lines = annotators.map(a => {
    const name = a.email?.split('@')[0] ?? `U${a.userId}`
    const val = a.isUnknown ? '?' : a.isPresent === true ? 'Sí' : a.isPresent === false ? 'No' : 'NR'
    return `${name}: ${val}${a.evidenceText ? ` — "${a.evidenceText.slice(0, 60)}${a.evidenceText.length > 60 ? '…' : ''}"` : ''}`
  })
  hoverData.value = { content: lines.join('\n'), label, x: rect.left + rect.width / 2, y: rect.top }
}

function handleMouseLeave() {
  hoverData.value = null
}

function maskedId(id: number, patientId?: string | null) {
  return patientId
    ? `EPC-${String(id).padStart(5, '0')} (${patientId})`
    : `EPC-${String(id).padStart(5, '0')}`
}

// ── Helpers de celda ─────────────────────────────────────────────────────────
type CellState = 'present' | 'absent' | 'conflict' | 'unknown' | 'nr'

function cellState(annotators: MatrixAnnotatorEntry[] | undefined): CellState {
  if (!annotators || annotators.length === 0) return 'nr'

  const decided = annotators.filter(a => !a.isUnknown && a.isPresent !== null)
  if (decided.length === 0) return annotators.some(a => a.isUnknown) ? 'unknown' : 'nr'

  if (decided.length === 1) return decided[0].isPresent === true ? 'present' : 'absent'

  // Múltiples anotadores con respuesta definitiva
  if (decided.every(a => a.isPresent === true))  return 'present'
  if (decided.every(a => a.isPresent === false)) return 'absent'
  return 'conflict'
}

function primaryEvidence(annotators: MatrixAnnotatorEntry[] | undefined): string {
  return annotators?.find(a => a.evidenceText)?.evidenceText ?? ''
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
  conflict: number
  notEvaluated: number
  total: number
  prevalence: number
  llmAgreements: number
  llmComparisons: number
  llmAccuracy: number
  diffEasy: number
  diffMedium: number
  diffHard: number
  diffTotal: number
}

const criterionStats = computed((): CriterionStat[] => {
  const stats = COMORBIDITIES.map(criterion => {
    let present = 0
    let absent = 0
    let conflict = 0
    let notEvaluated = 0
    let llmAgreements = 0
    let llmComparisons = 0
    let diffEasy = 0
    let diffMedium = 0
    let diffHard = 0

    for (const row of props.rows) {
      const annotators = row.annotations[criterion.name]
      const state = cellState(annotators)

      if (state === 'present')  present++
      else if (state === 'absent')   absent++
      else if (state === 'conflict') conflict++
      else                           notEvaluated++

      // Dificultad: contar de TODOS los anotadores
      if (annotators) {
        for (const a of annotators) {
          if (a.difficulty === 'easy')   diffEasy++
          else if (a.difficulty === 'medium') diffMedium++
          else if (a.difficulty === 'hard')   diffHard++
        }
      }

      // Acuerdo LLM: usar el primer anotador que tenga respuesta definitiva
      const primary = annotators?.find(a => !a.isUnknown && a.isPresent !== null)
      const llmPred = row.llmPredictions?.[criterion.name]
      if (llmPred?.valor !== null && llmPred?.valor !== undefined && primary) {
        llmComparisons++
        if (llmPred.valor === primary.isPresent) llmAgreements++
      }
    }

    const total = present + absent + conflict
    const diffTotal = diffEasy + diffMedium + diffHard
    return {
      name: criterion.name,
      label: criterion.label,
      icd10: criterion.icd10Hint ?? criterion.name,
      present,
      absent,
      conflict,
      notEvaluated,
      total,
      prevalence: total > 0 ? (present / total) * 100 : 0,
      llmAgreements,
      llmComparisons,
      llmAccuracy: llmComparisons > 0 ? (llmAgreements / llmComparisons) * 100 : 0,
      diffEasy,
      diffMedium,
      diffHard,
      diffTotal,
    }
  })

  return stats.sort((a, b) => b.prevalence - a.prevalence)
})

function llmAccuracyBg(accuracy: number, comparisons: number): string {
  if (comparisons === 0) return 'bg-gray-100 text-gray-400'
  if (accuracy >= 80) return 'bg-green-50 text-green-700'
  if (accuracy >= 60) return 'bg-yellow-50 text-yellow-700'
  return 'bg-red-50 text-red-600'
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ')
  return `"${str}"`
}

function downloadCSV() {
  const headers = [
    'Epicrisis ID',
    'Patient ID',
    'Anotador Email'
  ]
  
  for (const n of V3_LEAF_VARIABLES) {
    if (n.type === 'leaf') {
      headers.push(`${n.key}_valor`)
      const isDateCheck = n.key.includes('fecha') || n.key.includes('inicio') || n.key.includes('termino') || n.key.includes('realizacion')
      if (isDateCheck) {
        headers.push(`${n.key}_fecha`)
      }
      headers.push(`${n.key}_evidencia`)
      headers.push(`${n.key}_comentario`)
      headers.push(`${n.key}_sospecha`)
    } else {
      headers.push(n.key)
    }
  }
  
  const csvRows = [headers.join(',')]
  
  for (const row of props.rows) {
    const annotatorsMap = new Map<number, string | null>()
    for (const key of Object.keys(row.annotations)) {
      for (const entry of row.annotations[key]) {
        annotatorsMap.set(entry.userId, entry.email)
      }
    }
    
    if (annotatorsMap.size === 0) {
      continue
    }
    
    for (const [userId, email] of annotatorsMap.entries()) {
      const csvRow = [
        String(row.id),
        row.patientId ?? '',
        email ?? `Usuario ${userId}`
      ]
      
      for (const n of V3_LEAF_VARIABLES) {
        const annotatorEntry = row.annotations[n.key]?.find(a => a.userId === userId)
        if (annotatorEntry) {
          if (n.type === 'leaf') {
            const val = annotatorEntry.isUnknown 
              ? '?' 
              : annotatorEntry.isPresent === true 
                ? 'Sí' 
                : annotatorEntry.isPresent === false 
                  ? 'No' 
                  : ''
            csvRow.push(escapeCSV(val))
            
            const isDateCheck = n.key.includes('fecha') || n.key.includes('inicio') || n.key.includes('termino') || n.key.includes('realizacion')
            if (isDateCheck) {
              const dateVal = (annotatorEntry as any).evidenceMetadata?.value ?? ''
              csvRow.push(escapeCSV(dateVal))
            }
            
            csvRow.push(escapeCSV(annotatorEntry.evidenceText ?? ''))
            csvRow.push(escapeCSV(annotatorEntry.comments ?? ''))
            csvRow.push(escapeCSV((annotatorEntry as any).evidenceMetadata?.suspicion ?? ''))
          } else if (n.type === 'date' || n.type === 'text') {
            csvRow.push(escapeCSV(annotatorEntry.evidenceText ?? ''))
          } else if (n.type === 'select') {
            const selectVal = (annotatorEntry as any).evidenceMetadata?.value ?? ''
            csvRow.push(escapeCSV(selectVal))
          } else {
            csvRow.push('')
          }
        } else {
          if (n.type === 'leaf') {
            csvRow.push('')
            const isDateCheck = n.key.includes('fecha') || n.key.includes('inicio') || n.key.includes('termino') || n.key.includes('realizacion')
            if (isDateCheck) csvRow.push('')
            csvRow.push('')
            csvRow.push('')
            csvRow.push('')
          } else {
            csvRow.push('')
          }
        }
      }
      
      csvRows.push(csvRow.join(','))
    }
  }
  
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `anotaciones_consolidado_v3_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="flex flex-col gap-6">

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- PANEL DE ESTADÍSTICAS                                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div>
            <h3 class="text-sm font-bold text-gray-800">Resumen de Hallazgos</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ annotatedCount }} epicrisis anotadas · {{ rows.length }} total
            </p>
          </div>
          <button
            v-if="annotatedCount > 0"
            @click="downloadCSV"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
        <div class="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />Presente</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" />Ausente</span>
          <span class="hidden sm:flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-orange-300 inline-block" />Conflicto</span>
          <span class="hidden sm:flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />Sin evaluar</span>
        </div>
      </div>

      <div v-if="annotatedCount === 0" class="py-16 text-center text-sm text-gray-400">
        Sin anotaciones registradas aún.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-2.5 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Criterio</th>
              <th class="text-left px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-48">Prevalencia</th>
              <th class="text-right px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-12 hidden sm:table-cell">Pres.</th>
              <th class="text-right px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-12 hidden sm:table-cell">Aus.</th>
              <th class="text-right px-3 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-12 hidden sm:table-cell text-orange-500">Conf.</th>
              <th class="text-center px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-28">LLM Acuerdo</th>
              <th class="text-center px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider w-28">Dificultad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="stat in criterionStats"
              :key="stat.name"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-2.5">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-600 flex-shrink-0">
                    {{ stat.icd10 }}
                  </span>
                  <span class="text-gray-700 font-medium leading-tight">{{ stat.label }}</span>
                </div>
              </td>

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

              <td class="px-3 py-2.5 text-right text-green-600 font-semibold tabular-nums hidden sm:table-cell">{{ stat.present }}</td>
              <td class="px-3 py-2.5 text-right text-red-400 font-semibold tabular-nums hidden sm:table-cell">{{ stat.absent }}</td>
              <td class="px-3 py-2.5 text-right font-semibold tabular-nums hidden sm:table-cell" :class="stat.conflict > 0 ? 'text-orange-500' : 'text-gray-200'">
                {{ stat.conflict || '—' }}
              </td>

              <td class="px-4 py-2.5 text-center">
                <span
                  v-if="stat.llmComparisons > 0"
                  :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', llmAccuracyBg(stat.llmAccuracy, stat.llmComparisons)]"
                >
                  {{ Math.round(stat.llmAccuracy) }}%
                </span>
                <span v-else class="text-gray-300 text-[10px] font-medium">Sin datos</span>
              </td>

              <td class="px-4 py-2.5 text-center">
                <div v-if="stat.diffTotal > 0" class="flex items-center justify-center gap-1" :title="`Verde ${stat.diffEasy} · Amarillo ${stat.diffMedium} · Rojo ${stat.diffHard}`">
                  <span v-if="stat.diffEasy"   class="inline-flex items-center gap-0.5 text-[10px] text-green-700 font-semibold"><span class="w-2 h-2 rounded-full bg-green-400 inline-block" />{{ stat.diffEasy }}</span>
                  <span v-if="stat.diffMedium" class="inline-flex items-center gap-0.5 text-[10px] text-yellow-700 font-semibold"><span class="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{{ stat.diffMedium }}</span>
                  <span v-if="stat.diffHard"   class="inline-flex items-center gap-0.5 text-[10px] text-red-700 font-semibold"><span class="w-2 h-2 rounded-full bg-red-400 inline-block" />{{ stat.diffHard }}</span>
                </div>
                <span v-else class="text-gray-300 text-[10px] font-medium">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="annotatedCount > 0"
        class="px-5 py-2.5 border-t border-gray-100 flex flex-wrap gap-4 text-[10px] text-gray-400 font-medium"
      >
        <span>LLM Acuerdo:</span>
        <span class="text-green-600">● ≥80% Alto</span>
        <span class="text-yellow-600">● 60–79% Medio</span>
        <span class="text-red-500">● &lt;60% Bajo</span>
        <span class="ml-auto hidden sm:block text-gray-300">Conflicto = anotadores solapados en desacuerdo</span>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- TABLA MATRICIAL                                                          -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="hidden md:flex flex-col bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden" style="max-height: calc(100vh - 26rem)">
      <div class="flex-shrink-0 px-5 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tabla detallada</span>
        <span class="text-[10px] text-gray-300">· hover sobre celda para ver evidencia · naranja = conflicto entre anotadores</span>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar bg-gray-50/30">
        <table class="w-full text-[11px] border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50">
              <th class="sticky left-0 top-0 z-40 bg-gray-100 border-b border-r border-gray-200 px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest min-w-[140px] text-xs">
                ID Paciente
              </th>
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
                  class="w-full h-10 flex items-center justify-center transition-all relative cursor-default"
                  :class="{
                    'bg-green-50  text-green-700':  cellState(row.annotations[c.name]) === 'present',
                    'bg-red-50    text-red-600':    cellState(row.annotations[c.name]) === 'absent',
                    'bg-orange-50 text-orange-600': cellState(row.annotations[c.name]) === 'conflict',
                    'bg-gray-50   text-gray-400':   cellState(row.annotations[c.name]) === 'unknown',
                    'bg-gray-50/30':                cellState(row.annotations[c.name]) === 'nr',
                    'cursor-help': row.annotations[c.name]?.length > 0,
                  }"
                  @mouseenter="handleMouseEnter($event, row.annotations[c.name] ?? [], c.label)"
                  @mouseleave="handleMouseLeave"
                >
                  <!-- Icono según estado -->
                  <template v-if="cellState(row.annotations[c.name]) === 'present'">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </template>
                  <template v-else-if="cellState(row.annotations[c.name]) === 'absent'">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </template>
                  <template v-else-if="cellState(row.annotations[c.name]) === 'conflict'">
                    <span class="text-[10px] font-black">≠</span>
                  </template>
                  <template v-else-if="cellState(row.annotations[c.name]) === 'unknown'">
                    <span class="text-[9px] font-bold opacity-60">?</span>
                  </template>
                  <template v-else>
                    <span class="text-[9px] text-gray-200 font-black">—</span>
                  </template>

                  <!-- Badge: número de anotadores cuando hay más de 1 -->
                  <span
                    v-if="(row.annotations[c.name]?.length ?? 0) > 1"
                    class="absolute top-0.5 right-0.5 text-[8px] font-black leading-none opacity-50"
                  >{{ row.annotations[c.name].length }}</span>

                  <!-- Punto de evidencia -->
                  <div
                    v-if="primaryEvidence(row.annotations[c.name])"
                    class="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-current opacity-40"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex-shrink-0 bg-white border-t border-gray-200 px-5 py-2.5 flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-400">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-green-100 border border-green-200 rounded flex items-center justify-center text-green-600">
            <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" /></svg>
          </span>Presente
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-500">
            <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>Ausente
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 bg-orange-100 border border-orange-200 rounded text-center text-orange-500 text-[10px] leading-none flex items-center justify-center font-black">≠</span>
          Conflicto
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[8px] font-black text-gray-400">2</span>
          <span class="text-gray-300 normal-case font-normal tracking-normal">Badge = N° anotadores</span>
        </div>
        <span class="ml-auto text-brand-400 font-black normal-case tracking-normal">Hover sobre celda para ver todos los anotadores</span>
      </div>
    </div>

  </div>

  <!-- Tooltip multi-anotador -->
  <Teleport to="body">
    <div
      v-if="hoverData && hoverData.content"
      :style="{ left: hoverData.x + 'px', top: hoverData.y + 'px' }"
      class="fixed -translate-x-1/2 -translate-y-full mb-3 z-[9999] w-80 p-4 bg-gray-900 text-white rounded-2xl shadow-2xl pointer-events-none"
    >
      <p class="text-[10px] font-black uppercase tracking-[0.15em] text-brand-400 mb-1.5 border-b border-white/10 pb-1.5">
        {{ hoverData.label }}
      </p>
      <div class="space-y-1">
        <p
          v-for="(line, i) in hoverData.content.split('\n')"
          :key="i"
          class="text-xs leading-relaxed text-gray-200"
        >{{ line }}</p>
      </div>
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
