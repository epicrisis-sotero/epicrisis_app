import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { COMORBIDITIES } from '@/constants/criteria'
import type { LlmPrediction, LlmPredictions } from '@/types/db'
import type { EpicrisisDetail } from '@/stores/epicrisis'
import { defaultClinicalData } from '@/types/clinical'
import type { ClinicalData } from '@/types/clinical'
import type { DifficultyLevel } from '@/types/difficulty'

export type MissingItem = { category: string; label: string } & (
  | { kind: 'criterion'; key: string }
  | { kind: 'clinical';  key: string; section: string }
  | { kind: 'date';      key: string }
)

export interface CriterionState {
  criterionName: string
  // Ground truth provided by the annotator (null = sin responder, 'unknown' = no se puede determinar)
  isPresent: boolean | null | 'unknown'
  evidenceText: string
  comments: string
  difficulty: DifficultyLevel
  difficultyNotes: string
  // LLM prediction (read-only reference)
  llm: LlmPrediction | null
}

export const useAnnotationStore = defineStore('annotation', () => {
  const epicrisisId = ref<number | null>(null)
  const activeCriterionName = ref<string | null>(null)
  const activeClinicalField = ref<string | null>(null)
  const activeMetadataField = ref<string | null>(null)
  const criteria = ref<CriterionState[]>([])
  const clinicalDifficulty = ref<Record<string, { difficulty: DifficultyLevel; notes: string }>>({})
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
  // HU-010: tiempo activo de anotación (ms). La vista lo actualiza desde el
  // cronómetro antes de cada guardado; viaja en el metadata al backend.
  const activeTimeMs = ref(0)

  // Fields that MUST be filled (not null/empty) to consider the annotation complete
  const criticalClinicalFields: Array<keyof ClinicalData> = [
    'vmi', 'vmni', 'transfusion', 'drogasVasoactivas', 'trr',
    'fallaRenal', 'fallaNervioso', 'fallaVascular', 'fallaCardiaco',
    'fallaPulmonar', 'fallaHepatico', 'fallaOtra', 'fallecimiento', 'hfav', 'reingresoUci'
  ]

  const totalProgress = computed(() => {
    const criteriaDone = criteria.value.filter(c => c.isPresent !== null).length
    const criteriaTotal = criteria.value.length

    const clinicalDone = criticalClinicalFields.filter(f =>
      clinicalData.value[f] !== null || clinicalData.value._unknowns.includes(f as string)
    ).length
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

  const clinicalFieldLabels: Record<string, string> = {
    vmi: 'Ventilación mecánica invasiva (VMI)',
    vmni: 'Ventilación mecánica no invasiva (VMNI)',
    transfusion: 'Transfusión',
    drogasVasoactivas: 'Drogas vasoactivas',
    trr: 'Terapia de reemplazo renal (TRR)',
    fallaRenal: 'Falla Renal',
    fallaNervioso: 'Falla Sistema Nervioso',
    fallaVascular: 'Falla Vascular',
    fallaCardiaco: 'Falla Cardíaca',
    fallaPulmonar: 'Falla Pulmonar',
    fallaHepatico: 'Falla Hepática',
    fallaOtra: 'Otra Falla Orgánica',
    fallecimiento: 'Fallecimiento',
    hfav: 'HFAV / Hemofiltración AV',
    reingresoUci: 'Reingreso a la UCI',
  }

  // Maps critical clinical fields to their data-clinical-section value in ClinicalDataPanel
  const clinicalFieldSection: Record<string, string> = {
    vmi: 'ventilatorio',
    vmni: 'ventilatorio',
    transfusion: 'transfusion',
    drogasVasoactivas: 'vasoactivas',
    trr: 'trr',
    fallaRenal: 'falla',
    fallaNervioso: 'falla',
    fallaVascular: 'falla',
    fallaCardiaco: 'falla',
    fallaPulmonar: 'falla',
    fallaHepatico: 'falla',
    fallaOtra: 'falla',
    fallecimiento: 'diagnosticos',
    hfav: 'diagnosticos',
    reingresoUci: 'uci',
  }

  const missingItems = computed((): MissingItem[] => {
    const items: MissingItem[] = []

    criteria.value
      .filter(c => c.isPresent === null)
      .forEach(c => {
        const found = COMORBIDITIES.find(x => x.name === c.criterionName)
        items.push({ kind: 'criterion', key: c.criterionName, category: 'Criterio', label: found?.label ?? c.criterionName })
      })

    criticalClinicalFields
      .filter(f => clinicalData.value[f] === null && !clinicalData.value._unknowns.includes(f as string))
      .forEach(f => {
        items.push({ kind: 'clinical', key: f, section: clinicalFieldSection[f] ?? 'ventilatorio', category: 'Datos clínicos', label: clinicalFieldLabels[f] ?? f })
      })

    const dateFields: Array<{ ref: typeof fechaIngresoHosp; key: string; label: string }> = [
      { ref: fechaIngresoHosp, key: 'fechaIngresoHosp', label: 'Fecha ingreso hospitalización' },
      { ref: fechaEgresoHosp,  key: 'fechaEgresoHosp',  label: 'Fecha egreso hospitalización' },
      { ref: fechaIngresoUci,  key: 'fechaIngresoUci',  label: 'Fecha ingreso UCI' },
      { ref: fechaEgresoUci,   key: 'fechaEgresoUci',   label: 'Fecha egreso UCI' },
    ]
    dateFields
      .filter(({ ref }) => !ref.value || ref.value.trim() === '')
      .forEach(({ key, label }) => {
        items.push({ kind: 'date', key, category: 'Fechas', label })
      })

    return items
  })

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
        difficulty: null,
        difficultyNotes: '',
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
            difficulty: found?.difficulty ?? null,
            difficultyNotes: found?.difficultyNotes ?? '',
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
          if (parsed.clinicalDifficulty) {
            clinicalDifficulty.value = parsed.clinicalDifficulty
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
    }
    // clinicalData always loads from server when available — localStorage is only a
    // warm-start cache; the server is the source of truth for cleared/saved fields.
    if (epicrisisData?.clinicalData) {
      const { unknownFields, ...rest } = epicrisisData.clinicalData as any
      clinicalData.value = { ...defaultClinicalData(), ...rest, _unknowns: unknownFields ?? [] }
    }
  }

  function loadFromServer(
    serverAnnotations: Array<{
      criterionName: string
      isPresent: boolean | null
      isUnknown?: boolean
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
        isPresent: found?.isUnknown ? 'unknown' : (found?.isPresent ?? null),
        evidenceText: found?.evidenceText ?? '',
        comments: found?.comments ?? '',
        difficulty: (found as any)?.difficulty ?? null,
        difficultyNotes: (found as any)?.difficultyNotes ?? '',
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

  function setIsPresent(name: string, value: boolean | null | 'unknown') {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) {
      c.isPresent = value
      // Auto-capture selection only when marking as present
      if (value === true && hasSelection.value && selectedText.value) {
        c.evidenceText = selectedText.value
        clearGlobalSelection()
      }
      
      // Sincronizar campos booleanos en clinicalData para poblar las columnas correspondientes en la DB (HU-002)
      const mappedValue = value === true ? true : (value === false ? false : null)
      if (name === 'consumo_tabaco') {
        clinicalData.value.consumoTabaco = mappedValue
      } else if (name === 'consumo_alcohol') {
        clinicalData.value.consumoAlcohol = mappedValue
      } else if (name === 'consumo_otras') {
        clinicalData.value.consumoOtrasDrogas = mappedValue
      }
    }
  }

  function clearGlobalSelection() {
    selectedText.value = ''
    hasSelection.value = false
    window.getSelection()?.removeAllRanges()
  }

  // Cierra el "modo captura" sin tocar la selección de texto ni los highlights
  // (HU-001): solo limpia qué campo está activo para recibir evidencia.
  function clearActive() {
    activeCriterionName.value = null
    activeClinicalField.value = null
    activeMetadataField.value = null
  }

  function setEvidence(name: string, text: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) c.evidenceText = text
  }

  function setComments(name: string, text: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) c.comments = text
  }

  const evidenceMetadataMap = ref<Record<string, string[]>>({})

  function injectEvidenceToActive(text: string, id?: string) {
    const field = activeCriterionName.value || activeClinicalField.value || activeMetadataField.value
    if (!field) return

    if (id) {
      if (!evidenceMetadataMap.value[field]) evidenceMetadataMap.value[field] = []
      if (text === '') {
        evidenceMetadataMap.value[field] = evidenceMetadataMap.value[field].filter(i => i !== id)
      } else {
        if (!evidenceMetadataMap.value[field].includes(id)) {
          evidenceMetadataMap.value[field].push(id)
        }
      }
    } else if (text === '') {
       evidenceMetadataMap.value[field] = []
    }

    if (activeCriterionName.value) {
      setEvidence(activeCriterionName.value, text)
      const c = criteria.value.find((c) => c.criterionName === activeCriterionName.value)
      if (c) (c as any).evidenceMetadata = evidenceMetadataMap.value[field]
    } else if (activeClinicalField.value) {
      setClinical(activeClinicalField.value as keyof ClinicalData, text)
      ;(clinicalData.value as any).evidenceMetadata = evidenceMetadataMap.value
    } else if (activeMetadataField.value) {
      if (activeMetadataField.value === 'fechaIngresoHosp') fechaIngresoHosp.value = text
      else if (activeMetadataField.value === 'fechaEgresoHosp') fechaEgresoHosp.value = text
      else if (activeMetadataField.value === 'fechaIngresoUci') fechaIngresoUci.value = text
      else if (activeMetadataField.value === 'fechaEgresoUci') fechaEgresoUci.value = text
      else if (activeMetadataField.value === 'comentarioFinal') comentarioFinal.value = text
      ;(clinicalData.value as any).evidenceMetadata = evidenceMetadataMap.value
    }
  }

  function setClinical<K extends keyof ClinicalData>(key: K, value: ClinicalData[K]) {
    clinicalData.value[key] = value
  }

  function setClinicalDifficulty(section: string, value: DifficultyLevel) {
    if (!clinicalDifficulty.value[section]) clinicalDifficulty.value[section] = { difficulty: null, notes: '' }
    clinicalDifficulty.value[section].difficulty = value
  }

  function setClinicalDifficultyNotes(section: string, notes: string) {
    if (!clinicalDifficulty.value[section]) clinicalDifficulty.value[section] = { difficulty: null, notes: '' }
    clinicalDifficulty.value[section].notes = notes
  }

  function setClinicalDifficultyFromServer(data: Record<string, { difficulty: string | null; notes: string }>) {
    for (const [section, val] of Object.entries(data)) {
      clinicalDifficulty.value[section] = { difficulty: val.difficulty as DifficultyLevel, notes: val.notes }
    }
  }

  function setDifficulty(criterionName: string, value: DifficultyLevel) {
    const c = criteria.value.find((c) => c.criterionName === criterionName)
    if (c) c.difficulty = value
  }

  function setDifficultyNotes(criterionName: string, notes: string) {
    const c = criteria.value.find((c) => c.criterionName === criterionName)
    if (c) c.difficultyNotes = notes
  }

  function buildMetadata() {
    return {
      fechaIngresoHosp: fechaIngresoHosp.value || undefined,
      fechaEgresoHosp: fechaEgresoHosp.value || undefined,
      fechaIngresoUci: fechaIngresoUci.value || undefined,
      fechaEgresoUci: fechaEgresoUci.value || undefined,
      comentarioFinal: comentarioFinal.value || undefined,
      activeTimeMs: activeTimeMs.value,
      clinicalData: clinicalData.value,
      clinicalDifficulty: clinicalDifficulty.value,
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
          evidenceMetadata: (c as any).evidenceMetadata || null,
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
          evidenceMetadata: (c as any).evidenceMetadata || null,
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
      clinicalDifficulty: clinicalDifficulty.value,
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
    clinicalData.value.consumoTabaco = null
    clinicalData.value.consumoAlcohol = null
    clinicalData.value.consumoOtrasDrogas = null
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
    clinicalDifficulty.value = {}
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
    missingItems,
    fechaIngresoHosp,
    fechaEgresoHosp,
    fechaIngresoUci,
    fechaEgresoUci,
    comentarioFinal,
    activeTimeMs,
    clinicalData,
    hasCriteriaSelection,
    clinicalDifficulty,
    clearCriteria,
    setClinical,
    setClinicalDifficulty,
    setClinicalDifficultyNotes,
    setClinicalDifficultyFromServer,
    setDifficulty,
    setDifficultyNotes,
    initForEpicrisis,
    loadFromServer,
    setActive,
    setActiveClinical,
    setActiveMetadata,
    setIsPresent,
    setEvidence,
    setComments,
    injectEvidenceToActive,
    clearActive,
    clearGlobalSelection,
    saveProgress,
    submitFinal,
    reset,
  }
})
