<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEpicrisisStore } from '@/stores/epicrisis'
import { useAuthStore } from '@/stores/auth'
import { useAnnotationStore } from '@/stores/annotation'
import { annotationService } from '@/services/annotation.service'
import { useTextSelection } from '@/composables/useTextSelection'
import { useAntiScreenCapture } from '@/composables/useAntiScreenCapture'
import { COMORBIDITIES } from '@/constants/criteria'
import MarkdownRenderer from '@/components/annotation/MarkdownRenderer.vue'
import CriterionRow from '@/components/annotation/CriterionRow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'

const route = useRoute()
const router = useRouter()
const epicrisisStore = useEpicrisisStore()
const auth = useAuthStore()
const annotationStore = useAnnotationStore()

const epicrisisId = Number(route.params.id)

// Split pane
const leftWidthPct = ref(55)
const isDragging = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const textPanelRef = ref<HTMLDivElement | null>(null)

// Composables
const { hasSelection, captureAndReturn } = useTextSelection(textPanelRef)
const { isObscured } = useAntiScreenCapture(textPanelRef)

// UI state
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')

const isReadOnly = computed(() => epicrisisStore.current?.status === 'reviewed')

const completedCount = computed(
  () => annotationStore.criteria.filter((c) => c.isPresent !== null).length
)

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
  if (!annotationStore.activeCriterionName) {
    errorMessage.value = 'Haz clic en un criterio del panel derecho para activarlo.'
    return
  }
  annotationStore.injectEvidenceToActive(text)
  errorMessage.value = ''
}

async function handleSaveProgress() {
  try {
    await annotationStore.saveProgress()
  } catch {
    errorMessage.value = 'Error al guardar. Intenta nuevamente.'
  }
}

async function handleSubmitFinal() {
  try {
    const status = await annotationStore.submitFinal()
    epicrisisStore.updateStatus(epicrisisId, status as 'reviewed')
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
  await epicrisisStore.fetchOne(epicrisisId)
  const llmPredictions = epicrisisStore.current?.llmPredictions ?? null

  annotationStore.initForEpicrisis(epicrisisId, llmPredictions)

  try {
    const { annotations } = await annotationService.getForEpicrisis(epicrisisId)
    if (annotations.length > 0) {
      annotationStore.loadFromServer(annotations, llmPredictions)
    }
  } catch {
    // use local draft
  }

  if (COMORBIDITIES.length > 0) {
    annotationStore.setActive(COMORBIDITIES[0].name)
  }
})

onUnmounted(() => {
  annotationStore.reset()
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-white">
    <!-- Top bar -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-10">
      <button
        class="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
        title="Volver al dashboard"
        @click="goToDashboard"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div class="flex items-center gap-2">
        <span class="font-mono text-sm font-semibold text-gray-700">
          EPC-{{ String(epicrisisId).padStart(5, '0') }}
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
        {{ completedCount }}/{{ annotationStore.criteria.length }} comorbilidades
      </span>

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
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Capturar evidencia
      </button>

      <BaseButton
        v-if="!isReadOnly"
        size="sm"
        variant="secondary"
        :loading="annotationStore.saving"
        @click="handleSaveProgress"
      >
        Guardar borrador
      </BaseButton>

      <BaseButton
        v-if="!isReadOnly"
        size="sm"
        :disabled="!annotationStore.isComplete"
        :title="annotationStore.isComplete ? '' : 'Debes marcar todas las comorbilidades antes de enviar'"
        @click="showConfirmModal = true"
      >
        Enviar anotación
      </BaseButton>

      <div
        v-if="isReadOnly"
        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200"
      >
        Solo lectura
      </div>
    </div>

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
    <div
      v-else-if="epicrisisStore.current"
      ref="containerRef"
      class="flex flex-1 overflow-hidden"
      :class="{ 'select-none': isDragging }"
    >
      <!-- ===== LEFT PANEL: Epicrisis document ===== -->
      <div
        :style="{ width: leftWidthPct + '%' }"
        class="flex flex-col overflow-hidden border-r border-gray-200"
      >
        <div class="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-200">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Documento clínico
          </span>
          <div class="flex items-center gap-2">
            <span v-if="isObscured" class="text-[10px] text-red-500 font-semibold">● Protegido</span>
            <span class="text-[10px] text-gray-400">Selecciona texto → Capturar evidencia</span>
          </div>
        </div>

        <!-- Paper sheet effect: fondo gris, "hoja" blanca centrada -->
        <div
          ref="textPanelRef"
          class="flex-1 overflow-y-auto"
          style="background: #e8ecf0;"
        >
          <div class="max-w-[720px] mx-auto my-6 px-10 py-10 bg-white shadow-md rounded-sm min-h-[calc(100vh-8rem)]">
            <MarkdownRenderer :content="epicrisisStore.current.contentMarkdown" />
          </div>
        </div>
      </div>

      <!-- Drag handle -->
      <div
        class="w-1 flex-shrink-0 bg-gray-200 hover:bg-brand-400 cursor-col-resize transition-colors active:bg-brand-500"
        :class="{ 'bg-brand-400': isDragging }"
        @mousedown="startDrag"
      />

      <!-- ===== RIGHT PANEL: Annotation form ===== -->
      <div
        :style="{ width: (100 - leftWidthPct) + '%' }"
        class="flex flex-col overflow-hidden bg-gray-50"
      >
        <!-- Panel header with progress -->
        <div class="flex-shrink-0 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Comorbilidades · Ground Truth
            </span>
            <span class="text-[10px] text-gray-500 font-medium">
              {{ completedCount }}/{{ annotationStore.criteria.length }}
            </span>
          </div>
          <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-brand-500 rounded-full transition-all duration-500"
              :style="{
                width: (completedCount / Math.max(annotationStore.criteria.length, 1)) * 100 + '%',
              }"
            />
          </div>
        </div>

        <!-- Criteria list -->
        <div class="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
          <CriterionRow
            v-for="criterion in COMORBIDITIES"
            :key="criterion.name"
            :meta="criterion"
            :state="annotationStore.criteria.find(c => c.criterionName === criterion.name)!"
            :is-active="annotationStore.activeCriterionName === criterion.name"
            :is-read-only="isReadOnly"
          />
        </div>
      </div>
    </div>

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
