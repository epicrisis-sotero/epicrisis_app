<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEpicrisisStore } from '@/stores/epicrisis'
import { useAuthStore } from '@/stores/auth'
import { useAnnotationStore } from '@/stores/annotation'
import { annotationService } from '@/services/annotation.service'
import { useTextSelection } from '@/composables/useTextSelection'
import { useAntiScreenCapture } from '@/composables/useAntiScreenCapture'
import { useAnnotationTimer } from '@/composables/useAnnotationTimer'
import { COMORBIDITIES } from '@/constants/criteria'
import { FOCOS, ORGANOS, normalizeSearch } from '@/constants/clinicalItems'
import SectionedViewer from '@/components/annotation/SectionedViewer.vue'
import PdfViewer from '@/components/annotation/PdfViewer.vue'
import CriterionRow from '@/components/annotation/CriterionRow.vue'
import ClinicalDataPanel from '@/components/annotation/ClinicalDataPanel.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'

const route = useRoute()
const router = useRouter()
const epicrisisStore = useEpicrisisStore()
const auth = useAuthStore()
const annotationStore = useAnnotationStore()

const epicrisisId = Number(route.params.id)
const epicrisisIdRef = computed(() => epicrisisId)
const timer = useAnnotationTimer(epicrisisIdRef)

// Split pane
const leftWidthPct = ref(55)
const isDragging = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const textPanelRef = ref<HTMLDivElement | null>(null)
const pdfViewerRef = ref<InstanceType<typeof PdfViewer> | null>(null)

// Proxy ref so useTextSelection sees the PDF viewer's container element
const pdfContainerProxy = {
  get value() { return pdfViewerRef.value?.containerRef ?? null }
}

// Composables
const { hasSelection, captureAndReturn } = useTextSelection(textPanelRef, pdfContainerProxy)
const { isObscured } = useAntiScreenCapture(textPanelRef)

// UI state
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')
const lockError = ref('')
const isLockedByOthers = ref(false) // kept for isReadOnly compat — always false now

// Auto-save cada 2 minutos
const lastAutoSaved = ref<Date | null>(null)
const lastAutoSavedLabel = computed(() => {
  if (!lastAutoSaved.value) return ''
  return lastAutoSaved.value.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
})
let autoSaveInterval: ReturnType<typeof setInterval> | null = null

async function runAutoSave() {
  if (isReadOnly.value || annotationStore.saving || annotationStore.submitting) return
  try {
    await annotationStore.saveProgress()
    lastAutoSaved.value = new Date()
  } catch {
    // fallo silencioso — el usuario puede guardar manualmente si lo necesita
  }
}

// ── Búsqueda Opción 1: filtro global del panel derecho ──
const search1Query = ref('')
const showSearch1 = ref(false)
const search1InputRef = ref<HTMLInputElement | null>(null)
function toggleSearch1() {
  showSearch1.value = !showSearch1.value
  if (!showSearch1.value) {
    search1Query.value = ''
  } else {
    nextTick(() => search1InputRef.value?.focus())
  }
}
const search1Matches = computed(() => {
  const q = normalizeSearch(search1Query.value.trim())
  if (!q) return null
  return new Set(COMORBIDITIES.filter(c => normalizeSearch(c.label).includes(q)).map(c => c.name))
})
const search1TotalCount = computed(() => {
  const q = normalizeSearch(search1Query.value.trim())
  if (!q) return null
  const criteriaCount = search1Matches.value?.size ?? 0
  // Si el nombre de sección coincide, se muestran TODOS los ítems de esa sección
  const focoCount = normalizeSearch('Infecciones por Foco').includes(q)
    ? FOCOS.length
    : FOCOS.filter(f => normalizeSearch(f.label).includes(q)).length
  const organoCount = normalizeSearch('Falla Orgánica').includes(q)
    ? ORGANOS.length
    : ORGANOS.filter(o => normalizeSearch(o.label).includes(q)).length
  return criteriaCount + focoCount + organoCount
})
const showCirugiasSection = computed(() => {
  const q = normalizeSearch(search1Query.value.trim())
  if (!q) return true
  return normalizeSearch('Cirugías previas').includes(q) || normalizeSearch('Fármacos habituales').includes(q)
})
const showAntecedentesCard = computed(() => {
  const q = normalizeSearch(search1Query.value.trim())
  if (!q) return true
  return (search1Matches.value !== null && search1Matches.value.size > 0) || showCirugiasSection.value
})

// ── Búsqueda Opción 2: command palette flotante (agrupada) ──
interface PaletteItem {
  kind: 'criterion' | 'foco' | 'organo'
  globalIdx: number
  name: string
  label: string
  icd10Hint?: string
}
interface PaletteGroup {
  label: string
  items: PaletteItem[]
}

const showPalette = ref(false)
const paletteQuery = ref('')
const paletteActiveIdx = ref(0)
const paletteInputRef = ref<HTMLInputElement | null>(null)

const paletteGroups = computed((): PaletteGroup[] => {
  const q = normalizeSearch(paletteQuery.value.trim())
  const matchCriteria = COMORBIDITIES.filter(c => !q || normalizeSearch(c.label).includes(q))
  const matchFocos    = FOCOS.filter(f    => !q || normalizeSearch(f.label).includes(q))
  const matchOrganos  = ORGANOS.filter(o  => !q || normalizeSearch(o.label).includes(q))
  let idx = 0
  const groups: PaletteGroup[] = []
  if (matchCriteria.length) groups.push({ label: 'Antecedentes',       items: matchCriteria.map(c => ({ kind: 'criterion' as const, globalIdx: idx++, name: c.name,       label: c.label, icd10Hint: c.icd10Hint })) })
  if (matchFocos.length)    groups.push({ label: 'Infecciones por Foco', items: matchFocos.map(f  => ({ kind: 'foco'      as const, globalIdx: idx++, name: String(f.key), label: f.label })) })
  if (matchOrganos.length)  groups.push({ label: 'Falla Orgánica',      items: matchOrganos.map(o => ({ kind: 'organo'    as const, globalIdx: idx++, name: String(o.key), label: o.label })) })
  return groups
})
const paletteAllItems   = computed(() => paletteGroups.value.flatMap(g => g.items))
const paletteTotalCount = computed(() => paletteAllItems.value.length)

function getPaletteItemState(item: PaletteItem): string {
  if (item.kind === 'criterion') {
    const s = annotationStore.criteria.find(c => c.criterionName === item.name)
    if (s?.isPresent === true) return 'Sí'
    if (s?.isPresent === false) return 'No'
    return '—'
  }
  const val = annotationStore.clinicalData[item.name as keyof typeof annotationStore.clinicalData]
  if (val === true) return 'Sí'
  if (val === false) return 'No'
  return '—'
}

watch(showPalette, (v) => {
  if (v) { paletteQuery.value = ''; paletteActiveIdx.value = 0; nextTick(() => paletteInputRef.value?.focus()) }
})
watch(paletteQuery, () => { paletteActiveIdx.value = 0 })

function selectPaletteItem(item: PaletteItem) {
  showPalette.value = false
  if (item.kind === 'criterion') {
    annotationStore.setActive(item.name)
    nextTick(() => {
      document.querySelector(`[data-criterion="${item.name}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  } else {
    const section = item.kind === 'foco' ? 'infecciones' : 'falla'
    nextTick(() => {
      document.querySelector(`[data-clinical-section="${section}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}
function paletteKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { showPalette.value = false; return }
  if (e.key === 'ArrowDown') { paletteActiveIdx.value = Math.min(paletteActiveIdx.value + 1, paletteAllItems.value.length - 1); e.preventDefault() }
  if (e.key === 'ArrowUp') { paletteActiveIdx.value = Math.max(paletteActiveIdx.value - 1, 0); e.preventDefault() }
  if (e.key === 'Enter' && paletteAllItems.value[paletteActiveIdx.value]) {
    selectPaletteItem(paletteAllItems.value[paletteActiveIdx.value])
  }
}

// Date format helpers
function toISO(dateStr: string) {
  if (!dateStr || !dateStr.includes('/')) return dateStr
  const [d, m, y] = dateStr.split('/')
  if (!d || !m || !y) return dateStr
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}
function fromISO(isoStr: string) {
  if (!isoStr || !isoStr.includes('-')) return isoStr
  const [y, m, d] = isoStr.split('-')
  return `${d}/${m}/${y}`
}

const fechaIngresoHospISO = computed({
  get: () => toISO(annotationStore.fechaIngresoHosp),
  set: (val) => { annotationStore.fechaIngresoHosp = fromISO(val) }
})
const fechaEgresoHospISO = computed({
  get: () => toISO(annotationStore.fechaEgresoHosp),
  set: (val) => { annotationStore.fechaEgresoHosp = fromISO(val) }
})
const fechaIngresoUciISO = computed({
  get: () => toISO(annotationStore.fechaIngresoUci),
  set: (val) => { annotationStore.fechaIngresoUci = fromISO(val) }
})
const fechaEgresoUciISO = computed({
  get: () => toISO(annotationStore.fechaEgresoUci),
  set: (val) => { annotationStore.fechaEgresoUci = fromISO(val) }
})

const isReadOnly = computed(() => {
  return isLockedByOthers.value
})


// Left panel tab — PDF primero si está disponible, si no texto
const docTab = ref<'text' | 'pdf'>('pdf')
watch(() => epicrisisStore.current?.pdfPath, (pdfPath) => {
  if (epicrisisStore.current && !pdfPath) docTab.value = 'text'
}, { immediate: true })

// Mobile responsiveness
const activeMobilePanel = ref<'doc' | 'form'>('doc')
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 1024)
const leftPanelStyle = computed(() =>
  isMobile.value ? {} : { width: leftWidthPct.value + '%' }
)
const rightPanelStyle = computed(() =>
  isMobile.value ? {} : { width: (100 - leftWidthPct.value) + '%' }
)
function updateWindowWidth() { windowWidth.value = window.innerWidth }

// Search within document (text + PDF)
const searchQuery = ref('')
const activeMatchIndex = ref(0)

const textMatchCount = computed(() => {
  const q = searchQuery.value.trim()
  if (q.length < 2 || !epicrisisStore.current) return 0
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')
  const fullText = (epicrisisStore.current.sections ?? []).map((s) => s.content).join('\n')
  return (fullText.match(re) ?? []).length
})

const searchMatchCount = computed(() =>
  docTab.value === 'pdf'
    ? (pdfViewerRef.value?.pdfMatchCount ?? 0)
    : textMatchCount.value
)

async function scrollToActiveMatch() {
  if (docTab.value === 'pdf') {
    pdfViewerRef.value?.scrollToPdfMatch(activeMatchIndex.value)
    return
  }
  await nextTick()
  textPanelRef.value
    ?.querySelector(`[data-match="${activeMatchIndex.value}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
function nextMatch() {
  if (!searchMatchCount.value) return
  activeMatchIndex.value = (activeMatchIndex.value + 1) % searchMatchCount.value
  scrollToActiveMatch()
}
function prevMatch() {
  if (!searchMatchCount.value) return
  activeMatchIndex.value = (activeMatchIndex.value - 1 + searchMatchCount.value) % searchMatchCount.value
  scrollToActiveMatch()
}
watch(searchQuery, () => {
  activeMatchIndex.value = 0
  nextTick(scrollToActiveMatch)
})
watch(docTab, () => { activeMatchIndex.value = 0 })

// Drag-to-resize split pane
function startDrag(e: MouseEvent) {
  if (!containerRef.value) return
  isDragging.value = true
  const rect = containerRef.value.getBoundingClientRect()

  function onMove(ev: MouseEvent) {
    const pct = ((ev.clientX - rect.left) / rect.width) * 100
    leftWidthPct.value = Math.min(75, Math.max(30, pct))
  }
  function stopDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', stopDrag)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// Capture selected text into active criterion
function captureEvidence() {
  const text = captureAndReturn()
  if (!text) {
    errorMessage.value = 'Selecciona texto en el documento primero.'
    return
  }
  if (!annotationStore.activeCriterionName && !annotationStore.activeClinicalField) {
    errorMessage.value = 'Haz clic en un criterio o campo clínico para activarlo.'
    return
  }
  annotationStore.injectEvidenceToActive(text)
  errorMessage.value = ''
}

async function handleSaveProgress() {
  try {
    await annotationStore.saveProgress()
    timer.pause()
  } catch {
    errorMessage.value = 'Error al guardar. Intenta nuevamente.'
  }
}

async function handleSubmitFinal() {
  try {
    const status = await annotationStore.submitFinal()
    epicrisisStore.updateStatus(epicrisisId, status as 'reviewed')
    timer.stop()
    showConfirmModal.value = false
    showSuccessModal.value = true
  } catch (e) {
    showConfirmModal.value = false
    errorMessage.value = e instanceof Error ? e.message : 'Error al enviar la anotación.'
  }
}

function goToDashboard() {
  annotationStore.reset()
  const name = auth.isAdmin ? 'admin' : 'dashboard'
  router.push({ name })
}

onMounted(async () => {
  window.addEventListener('resize', updateWindowWidth)
  // Inicializar store inmediatamente con placeholders (15 criterios)
  // Esto evita que la pantalla se vea vacía si falla la red
  annotationStore.initForEpicrisis(epicrisisId, null)

  // Cargar datos de la epicrisis
  try {
    await epicrisisStore.fetchOne(epicrisisId)
    const llmPredictions = epicrisisStore.current?.llmPredictions ?? null

    // Re-inicializar con predicciones y fechas auto-extraídas
    annotationStore.initForEpicrisis(epicrisisId, llmPredictions, epicrisisStore.current)

    // Cargar anotaciones guardadas
    const { annotations } = await annotationService.getForEpicrisis(epicrisisId)
    if (annotations.length > 0) {
      annotationStore.loadFromServer(annotations, llmPredictions)
    }
  } catch (e) {
    console.error('Error loading epicrisis:', e)
    errorMessage.value = 'No se pudo cargar el documento. Verifica tu conexión.'
  }

  if (!isLockedByOthers.value) timer.start()

  autoSaveInterval = setInterval(runAutoSave, 2 * 60 * 1000)

  if (COMORBIDITIES.length > 0) {
    annotationStore.setActive(COMORBIDITIES[0].name)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  annotationStore.reset()
})
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
    <!-- Top bar -->
    <div class="flex-shrink-0 flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-10">
      <button
        class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-all border border-transparent hover:border-gray-200 flex-shrink-0"
        @click="goToDashboard"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="hidden sm:inline">Volver</span>
      </button>

      <div class="flex items-center gap-2 min-w-0">
        <span class="font-mono text-xs sm:text-sm font-semibold text-gray-700 truncate max-w-[90px] sm:max-w-none">
          EPC-{{ String(epicrisisId).padStart(5, '0') }}
          <template v-if="epicrisisStore.current?.patientId">
            ({{ epicrisisStore.current.patientId }})
          </template>
        </span>
        <span
          v-if="epicrisisStore.current"
          :class="[
            'px-2 py-0.5 rounded-full text-xs font-medium',
            epicrisisStore.current.status === 'reviewed' ? 'bg-green-100 text-green-800'
            : epicrisisStore.current.status === 'in_review' ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800',
          ]"
        >
          {{
            epicrisisStore.current.status === 'reviewed' ? 'Revisada'
            : epicrisisStore.current.status === 'in_review' ? 'En Revisión'
            : 'Pendiente'
          }}
        </span>
      </div>

      <div class="flex-1" />

      <!-- Completion counter -->
      <span class="text-xs text-gray-400 hidden sm:block">
        {{ annotationStore.totalProgress.completed }}/{{ annotationStore.totalProgress.total }} ítems completados
      </span>

      <!-- Timer (admin only) -->
      <div
        v-if="auth.isAdmin"
        class="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0"
        :title="timer.isRunning ? 'Cronómetro en curso' : 'Cronómetro pausado'"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="timer.isRunning ? 'bg-green-400 animate-pulse' : 'bg-amber-400'"
        />
        <span class="font-mono text-xs font-semibold" :class="timer.isRunning ? 'text-green-700' : 'text-amber-600'">
          {{ timer.formatted }}
        </span>
      </div>

      <!-- Capture button (pulses when text is selected) -->
      <button
        :title="hasSelection ? 'Capturar texto seleccionado como evidencia' : 'Selecciona texto en el documento primero'"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
          hasSelection && !isReadOnly
            ? 'bg-amber-400 border-amber-500 text-amber-900 hover:bg-amber-500 shadow-sm animate-pulse'
            : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed',
        ]"
        :disabled="!hasSelection || isReadOnly"
        @click="captureEvidence"
      >
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="hidden sm:inline">Capturar evidencia</span>
      </button>

      <span
        v-if="lastAutoSavedLabel && !isReadOnly"
        class="hidden sm:block text-[10px] text-gray-300 whitespace-nowrap"
        title="Guardado automáticamente"
      >
        ✓ {{ lastAutoSavedLabel }}
      </span>

      <BaseButton
        v-if="!isReadOnly"
        size="sm"
        variant="secondary"
        :loading="annotationStore.saving"
        @click="handleSaveProgress"
      >
        <span class="hidden sm:inline">Guardar borrador</span>
        <span class="sm:hidden">Guardar</span>
      </BaseButton>

      <BaseButton
        v-if="!isReadOnly"
        size="sm"
        :disabled="!annotationStore.isComplete"
        :title="annotationStore.isComplete ? '' : 'Debes completar todos los campos obligatorios antes de enviar'"
        @click="showConfirmModal = true"
      >
        <span class="hidden sm:inline">Enviar anotación</span>
        <span class="sm:hidden">Enviar</span>
      </BaseButton>

      <div
        v-if="isReadOnly"
        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
      >
        Bloqueado (Solo Lectura)
      </div>
    </div>

    <!-- Lock banner -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="lockError"
        class="flex-shrink-0 flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-700 font-medium"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        {{ lockError }}
      </div>
    </Transition>

    <!-- Error banner -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="errorMessage"
        class="flex-shrink-0 flex items-center gap-2 bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
        <button class="ml-auto text-red-400 hover:text-red-600" @click="errorMessage = ''">✕</button>
      </div>
    </Transition>

    <!-- Loader -->
    <BaseLoader v-if="epicrisisStore.loading" message="Cargando epicrisis…" />

    <!-- Split pane -->
    <template v-else-if="epicrisisStore.current">

    <!-- Mobile panel tabs -->
    <div class="flex lg:hidden flex-shrink-0 border-b border-gray-200 bg-white">
      <button
        class="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
        :class="activeMobilePanel === 'doc'
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="activeMobilePanel = 'doc'"
      >
        Documento
      </button>
      <button
        class="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
        :class="activeMobilePanel === 'form'
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="activeMobilePanel = 'form'"
      >
        Anotación · {{ annotationStore.totalProgress.percentage }}%
      </button>
    </div>

    <div
      ref="containerRef"
      class="flex flex-1 min-h-0 overflow-hidden"
      :class="{ 'select-none': isDragging }"
    >
      <!-- ===== LEFT PANEL: Epicrisis document ===== -->
      <div
        :style="leftPanelStyle"
        class="flex-col min-h-0 overflow-hidden border-r border-gray-200"
        :class="[!isMobile || activeMobilePanel === 'doc' ? 'flex' : 'hidden', isMobile ? 'w-full' : '']"
      >
        <!-- Left panel header with tabs -->
        <div class="flex-shrink-0 flex items-center justify-between px-2 sm:px-4 py-1.5 bg-gray-50 border-b border-gray-200">
          <!-- Doc/PDF tab switcher — PDF primero -->
          <div class="flex items-center gap-0.5">
            <button
              v-if="epicrisisStore.current.pdfPath"
              class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
              :class="docTab === 'pdf'
                ? 'bg-white shadow-sm text-brand-600 border border-gray-200'
                : 'text-gray-400 hover:text-gray-600'"
              @click="docTab = 'pdf'"
            >PDF</button>
            <button
              class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
              :class="docTab === 'text'
                ? 'bg-white shadow-sm text-brand-600 border border-gray-200'
                : 'text-gray-400 hover:text-gray-600'"
              @click="docTab = 'text'"
            >Texto</button>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="isObscured" class="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Protección de Datos Activa
            </span>
            <span class="hidden sm:block text-[10px] text-gray-400">Selecciona texto → Capturar evidencia</span>
          </div>
        </div>

        <!-- Search bar (text + PDF) -->
        <div class="flex-shrink-0 flex items-center gap-2 px-2 sm:px-4 py-1.5 bg-white border-b border-gray-200">
          <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="docTab === 'pdf' ? 'Buscar en PDF…' : 'Buscar en documento…'"
            class="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-300 min-w-0"
          />
          <template v-if="searchQuery">
            <span v-if="searchMatchCount > 0" class="text-[10px] text-gray-400 font-medium whitespace-nowrap">
              {{ activeMatchIndex + 1 }} de {{ searchMatchCount }}
            </span>
            <span v-else class="text-[10px] text-red-400 font-medium whitespace-nowrap">
              Sin resultados
            </span>
            <div class="flex items-center gap-0.5">
              <button @click="prevMatch" class="p-1 hover:bg-gray-100 rounded text-gray-500 text-sm leading-none">‹</button>
              <button @click="nextMatch" class="p-1 hover:bg-gray-100 rounded text-gray-500 text-sm leading-none">›</button>
              <button @click="searchQuery = ''" class="p-1 hover:bg-gray-100 rounded text-gray-400 text-sm leading-none">✕</button>
            </div>
          </template>
        </div>

        <!-- PDF viewer: v-if monta solo si hay PDF, v-show alterna sin re-fetch -->
        <PdfViewer
          v-if="epicrisisStore.current.pdfPath"
          v-show="docTab === 'pdf'"
          ref="pdfViewerRef"
          :pdf-path="epicrisisStore.current.pdfPath"
          :search-query="docTab === 'pdf' ? searchQuery : ''"
          class="flex-1 min-h-0"
        />

        <!-- Paper sheet effect: fondo gris, "hoja" blanca centrada -->
        <div
          v-show="docTab === 'text'"
          ref="textPanelRef"
          class="flex-1 min-h-0 overflow-y-auto relative"
          style="background: #e8ecf0;"
        >
          <!-- User Watermark (Deterrent) -->
          <div class="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03] select-none flex flex-wrap gap-20 p-20 content-start">
            <span v-for="i in 20" :key="i" class="text-3xl font-black -rotate-45 whitespace-nowrap">
              {{ auth.user?.email }}
            </span>
          </div>

          <div
            class="max-w-[680px] mx-auto my-4 sm:my-8 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 bg-white shadow-md rounded relative z-0"
            v-memo="[epicrisisStore.current.sections, searchQuery, activeMatchIndex]"
          >
            <SectionedViewer
              :sections="epicrisisStore.current.sections ?? []"
              :highlight-query="searchQuery || undefined"
              :active-match="activeMatchIndex"
            />
          </div>
        </div>
      </div>

      <!-- Drag handle -->
      <div
        v-if="!isMobile"
        class="w-1 flex-shrink-0 bg-gray-200 hover:bg-brand-400 cursor-col-resize transition-colors active:bg-brand-500"
        :class="{ 'bg-brand-400': isDragging }"
        @mousedown="startDrag"
      />

      <!-- ===== RIGHT PANEL: Annotation form ===== -->
      <div
        :style="rightPanelStyle"
        class="flex-col min-h-0 overflow-hidden bg-gray-50"
        :class="[!isMobile || activeMobilePanel === 'form' ? 'flex' : 'hidden', isMobile ? 'w-full' : '']"
      >
        <!-- Panel header with progress -->
        <div class="flex-shrink-0 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Progreso de la Anotación
            </span>
            <div class="flex items-center gap-1.5">
              <!-- B1: Filtro global -->
              <button
                v-if="!isReadOnly"
                :class="[
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors border',
                  showSearch1
                    ? 'text-brand-600 bg-brand-50 border-brand-200'
                    : 'text-gray-400 hover:text-brand-500 hover:bg-gray-100 border-gray-200',
                ]"
                title="Filtrar todo el formulario"
                @click="toggleSearch1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 4a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
                </svg>
                Filtrar
              </button>
              <!-- B2: Buscador rápido -->
              <button
                v-if="!isReadOnly"
                :class="[
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors border',
                  showPalette
                    ? 'text-purple-600 bg-purple-50 border-purple-200'
                    : 'text-gray-400 hover:text-purple-500 hover:bg-gray-100 border-gray-200',
                ]"
                title="Buscar y navegar rápidamente"
                @click="showPalette = true"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
              <span class="text-[10px] text-gray-500 font-medium">
                {{ annotationStore.totalProgress.completed }}/{{ annotationStore.totalProgress.total }} ({{ annotationStore.totalProgress.percentage }}%)
              </span>
            </div>
          </div>
          <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-brand-500 rounded-full transition-all duration-500"
              :style="{ width: annotationStore.totalProgress.percentage + '%' }"
            />
          </div>
        </div>

        <!-- B1: barra de filtro global (sticky, fuera del scroll) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out overflow-hidden"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-14"
          leave-active-class="transition-all duration-150 ease-in overflow-hidden"
          leave-from-class="opacity-100 max-h-14"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="showSearch1" class="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-brand-50/60 border-b border-brand-100">
            <svg class="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="search1InputRef"
              v-model="search1Query"
              type="text"
              placeholder="Filtrar todo el formulario…"
              class="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0"
            />
            <span
              v-if="search1Query && search1TotalCount !== null"
              class="text-[10px] text-brand-600 font-semibold whitespace-nowrap"
            >
              {{ search1TotalCount }} resultado{{ search1TotalCount !== 1 ? 's' : '' }}
            </span>
            <span v-else-if="search1Query" class="text-[10px] text-red-400 font-semibold whitespace-nowrap">
              Sin resultados
            </span>
            <button
              v-if="search1Query"
              class="text-gray-400 hover:text-gray-600 flex-shrink-0"
              @click="search1Query = ''"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Transition>

        <!-- Scrollable area: fechas + criteria + comentario -->
        <div class="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1.5">

          <!-- ── Fechas Clínicas ── -->
          <div class="rounded-lg border border-sky-100 bg-white p-3 mb-1">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fechas Clínicas</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-100">Auto-extraídas · editables</span>
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <div>
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Ingreso Hospital
                </label>
                <input
                  v-model="fechaIngresoHospISO"
                  type="date"
                  :disabled="isReadOnly"
                  class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                  :class="annotationStore.activeMetadataField === 'fechaIngresoHosp' ? 'border-sky-400 ring-2 ring-sky-100 bg-sky-50/30' : 'border-gray-200'"
                  @focus="annotationStore.setActiveMetadata('fechaIngresoHosp')"
                />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Egreso Hospital
                </label>
                <input
                  v-model="fechaEgresoHospISO"
                  type="date"
                  :disabled="isReadOnly"
                  class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                  :class="annotationStore.activeMetadataField === 'fechaEgresoHosp' ? 'border-sky-400 ring-2 ring-sky-100 bg-sky-50/30' : 'border-gray-200'"
                  @focus="annotationStore.setActiveMetadata('fechaEgresoHosp')"
                />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Ingreso UCI
                </label>
                <input
                  v-model="fechaIngresoUciISO"
                  type="date"
                  :disabled="isReadOnly"
                  class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                  :class="annotationStore.activeMetadataField === 'fechaIngresoUci' ? 'border-sky-400 ring-2 ring-sky-100 bg-sky-50/30' : 'border-gray-200'"
                  @focus="annotationStore.setActiveMetadata('fechaIngresoUci')"
                />
              </div>
              <div>
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Egreso UCI
                </label>
                <input
                  v-model="fechaEgresoUciISO"
                  type="date"
                  :disabled="isReadOnly"
                  class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                  :class="annotationStore.activeMetadataField === 'fechaEgresoUci' ? 'border-sky-400 ring-2 ring-sky-100 bg-sky-50/30' : 'border-gray-200'"
                  @focus="annotationStore.setActiveMetadata('fechaEgresoUci')"
                />
              </div>
            </div>
          </div>

          <!-- ── ANTECEDENTES ── -->
          <div v-show="showAntecedentesCard" class="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <!-- Section header -->
            <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-1">Antecedentes</span>

              <!-- Clear button -->
              <button
                v-if="annotationStore.hasCriteriaSelection && !isReadOnly"
                class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-200"
                title="Limpiar todas las selecciones de antecedentes"
                @click="annotationStore.clearCriteria()"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            </div>

            <!-- Criteria list -->
            <div class="px-3 py-2 space-y-2">
              <CriterionRow
                v-for="criterion in COMORBIDITIES"
                v-show="!search1Matches || search1Matches.has(criterion.name)"
                :key="criterion.name"
                :data-criterion="criterion.name"
                :meta="criterion"
                :state="annotationStore.criteria.find(c => c.criterionName === criterion.name)!"
                :is-active="annotationStore.activeCriterionName === criterion.name"
                :is-read-only="isReadOnly"
              />
            </div>

            <!-- Cirugías previas + fármacos habituales -->
            <div v-show="showCirugiasSection" class="px-3 py-2.5 space-y-2.5 border-t border-gray-100">
              <!-- Cirugías previas -->
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-gray-700 font-medium">Cirugías previas</span>
                  <div class="flex gap-1 flex-shrink-0" @click.stop>
                    <button
                      :class="[
                        'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
                        annotationStore.clinicalData.cirugiaPrevias === true  ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      ]"
                      :disabled="isReadOnly"
                      @click="annotationStore.setClinical('cirugiaPrevias', annotationStore.clinicalData.cirugiaPrevias === true ? null : true)"
                    >Sí</button>
                    <button
                      :class="[
                        'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
                        annotationStore.clinicalData.cirugiaPrevias === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      ]"
                      :disabled="isReadOnly"
                      @click="annotationStore.setClinical('cirugiaPrevias', annotationStore.clinicalData.cirugiaPrevias === false ? null : false)"
                    >No</button>
                  </div>
                </div>
                <div v-if="annotationStore.clinicalData.cirugiaPrevias === true" class="mt-1.5">
                  <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Cantidad</label>
                  <input
                    :value="annotationStore.clinicalData.cirugiasPreviasCantidad ?? ''"
                    :readonly="isReadOnly"
                    type="number" min="0"
                    placeholder="0"
                    class="w-24 rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
                    @input="annotationStore.setClinical('cirugiasPreviasCantidad', ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value))"
                  />
                </div>
              </div>

              <!-- Fármacos habituales -->
              <div>
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Fármacos habituales</label>
                <textarea
                  :value="annotationStore.clinicalData.farmacos"
                  :readonly="isReadOnly"
                  rows="2"
                  placeholder="Lista de fármacos que consume el paciente habitualmente…"
                  class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
                  @input="annotationStore.setClinical('farmacos', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
            </div>
          </div>

          <!-- ── Datos Clínicos del Episodio ── -->
          <div class="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Datos Clínicos del Episodio</span>
            </div>
            <div class="px-3 py-2">
              <ClinicalDataPanel :is-read-only="isReadOnly" :search-query="search1Query" />
            </div>
          </div>

          <!-- ── Comentario Final ── -->
          <div class="rounded-lg border border-gray-200 bg-white p-3 mt-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Comentario Final
              <span class="normal-case font-normal ml-1 text-gray-300">— opcional</span>
            </label>
            <textarea
              v-model="annotationStore.comentarioFinal"
              :readonly="isReadOnly"
              rows="3"
              placeholder="Observaciones relevantes sobre este caso, hallazgos atípicos, dudas de interpretación…"
              class="w-full resize-none rounded border px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50 transition-all"
              :class="annotationStore.activeMetadataField === 'comentarioFinal' ? 'border-brand-400 ring-2 ring-brand-100 bg-brand-50/30' : 'border-gray-200'"
              @focus="annotationStore.setActiveMetadata('comentarioFinal')"
            />
          </div>

        </div>
      </div>
    </div>

    </template>

    <!-- Confirm modal -->
    <BaseModal title="Confirmar envío final" :open="showConfirmModal" @close="showConfirmModal = false">
      <p class="text-sm text-gray-600 mb-1">
        Estás a punto de enviar tu anotación de ground truth. Esta acción:
      </p>
      <ul class="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1">
        <li>Marcará la epicrisis como <strong>Revisada</strong></li>
        <li>No podrás modificar esta anotación posteriormente</li>
        <li>Los datos quedarán registrados para validar el modelo LLM</li>
      </ul>
      <div class="flex gap-2 justify-end">
        <BaseButton variant="secondary" @click="showConfirmModal = false">Cancelar</BaseButton>
        <BaseButton :loading="annotationStore.submitting" @click="handleSubmitFinal">
          Confirmar y enviar
        </BaseButton>
      </div>
    </BaseModal>

    <!-- ── Búsqueda Opción 2: Command Palette (agrupada) ── -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPalette"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
        style="background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);"
        @click.self="showPalette = false"
      >
        <div class="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <!-- Input -->
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="paletteInputRef"
              v-model="paletteQuery"
              type="text"
              placeholder="Buscar antecedente, infección, órgano…"
              class="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              @keydown="paletteKeydown"
            />
            <kbd class="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
          </div>

          <!-- Grouped results -->
          <div class="max-h-80 overflow-y-auto">
            <div v-if="paletteTotalCount === 0" class="px-4 py-6 text-sm text-gray-400 text-center">
              Sin resultados
            </div>
            <template v-for="group in paletteGroups" :key="group.label">
              <!-- Group header -->
              <div class="sticky top-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-y border-gray-100 z-10">
                {{ group.label }}
                <span class="ml-1 font-normal normal-case text-gray-300">{{ group.items.length }}</span>
              </div>
              <!-- Items -->
              <div
                v-for="item in group.items"
                :key="item.name"
                :class="[
                  'flex items-center justify-between gap-3 px-4 py-2 cursor-pointer transition-colors',
                  item.globalIdx === paletteActiveIdx ? 'bg-purple-50' : 'hover:bg-gray-50',
                ]"
                @click="selectPaletteItem(item)"
                @mouseenter="paletteActiveIdx = item.globalIdx"
              >
                <span class="text-sm font-medium text-gray-700 truncate flex-1">{{ item.label }}</span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span v-if="item.icd10Hint" class="text-[10px] font-mono text-gray-300">{{ item.icd10Hint }}</span>
                  <span
                    :class="[
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded min-w-[22px] text-center',
                      getPaletteItemState(item) === 'Sí' ? 'bg-green-100 text-green-700'
                      : getPaletteItemState(item) === 'No' ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-400',
                    ]"
                  >{{ getPaletteItemState(item) }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-[10px] text-gray-400">
            <span><kbd class="border border-gray-200 rounded px-1 font-mono">↑↓</kbd> navegar</span>
            <span><kbd class="border border-gray-200 rounded px-1 font-mono">↵</kbd> ir</span>
            <span class="ml-auto">{{ paletteTotalCount }} resultado{{ paletteTotalCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success modal -->
    <BaseModal title="Anotación registrada" :open="showSuccessModal" @close="goToDashboard">
      <div class="text-center py-4">
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Tu ground truth fue guardado exitosamente.<br/>¡Gracias por contribuir a la validación del modelo!
        </p>
        <BaseButton @click="goToDashboard">Volver al dashboard</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
