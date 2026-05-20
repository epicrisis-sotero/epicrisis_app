import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { COMORBIDITIES } from '@/constants/criteria'
import type { LlmPrediction, LlmPredictions } from '@/types/db'
import type { EpicrisisDetail } from '@/stores/epicrisis'
import { defaultClinicalData } from '@/types/clinical'
import type { ClinicalData } from '@/types/clinical'

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
  const activeClinicalField = ref<string | null>(null)
  const activeMetadataField = ref<string | null>(null)
  const criteria = ref<CriterionState[]>([])
  const saving = ref(false)
  const submitting = ref(false)

  // Global selection state
  const selectedText = ref('')
  const hasSelection = ref(false)

  // Structured clinical data (JSONB on epicrisis)
  const clinicalData = ref<ClinicalData>(defaultClinicalData())

  // Editable epicrisis metadata (dates + final comment)
  const fechaIngresoHosp = ref('')
  const fechaEgresoHosp = ref('')
  const fechaIngresoUci = ref('')
  const fechaEgresoUci = ref('')
  const comentarioFinal = ref('')

  // Fields that MUST be filled (not null/empty) to consider the annotation complete
  const criticalClinicalFields: Array<keyof ClinicalData> = [
    'vmi', 'transfusion', 'drogasVasoactivas', 'trr',
    'fallaRenal', 'fallaNervioso', 'fallaVascular', 'fallaCardiaco',
    'fallaPulmonar', 'fallaHepatico', 'fallaOtra', 'mortalidad', 'hfav'
  ]

  const totalProgress = computed(() => {
    const criteriaDone = criteria.value.filter(c => c.isPresent !== null).length
    const criteriaTotal = criteria.value.length

    const clinicalDone = criticalClinicalFields.filter(f => clinicalData.value[f] !== null).length
    const clinicalTotal = criticalClinicalFields.length

    // Dates: we consider them "done" if they have some text (even if invalid format, that's a different validation)
    const dates = [fechaIngresoHosp.value, fechaEgresoHosp.value, fechaIngresoUci.value, fechaEgresoUci.value]
    const datesDone = dates.filter(d => d && d.trim() !== '').length
    const datesTotal = 4

    const completed = criteriaDone + clinicalDone + datesDone
    const total = criteriaTotal + clinicalTotal + datesTotal

    return {
      completed,
      total,
      percentage: Math.round((completed / Math.max(total, 1)) * 100)
    }
  })

  const isComplete = computed(() => totalProgress.value.completed === totalProgress.value.total)

  const activeCriterion = computed(() =>
    criteria.value.find((c) => c.criterionName === activeCriterionName.value) ?? null
  )

  const pendingCount = computed(() =>
    totalProgress.value.total - totalProgress.value.completed
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
        
        // Merge with current COMORBIDITIES to prevent missing items if schema changed
        criteria.value = COMORBIDITIES.map((c) => {
          const found = criteriaData.find((savedC) => savedC.criterionName === c.name)
          return {
            criterionName: c.name,
            isPresent: found?.isPresent ?? null,
            evidenceText: found?.evidenceText ?? '',
            comments: found?.comments ?? '',
            llm: llmPredictions?.[c.name] ?? null,
          }
        })
        
        criteriaLoaded = true

        if (!Array.isArray(parsed)) {
          fechaIngresoHosp.value = parsed.fechaIngresoHosp ?? ''
          fechaEgresoHosp.value = parsed.fechaEgresoHosp ?? ''
          fechaIngresoUci.value = parsed.fechaIngresoUci ?? ''
          fechaEgresoUci.value = parsed.fechaEgresoUci ?? ''
          comentarioFinal.value = parsed.comentarioFinal ?? ''
          if (parsed.clinicalData) {
            clinicalData.value = { ...defaultClinicalData(), ...parsed.clinicalData }
          }
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
      if (epicrisisData.clinicalData) {
        clinicalData.value = { ...defaultClinicalData(), ...epicrisisData.clinicalData }
      }
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
    activeClinicalField.value = null
    activeMetadataField.value = null
  }

  function setActiveClinical(field: string) {
    activeClinicalField.value = field
    activeCriterionName.value = null
    activeMetadataField.value = null
  }

  function setActiveMetadata(field: string) {
    activeMetadataField.value = field
    activeCriterionName.value = null
    activeClinicalField.value = null
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
    if (activeCriterionName.value) {
      setEvidence(activeCriterionName.value, text)
    } else if (activeClinicalField.value) {
      setClinical(activeClinicalField.value as keyof ClinicalData, text)
    } else if (activeMetadataField.value) {
      if (activeMetadataField.value === 'fechaIngresoHosp') fechaIngresoHosp.value = text
      else if (activeMetadataField.value === 'fechaEgresoHosp') fechaEgresoHosp.value = text
      else if (activeMetadataField.value === 'fechaIngresoUci') fechaIngresoUci.value = text
      else if (activeMetadataField.value === 'fechaEgresoUci') fechaEgresoUci.value = text
      else if (activeMetadataField.value === 'comentarioFinal') comentarioFinal.value = text
    }
  }

  function setClinical<K extends keyof ClinicalData>(key: K, value: ClinicalData[K]) {
    clinicalData.value[key] = value
  }

  function buildMetadata() {
    return {
      fechaIngresoHosp: fechaIngresoHosp.value || undefined,
      fechaEgresoHosp: fechaEgresoHosp.value || undefined,
      fechaIngresoUci: fechaIngresoUci.value || undefined,
      fechaEgresoUci: fechaEgresoUci.value || undefined,
      comentarioFinal: comentarioFinal.value || undefined,
      clinicalData: clinicalData.value,
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
      clinicalData: clinicalData.value,
    }
    localStorage.setItem(`annotation_draft_${epicrisisId.value}`, JSON.stringify(toSave))
  }

  function clearCriteria() {
    criteria.value = criteria.value.map((c) => ({
      ...c,
      isPresent: null,
      evidenceText: '',
      comments: '',
    }))
  }

  const hasCriteriaSelection = computed(() =>
    criteria.value.some((c) => c.isPresent !== null)
  )

  function reset() {
    epicrisisId.value = null
    activeCriterionName.value = null
    activeClinicalField.value = null
    activeMetadataField.value = null
    criteria.value = []
    selectedText.value = ''
    hasSelection.value = false
    fechaIngresoHosp.value = ''
    fechaEgresoHosp.value = ''
    fechaIngresoUci.value = ''
    fechaEgresoUci.value = ''
    comentarioFinal.value = ''
    clinicalData.value = defaultClinicalData()
  }

  watch(criteria, persistLocally, { deep: true })
  watch([fechaIngresoHosp, fechaEgresoHosp, fechaIngresoUci, fechaEgresoUci, comentarioFinal], persistLocally)
  watch(clinicalData, persistLocally, { deep: true })

  return {
    epicrisisId,
    activeCriterionName,
    activeClinicalField,
    activeMetadataField,
    activeCriterion,
    criteria,
    saving,
    submitting,
    selectedText,
    hasSelection,
    totalProgress,
    isComplete,
    pendingCount,
    fechaIngresoHosp,
    fechaEgresoHosp,
    fechaIngresoUci,
    fechaEgresoUci,
    comentarioFinal,
    clinicalData,
    hasCriteriaSelection,
    clearCriteria,
    setClinical,
    initForEpicrisis,
    loadFromServer,
    setActive,
    setActiveClinical,
    setActiveMetadata,
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
