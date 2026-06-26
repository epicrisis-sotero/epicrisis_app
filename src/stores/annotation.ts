import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { FORM_SCHEMA, getLeafNodes } from '@/constants/formSchema'
import type { LlmPrediction, LlmPredictions } from '@/types/db'
import type { EpicrisisDetail } from '@/stores/epicrisis'
import { defaultClinicalData } from '@/types/clinical'
import type { ClinicalData } from '@/types/clinical'
import type { DifficultyLevel } from '@/types/difficulty'

// Traverse the schema to get all nodes (mothers and leaves) to track their states
function getAllNodes(nodes = FORM_SCHEMA) {
  const list: any[] = []
  function traverse(n: any) {
    list.push(n)
    if (n.children) {
      n.children.forEach(traverse)
    }
  }
  nodes.forEach(traverse)
  return list
}

const ALL_FORM_NODES = getAllNodes()
const V3_LEAF_VARIABLES = getLeafNodes()

export type MissingItem = { category: string; label: string } & (
  | { kind: 'criterion'; key: string }
  | { kind: 'clinical';  key: string; section: string }
  | { kind: 'date';      key: string }
)

export interface CriterionState {
  criterionName: string
  isPresent: boolean | null | 'unknown'
  evidenceText: string
  comments: string
  difficulty: DifficultyLevel
  difficultyNotes: string
  llm: LlmPrediction | null
  evidenceMetadata?: Record<string, any> | null
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

  // Structured clinical data (maintained for backwards compatibility / private notes)
  const clinicalData = ref<ClinicalData>(defaultClinicalData())

  // Editable epicrisis metadata (dates + final comment)
  const fechaIngresoHosp = ref('')
  const fechaEgresoHosp = ref('')
  const fechaIngresoUci = ref('')
  const fechaEgresoUci = ref('')
  const comentarioFinal = ref('')
  const activeTimeMs = ref(0)

  // Helper to determine if a node is visible (meaning no parent mother is marked 'No')
  function isNodeVisible(key: string): boolean {
    const parts = key.split('.')
    let currentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i]
      const parentState = criteria.value.find(c => c.criterionName === currentPath)
      if (parentState && parentState.isPresent === false) {
        return false
      }
    }
    return true
  }

  const totalProgress = computed(() => {
    // Only count leaf nodes that are currently visible
    const visibleLeaves = V3_LEAF_VARIABLES.filter(node => isNodeVisible(node.key))
    
    let completed = 0
    const total = visibleLeaves.length

    for (const node of visibleLeaves) {
      const stateVal = criteria.value.find(c => c.criterionName === node.key)
      if (!stateVal) continue
      
      if (node.type === 'leaf') {
        if (stateVal.isPresent === true) {
          // If it's a date check, we also require the date value
          const isDateCheck = node.key.includes('fecha') || node.key.includes('inicio') || node.key.includes('termino') || node.key.includes('realizacion')
          if (isDateCheck) {
            const dateVal = stateVal.evidenceMetadata && (stateVal.evidenceMetadata as any).value
            if (dateVal && dateVal.trim() !== '') {
              completed++
            }
          } else {
            completed++
          }
        } else if (stateVal.isPresent === false || stateVal.isPresent === 'unknown') {
          completed++
        }
      } else if (node.type === 'date' || node.type === 'text') {
        if (stateVal.evidenceText && stateVal.evidenceText.trim() !== '') {
          completed++
        }
      } else if (node.type === 'select') {
        if (stateVal.evidenceMetadata && (stateVal.evidenceMetadata as any).value) {
          completed++
        }
      }
    }

    return {
      completed,
      total,
      percentage: Math.round((completed / Math.max(total, 1)) * 100)
    }
  })

  const isComplete = computed(() => totalProgress.value.completed === totalProgress.value.total)

  const missingItems = computed((): MissingItem[] => {
    const items: MissingItem[] = []
    const visibleLeaves = V3_LEAF_VARIABLES.filter(node => isNodeVisible(node.key))

    for (const node of visibleLeaves) {
      const stateVal = criteria.value.find(c => c.criterionName === node.key)
      if (!stateVal) continue
      
      let isDone = false
      if (node.type === 'leaf') {
        if (stateVal.isPresent === true) {
          const isDateCheck = node.key.includes('fecha') || node.key.includes('inicio') || node.key.includes('termino') || node.key.includes('realizacion')
          if (isDateCheck) {
            const dateVal = stateVal.evidenceMetadata && (stateVal.evidenceMetadata as any).value
            isDone = !!(dateVal && dateVal.trim() !== '')
          } else {
            isDone = true
          }
        } else if (stateVal.isPresent === false || stateVal.isPresent === 'unknown') {
          isDone = true
        }
      } else if (node.type === 'date' || node.type === 'text') {
        isDone = !!(stateVal.evidenceText && stateVal.evidenceText.trim() !== '')
      } else if (node.type === 'select') {
        isDone = !!(stateVal.evidenceMetadata && (stateVal.evidenceMetadata as any).value)
      }

      if (!isDone) {
        // Block name category
        const category = node.key.split('.')[0].toUpperCase()
        items.push({
          kind: 'criterion',
          key: node.key,
          category,
          label: node.label
        })
      }
    }

    return items
  })

  const activeCriterion = computed(() =>
    criteria.value.find((c) => c.criterionName === activeCriterionName.value) ?? null
  )

  const pendingCount = computed(() =>
    totalProgress.value.total - totalProgress.value.completed
  )

  function buildInitial(llmPredictions: LlmPredictions | null): CriterionState[] {
    return ALL_FORM_NODES.map((c) => {
      const llm = llmPredictions?.[c.key] ?? null
      return {
        criterionName: c.key,
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
        
        criteria.value = ALL_FORM_NODES.map((c) => {
          const found = criteriaData.find((savedC) => savedC.criterionName === c.key)
          return {
            criterionName: c.key,
            isPresent: found?.isPresent ?? null,
            evidenceText: found?.evidenceText ?? '',
            comments: found?.comments ?? '',
            difficulty: found?.difficulty ?? null,
            difficultyNotes: found?.difficultyNotes ?? '',
            llm: llmPredictions?.[c.key] ?? null,
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
          datesFromStorage = !!(
            parsed.fechaIngresoHosp ||
            parsed.fechaEgresoHosp ||
            parsed.fechaIngresoUci ||
            parsed.fechaEgresoUci ||
            parsed.comentarioFinal
          )
        }
      } catch {
        // fallback
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
      evidenceMetadata?: any
    }>,
    llmPredictions: LlmPredictions | null
  ) {
    if (!serverAnnotations.length) return
    criteria.value = ALL_FORM_NODES.map((c) => {
      const found = serverAnnotations.find((a) => a.criterionName === c.key)
      return {
        criterionName: c.key,
        isPresent: found?.isUnknown ? 'unknown' : (found?.isPresent ?? null),
        evidenceText: found?.evidenceText ?? '',
        comments: found?.comments ?? '',
        difficulty: (found as any)?.difficulty ?? null,
        difficultyNotes: (found as any)?.difficultyNotes ?? '',
        evidenceMetadata: found?.evidenceMetadata ?? null,
        llm: llmPredictions?.[c.key] ?? null,
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
      // Auto-capture text selection on checking Sí
      if (value === true && hasSelection.value && selectedText.value) {
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
      if (c) (c as any).evidenceMetadata = { ...((c as any).evidenceMetadata || {}), highlightIds: evidenceMetadataMap.value[field] }
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
          isPresent: c.isPresent === 'unknown' ? null : c.isPresent,
          isUnknown: c.isPresent === 'unknown',
          evidenceText: c.evidenceText || null,
          evidenceMetadata: (c as any).evidenceMetadata || null,
          comments: c.comments || null,
          difficulty: c.difficulty || null,
          difficultyNotes: c.difficultyNotes || null,
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
          isPresent: c.isPresent === 'unknown' ? null : c.isPresent,
          isUnknown: c.isPresent === 'unknown',
          evidenceText: c.evidenceText || null,
          evidenceMetadata: (c as any).evidenceMetadata || null,
          comments: c.comments || null,
          difficulty: c.difficulty || null,
          difficultyNotes: c.difficultyNotes || null,
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
