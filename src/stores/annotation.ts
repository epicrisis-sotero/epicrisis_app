import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { COMORBIDITIES } from '@/constants/criteria'
import type { LlmPrediction, LlmPredictions } from '@/types/db'
import type { EpicrisisDetail } from '@/stores/epicrisis'

export interface CriterionState {
  criterionName: string
  // Ground truth provided by the annotator
  isPresent: boolean | null
  evidenceText: string
  comments: string
  // LLM prediction (read-only reference)
  llm: LlmPrediction | null
}

export const useAnnotationStore = defineStore('annotation', () => {
  const epicrisisId = ref<number | null>(null)
  const activeCriterionName = ref<string | null>(null)
  const criteria = ref<CriterionState[]>([])
  const saving = ref(false)
  const submitting = ref(false)

  // Global selection state
  const selectedText = ref('')
  const hasSelection = ref(false)

  // Editable epicrisis metadata (dates + final comment)
  const fechaIngresoHosp = ref('')
  const fechaEgresoHosp = ref('')
  const fechaIngresoUci = ref('')
  const fechaEgresoUci = ref('')
  const comentarioFinal = ref('')

  const isComplete = computed(() =>
    criteria.value.every((c) => c.isPresent !== null)
  )

  const activeCriterion = computed(() =>
    criteria.value.find((c) => c.criterionName === activeCriterionName.value) ?? null
  )

  const pendingCount = computed(() =>
    criteria.value.filter((c) => c.isPresent === null).length
  )

  function buildInitial(llmPredictions: LlmPredictions | null): CriterionState[] {
    return COMORBIDITIES.map((c) => {
      const llm = llmPredictions?.[c.name] ?? null
      return {
        criterionName: c.name,
        isPresent: null,
        evidenceText: '',
        comments: '',
        llm,
      }
    })
  }

  function initForEpicrisis(
    id: number,
    llmPredictions: LlmPredictions | null,
    epicrisisData?: EpicrisisDetail | null,
  ) {
    epicrisisId.value = id

    let criteriaLoaded = false
    let datesFromStorage = false

    const saved = localStorage.getItem(`annotation_draft_${id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const criteriaData: CriterionState[] = Array.isArray(parsed) ? parsed : parsed.criteria
        criteria.value = criteriaData.map((c) => ({
          ...c,
          llm: llmPredictions?.[c.criterionName] ?? null,
        }))
        criteriaLoaded = true

        if (!Array.isArray(parsed)) {
          fechaIngresoHosp.value = parsed.fechaIngresoHosp ?? ''
          fechaEgresoHosp.value = parsed.fechaEgresoHosp ?? ''
          fechaIngresoUci.value = parsed.fechaIngresoUci ?? ''
          fechaEgresoUci.value = parsed.fechaEgresoUci ?? ''
          comentarioFinal.value = parsed.comentarioFinal ?? ''
          // Only block DB values if the user actually saved something here.
          // All-empty means the watcher persisted before fetchOne completed.
          datesFromStorage = !!(
            parsed.fechaIngresoHosp ||
            parsed.fechaEgresoHosp ||
            parsed.fechaIngresoUci ||
            parsed.fechaEgresoUci ||
            parsed.comentarioFinal
          )
        }
      } catch {
        // fallback to fresh
      }
    }

    if (!criteriaLoaded) {
      criteria.value = buildInitial(llmPredictions)
    }

    if (!datesFromStorage && epicrisisData) {
      fechaIngresoHosp.value = epicrisisData.fechaIngresoHosp ?? ''
      fechaEgresoHosp.value = epicrisisData.fechaEgresoHosp ?? ''
      fechaIngresoUci.value = epicrisisData.fechaIngresoUci ?? ''
      fechaEgresoUci.value = epicrisisData.fechaEgresoUci ?? ''
      comentarioFinal.value = epicrisisData.comentarioFinal ?? ''
    }
  }

  function loadFromServer(
    serverAnnotations: Array<{
      criterionName: string
      isPresent: boolean | null
      evidenceText: string | null
      comments: string | null
    }>,
    llmPredictions: LlmPredictions | null
  ) {
    if (!serverAnnotations.length) return
    criteria.value = COMORBIDITIES.map((c) => {
      const found = serverAnnotations.find((a) => a.criterionName === c.name)
      return {
        criterionName: c.name,
        isPresent: found?.isPresent ?? null,
        evidenceText: found?.evidenceText ?? '',
        comments: found?.comments ?? '',
        llm: llmPredictions?.[c.name] ?? null,
      }
    })
  }

  function setActive(name: string) {
    activeCriterionName.value = name
  }

  function setIsPresent(name: string, value: boolean) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) {
      c.isPresent = value
      // Auto-capture selection if present
      if (hasSelection.value && selectedText.value) {
        c.evidenceText = selectedText.value
        clearGlobalSelection()
      }
    }
  }

  function clearGlobalSelection() {
    selectedText.value = ''
    hasSelection.value = false
    window.getSelection()?.removeAllRanges()
  }

  function setEvidence(name: string, text: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) c.evidenceText = text
  }

  function setComments(name: string, text: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) c.comments = text
  }

  function injectEvidenceToActive(text: string) {
    if (!activeCriterionName.value) return
    setEvidence(activeCriterionName.value, text)
  }

  function buildMetadata() {
    return {
      fechaIngresoHosp: fechaIngresoHosp.value || undefined,
      fechaEgresoHosp: fechaEgresoHosp.value || undefined,
      fechaIngresoUci: fechaIngresoUci.value || undefined,
      fechaEgresoUci: fechaEgresoUci.value || undefined,
      comentarioFinal: comentarioFinal.value || undefined,
    }
  }

  async function saveProgress() {
    if (!epicrisisId.value) return
    saving.value = true
    try {
      await annotationService.submit(
        epicrisisId.value,
        criteria.value.map((c) => ({
          criterionName: c.criterionName,
          isPresent: c.isPresent,
          evidenceText: c.evidenceText || null,
          comments: c.comments || null,
        })),
        false,
        buildMetadata(),
      )
      persistLocally()
    } finally {
      saving.value = false
    }
  }

  async function submitFinal(): Promise<string> {
    if (!epicrisisId.value) throw new Error('No epicrisis cargada')
    submitting.value = true
    try {
      const result = await annotationService.submit(
        epicrisisId.value,
        criteria.value.map((c) => ({
          criterionName: c.criterionName,
          isPresent: c.isPresent,
          evidenceText: c.evidenceText || null,
          comments: c.comments || null,
        })),
        true,
        buildMetadata(),
      )
      localStorage.removeItem(`annotation_draft_${epicrisisId.value}`)
      return result.status
    } finally {
      submitting.value = false
    }
  }

  function persistLocally() {
    if (!epicrisisId.value) return
    const toSave = {
      criteria: criteria.value.map(({ llm: _llm, ...rest }) => rest),
      fechaIngresoHosp: fechaIngresoHosp.value,
      fechaEgresoHosp: fechaEgresoHosp.value,
      fechaIngresoUci: fechaIngresoUci.value,
      fechaEgresoUci: fechaEgresoUci.value,
      comentarioFinal: comentarioFinal.value,
    }
    localStorage.setItem(`annotation_draft_${epicrisisId.value}`, JSON.stringify(toSave))
  }

  function reset() {
    epicrisisId.value = null
    activeCriterionName.value = null
    criteria.value = []
    selectedText.value = ''
    hasSelection.value = false
    fechaIngresoHosp.value = ''
    fechaEgresoHosp.value = ''
    fechaIngresoUci.value = ''
    fechaEgresoUci.value = ''
    comentarioFinal.value = ''
  }

  watch(criteria, persistLocally, { deep: true })
  watch([fechaIngresoHosp, fechaEgresoHosp, fechaIngresoUci, fechaEgresoUci, comentarioFinal], persistLocally)

  return {
    epicrisisId,
    activeCriterionName,
    activeCriterion,
    criteria,
    saving,
    submitting,
    selectedText,
    hasSelection,
    isComplete,
    pendingCount,
    fechaIngresoHosp,
    fechaEgresoHosp,
    fechaIngresoUci,
    fechaEgresoUci,
    comentarioFinal,
    initForEpicrisis,
    loadFromServer,
    setActive,
    setIsPresent,
    setEvidence,
    setComments,
    injectEvidenceToActive,
    clearGlobalSelection,
    saveProgress,
    submitFinal,
    reset,
  }
})
