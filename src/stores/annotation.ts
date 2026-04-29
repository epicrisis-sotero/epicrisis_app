import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { COMORBIDITIES } from '@/constants/criteria'
import type { LlmPrediction, LlmPredictions } from '@/types/db'

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

  function initForEpicrisis(id: number, llmPredictions: LlmPredictions | null) {
    epicrisisId.value = id

    const saved = localStorage.getItem(`annotation_draft_${id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CriterionState[]
        // Re-attach LLM predictions (they're not stored in localStorage)
        criteria.value = parsed.map((c) => ({
          ...c,
          llm: llmPredictions?.[c.criterionName] ?? null,
        }))
        return
      } catch {
        // fallback to fresh
      }
    }

    criteria.value = buildInitial(llmPredictions)
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
    if (c) c.isPresent = value
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
        false
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
        true
      )
      localStorage.removeItem(`annotation_draft_${epicrisisId.value}`)
      return result.status
    } finally {
      submitting.value = false
    }
  }

  function persistLocally() {
    if (!epicrisisId.value) return
    // Strip LLM data from localStorage (it comes from server)
    const toSave = criteria.value.map(({ llm: _llm, ...rest }) => rest)
    localStorage.setItem(`annotation_draft_${epicrisisId.value}`, JSON.stringify(toSave))
  }

  function reset() {
    epicrisisId.value = null
    activeCriterionName.value = null
    criteria.value = []
  }

  watch(criteria, persistLocally, { deep: true })

  return {
    epicrisisId,
    activeCriterionName,
    activeCriterion,
    criteria,
    saving,
    submitting,
    isComplete,
    pendingCount,
    initForEpicrisis,
    loadFromServer,
    setActive,
    setIsPresent,
    setEvidence,
    setComments,
    injectEvidenceToActive,
    saveProgress,
    submitFinal,
    reset,
  }
})
