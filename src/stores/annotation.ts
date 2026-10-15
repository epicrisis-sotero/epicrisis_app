import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { annotationService } from '@/services/annotation.service'
import { FORM_SCHEMA, getLeafNodes, isBooleanNode } from '@/constants/formSchema'
import { CURRENT_FORM_VERSION, LEGACY_FORM_VERSION, parseFormVersion, schemaForVersion, versionFromAnnotations, type FormVersion } from '@/constants/formVersions'
import type { LlmPrediction, LlmPredictions } from '@/types/db'
import type { EpicrisisDetail } from '@/stores/epicrisis'
import { defaultClinicalData } from '@/types/clinical'
import type { ClinicalData } from '@/types/clinical'
import type { DifficultyLevel } from '@/types/difficulty'
import { normalizeFecha } from '@/utils/fecha'

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

// HU-039: campos que pasaron de leaf a type 'date'. Su valor legacy quedó en
// evidenceMetadata.value; al cargar lo movemos a evidenceText (donde vive el 'date').
const DATE_REMAPPED_KEYS = [
  'ingreso.fecha_ingreso_upc',
  'egreso.fecha_egreso_upc',
  'soporte.respiratorio.vmi.fecha_inicio',
  'soporte.respiratorio.vmi.fecha_termino',
  'soporte.respiratorio.bloqueo_neuromuscular.fecha_inicio',
  'soporte.respiratorio.bloqueo_neuromuscular.fecha_termino',
  'soporte.respiratorio.prono.fecha_inicio',
  'soporte.respiratorio.prono.fecha_termino',
  'soporte.respiratorio.traqueostomia.fecha_realizacion',
]

export type MissingItem = { category: string; label: string } & (
  | { kind: 'criterion'; key: string }
  | { kind: 'clinical';  key: string; section: string }
  | { kind: 'date';      key: string }
)

// HU-029: un criterio puede tener varios fragmentos de evidencia. Cada uno con
// su candado: abierto (locked=false) = editable y a la escucha de la captura;
// cerrado (locked=true) = confirmado, solo lectura.
export interface EvidenceFragment {
  text: string
  locked: boolean
}

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
  const formVersion = ref<FormVersion>(CURRENT_FORM_VERSION)
  const formSchema = computed(() => schemaForVersion(formVersion.value))
  const ALL_FORM_NODES = computed(() => getAllNodes(formSchema.value))
  const V3_LEAF_VARIABLES = computed(() => getLeafNodes(formSchema.value))
  const CHILDREN_MAP = computed(() => new Map<string, string[]>(ALL_FORM_NODES.value.map(n => [n.key, (n.children ?? []).map((c: any) => c.key)])))
  const PARENT_MAP = computed(() => {
    const parents = new Map<string, string>()
    function visit(nodes: typeof FORM_SCHEMA, parent?: string) {
      for (const node of nodes) {
        if (parent) parents.set(node.key, parent)
        if (node.children) visit(node.children, node.key)
      }
    }
    visit(formSchema.value)
    return parents
  })
  const BOOLEAN_NODE_KEYS = computed(() => new Set<string>(ALL_FORM_NODES.value.filter(isBooleanNode).map(n => n.key)))
  const PARENT_KEYS = computed(() => new Set<string>(ALL_FORM_NODES.value.filter(n => n.children?.length).map(n => n.key)))

  const epicrisisId = ref<number | null>(null)
  const activeCriterionName = ref<string | null>(null)
  const activeClinicalField = ref<string | null>(null)
  const activeMetadataField = ref<string | null>(null)
  // HU-029: índice de la única casilla de evidencia activa (dentro del criterio activo)
  const activeEvidenceIndex = ref(0)
  // HU-037: Estado del glosario
  const isGlossaryOpen = ref(false)
  const glossaryActiveKey = ref<string | null>(null)
  const criteria = ref<CriterionState[]>([])
  const clinicalDifficulty = ref<Record<string, { difficulty: DifficultyLevel; notes: string }>>({})
  const saving = ref(false)
  const submitting = ref(false)

  // Global selection state
  const selectedText = ref('')
  const hasSelection = ref(false)

  // Structured clinical data (maintained for backwards compatibility / private notes)
  const clinicalData = ref<ClinicalData>(defaultClinicalData())
  
  // Define getters/setters for vmiInicio and vmiFin on the clinicalData value object to link with criteria
  // HU-039: estas fechas ahora son type 'date' (su valor vive en evidenceText).
  // Fallback a evidenceMetadata.value para leer datos legacy (guardados como leaf).
  Object.defineProperty(clinicalData.value, 'vmiInicio', {
    get() {
      const node = criteria.value.find(c => c.criterionName === 'soporte.respiratorio.vmi.fecha_inicio')
      return node ? (node.evidenceText || node.evidenceMetadata?.value || '') : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'soporte.respiratorio.vmi.fecha_inicio')
      if (node) node.evidenceText = newVal
    },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(clinicalData.value, 'vmiFin', {
    get() {
      const node = criteria.value.find(c => c.criterionName === 'soporte.respiratorio.vmi.fecha_termino')
      return node ? (node.evidenceText || node.evidenceMetadata?.value || '') : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'soporte.respiratorio.vmi.fecha_termino')
      if (node) node.evidenceText = newVal
    },
    enumerable: true,
    configurable: true
  })

  // Editable epicrisis metadata (dates + final comment) - bound to criteria nodes
  const fechaIngresoHosp = computed({
    get() {
      const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_ingreso')
      return node ? node.evidenceText : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_ingreso')
      if (node) {
        node.evidenceText = newVal
      }
    }
  })

  const fechaEgresoHosp = computed({
    get() {
      const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_egreso')
      return node ? node.evidenceText : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_egreso')
      if (node) {
        node.evidenceText = newVal
      }
    }
  })

  // HU-039: fechas de UPC ahora type 'date' (valor en evidenceText; fallback legacy a metadata.value).
  const fechaIngresoUci = computed({
    get() {
      const node = criteria.value.find(c => c.criterionName === 'ingreso.fecha_ingreso_upc')
      return node ? (node.evidenceText || node.evidenceMetadata?.value || '') : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'ingreso.fecha_ingreso_upc')
      if (node) node.evidenceText = newVal
    }
  })

  const fechaEgresoUci = computed({
    get() {
      const node = criteria.value.find(c => c.criterionName === 'egreso.fecha_egreso_upc')
      return node ? (node.evidenceText || node.evidenceMetadata?.value || '') : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'egreso.fecha_egreso_upc')
      if (node) node.evidenceText = newVal
    }
  })

  const comentarioFinal = computed({
    get() {
      const node = criteria.value.find(c => c.criterionName === 'calidad.comentario')
      return node ? node.evidenceText : ''
    },
    set(newVal) {
      const node = criteria.value.find(c => c.criterionName === 'calidad.comentario')
      if (node) {
        node.evidenceText = newVal
      }
    }
  })

  const activeTimeMs = ref(0)

  // Un nodo condicional solo cuenta si todos sus ancestros clínicos booleanos
  // están activos. Los bloques estructurales hideToggle no bloquean a sus hijos.
  function isNodeVisible(key: string): boolean {
    // Los booleanos reciben No por cascada y siguen formando parte del
    // denominador clínico. Solo se ocultan subcampos que no admiten No.
    if (BOOLEAN_NODE_KEYS.value.has(key)) return true
    let parentKey = PARENT_MAP.value.get(key)
    while (parentKey) {
      if (BOOLEAN_NODE_KEYS.value.has(parentKey)) {
        const parent = criteria.value.find(c => c.criterionName === parentKey)
        if (parent?.isPresent !== true && parent?.isPresent !== 'unknown') return false
      }
      parentKey = PARENT_MAP.value.get(parentKey)
    }
    return true
  }

  const totalProgress = computed(() => {
    // Only count leaf nodes that are currently visible
    const visibleLeaves = V3_LEAF_VARIABLES.value.filter(node => isNodeVisible(node.key))
    
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

  const pendingBooleanCount = computed(() =>
    criteria.value.filter(c => BOOLEAN_NODE_KEYS.value.has(c.criterionName) && c.isPresent === null).length
  )

  const missingItems = computed((): MissingItem[] => {
    const items: MissingItem[] = []
    const visibleLeaves = V3_LEAF_VARIABLES.value.filter(node => isNodeVisible(node.key))

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
    return ALL_FORM_NODES.value.map((c) => {
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
    persistenceEnabled.value = true
    epicrisisId.value = id

    formVersion.value = CURRENT_FORM_VERSION
    let criteriaLoaded = false
    let datesFromStorage = false

    const saved = localStorage.getItem(`annotation_draft_${id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const criteriaData: CriterionState[] = Array.isArray(parsed) ? parsed : parsed.criteria
        formVersion.value = parseFormVersion(parsed.formVersion ?? LEGACY_FORM_VERSION)
        
        criteria.value = ALL_FORM_NODES.value.map((c) => {
          const found = criteriaData.find((savedC) => savedC.criterionName === c.key)
          return {
            criterionName: c.key,
            isPresent: found ? found.isPresent : null,
            evidenceText: found?.evidenceText ?? '',
            comments: found?.comments ?? '',
            difficulty: found?.difficulty ?? null,
            difficultyNotes: found?.difficultyNotes ?? '',
            evidenceMetadata: found?.evidenceMetadata ?? null,
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
            Object.keys(parsed.clinicalData).forEach((key) => {
              if (key !== 'vmiInicio' && key !== 'vmiFin') {
                (clinicalData.value as any)[key] = parsed.clinicalData[key]
              }
            })
            clinicalData.value.vmiInicio = parsed.clinicalData.vmiInicio ?? ''
            clinicalData.value.vmiFin = parsed.clinicalData.vmiFin ?? ''
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
      } catch (error) {
        persistenceEnabled.value = false
        throw error
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
      Object.keys(rest).forEach((key) => {
        if (key !== 'vmiInicio' && key !== 'vmiFin') {
          (clinicalData.value as any)[key] = rest[key]
        }
      })
      clinicalData.value._unknowns = unknownFields ?? []
      clinicalData.value.vmiInicio = rest.vmiInicio ?? ''
      clinicalData.value.vmiFin = rest.vmiFin ?? ''
    }
    migrateReTypedFields()
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
    formVersion.value = versionFromAnnotations(serverAnnotations)
    criteria.value = ALL_FORM_NODES.value.map((c) => {
      const found = serverAnnotations.find((a) => a.criterionName === c.key)
      const existing = criteria.value.find((e) => e.criterionName === c.key)
      
      if (found) {
        return {
          criterionName: c.key,
          isPresent: found.isUnknown ? 'unknown' : (found.isPresent ?? null),
          evidenceText: found.evidenceText ?? '',
          comments: found.comments ?? '',
          difficulty: (found as any).difficulty ?? null,
          difficultyNotes: (found as any).difficultyNotes ?? '',
          evidenceMetadata: found.evidenceMetadata ?? null,
          llm: llmPredictions?.[c.key] ?? null,
        }
      } else if (existing) {
        return {
          ...existing,
          llm: llmPredictions?.[c.key] ?? null,
        }
      } else {
        return {
          criterionName: c.key,
          isPresent: null,
          evidenceText: '',
          comments: '',
          difficulty: null,
          difficultyNotes: '',
          evidenceMetadata: null,
          llm: llmPredictions?.[c.key] ?? null,
        }
      }
    })
    migrateReTypedFields()
  }

  function loadAdminReview(
    id: number,
    serverAnnotations: Parameters<typeof loadFromServer>[0],
    serverClinicalData: Record<string, any> | null,
    serverClinicalDifficulty: Record<string, { difficulty: string | null; notes: string }>,
    llmPredictions: LlmPredictions | null,
  ) {
    persistenceEnabled.value = false
    reset()
    epicrisisId.value = id
    formVersion.value = versionFromAnnotations(serverAnnotations)
    criteria.value = buildInitial(llmPredictions)
    if (serverAnnotations.length) loadFromServer(serverAnnotations, llmPredictions)

    const defaults = defaultClinicalData()
    const data = serverClinicalData ?? {}
    for (const key of Object.keys(defaults)) {
      if (key !== 'vmiInicio' && key !== 'vmiFin') {
        ;(clinicalData.value as any)[key] = data[key] ?? (defaults as any)[key]
      }
    }
    clinicalData.value._unknowns = data.unknownFields ?? []
    clinicalData.value.vmiInicio = data.vmiInicio ?? ''
    clinicalData.value.vmiFin = data.vmiFin ?? ''
    fechaIngresoHosp.value = data.fechaIngresoHosp ?? ''
    fechaEgresoHosp.value = data.fechaEgresoHosp ?? ''
    fechaIngresoUci.value = data.fechaIngresoUci ?? ''
    fechaEgresoUci.value = data.fechaEgresoUci ?? ''
    comentarioFinal.value = data.comentarioFinal ?? ''
    clinicalDifficulty.value = {}
    setClinicalDifficultyFromServer(serverClinicalDifficulty)
    migrateReTypedFields()
  }

  // HU-039: migra el valor legacy de los campos-fecha remapeados (metadata.value → evidenceText).
  function migrateReTypedFields() {
    for (const key of DATE_REMAPPED_KEYS) {
      const c = criteria.value.find((x) => x.criterionName === key)
      if (c && (!c.evidenceText || c.evidenceText.trim() === '') && c.evidenceMetadata?.value) {
        c.evidenceText = c.evidenceMetadata.value
      }
    }
  }

  function setActive(name: string) {
    activeCriterionName.value = name
    activeClinicalField.value = null
    activeMetadataField.value = null
    activeEvidenceIndex.value = 0
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

  function openGlossary(key: string) {
    glossaryActiveKey.value = key
    isGlossaryOpen.value = true
  }

  function closeGlossary() {
    isGlossaryOpen.value = false
    glossaryActiveKey.value = null
  }

  function setIsPresent(name: string, value: boolean | null | 'unknown') {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (c) {
      c.isPresent = value
      // Auto-capture text selection on checking Sí (HU-029: siembra la casilla principal)
      if (value === true && hasSelection.value && selectedText.value) {
        const list = getEvidenceList(name).slice()
        if (list.length === 0) list.push({ text: '', locked: false })
        list[0] = { ...list[0], text: selectedText.value }
        applyEvidences(c, list)
        clearGlobalSelection()
      }

      // HU-044: la cascada solo baja con No y solo escribe sobre lo que está en
      // blanco. El ? ya no cascadea: bajarlo auto-bloquearía a los hijos y el
      // invariante R3 devolvería la madre a Sí, o sea marcar ? la dejaría en Sí.
      if (PARENT_KEYS.value.has(name) && !lockedKeys.value.has(name)) {
        if (value === false) {
          cascadeNoInto(name)
        } else if (value === true && allBooleanDescendantsAreNo(name)) {
          // R2: solo se resetea cuando TODO el subárbol estaba en No
          resetDescendants(name)
        }
      }

      enforceSiInvariant()
    }
  }

  // ── HU-044: candados, cascada e invariante ──────────────────────────────────

  // Candado manual. Estado local de UI: no se persiste todavía (ver HU-044).
  const lockedKeys = ref<Set<string>>(new Set())

  function isLocked(key: string): boolean {
    return lockedKeys.value.has(key)
  }

  function toggleLock(key: string): boolean {
    const next = new Set(lockedKeys.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    lockedKeys.value = next
    return next.has(key)
  }

  // Auto-candado: un nodo en Sí o ? se protege solo de la cascada. Es derivado —
  // se libera en cuanto el anotador lo saca de ese estado.
  function isAutoLocked(state: CriterionState | undefined): boolean {
    return state?.isPresent === true || state?.isPresent === 'unknown'
  }

  function stateOf(key: string): CriterionState | undefined {
    return criteria.value.find((c) => c.criterionName === key)
  }

  // R1: No baja solo sobre lo que está en blanco. Nunca toca evidencia, porque
  // nunca escribe sobre una variable ya respondida.
  function cascadeNoInto(key: string): void {
    for (const childKey of CHILDREN_MAP.value.get(key) ?? []) {
      if (lockedKeys.value.has(childKey)) continue // candado manual: no se cruza
      const child = stateOf(childKey)
      if (child && !isAutoLocked(child) && BOOLEAN_NODE_KEYS.value.has(childKey) && child.isPresent === null) {
        child.isPresent = false
      }
      cascadeNoInto(childKey)
    }
  }

  // R2: ¿todo el subárbol booleano está en No? Ignora las ramas con candado manual.
  function allBooleanDescendantsAreNo(key: string): boolean {
    let sawOne = false
    function walk(k: string): boolean {
      for (const childKey of CHILDREN_MAP.value.get(k) ?? []) {
        if (lockedKeys.value.has(childKey)) continue
        if (BOOLEAN_NODE_KEYS.value.has(childKey)) {
          const child = stateOf(childKey)
          if (!child || child.isPresent !== false) return false
          sawOne = true
        }
        if (!walk(childKey)) return false
      }
      return true
    }
    return walk(key) && sawOne
  }

  // R4: deja en blanco el subárbol booleano. Ignora el auto-candado a propósito
  // (es la vía de escape para deshacer una rama) y respeta el candado manual.
  function resetDescendants(key: string): number {
    let cleared = 0
    function walk(k: string): void {
      for (const childKey of CHILDREN_MAP.value.get(k) ?? []) {
        if (lockedKeys.value.has(childKey)) continue
        const child = stateOf(childKey)
        if (child && BOOLEAN_NODE_KEYS.value.has(childKey) && child.isPresent !== null) {
          child.isPresent = null
          cleared++
        }
        walk(childKey)
      }
    }
    walk(key)
    enforceSiInvariant()
    return cleared
  }

  // R3: toda madre con algún descendiente en Sí o ? queda en Sí. La búsqueda se
  // detiene en un candado manual, así que un Sí encerrado no promueve hacia arriba.
  function hasSiOrUnknownBelow(key: string): boolean {
    for (const childKey of CHILDREN_MAP.value.get(key) ?? []) {
      if (lockedKeys.value.has(childKey)) continue
      if (isAutoLocked(stateOf(childKey))) return true
      if (hasSiOrUnknownBelow(childKey)) return true
    }
    return false
  }

  function enforceSiInvariant(): void {
    for (const key of PARENT_KEYS.value) {
      if (lockedKeys.value.has(key)) continue
      if (!BOOLEAN_NODE_KEYS.value.has(key)) continue
      const parent = stateOf(key)
      if (parent && parent.isPresent !== true && hasSiOrUnknownBelow(key)) {
        parent.isPresent = true
      }
    }
  }

  // Para el aviso del rebote: cuántas variables quedaron en Sí/? bajo esta sección.
  function countSiOrUnknownBelow(key: string): number {
    let count = 0
    function walk(k: string): void {
      for (const childKey of CHILDREN_MAP.value.get(k) ?? []) {
        if (lockedKeys.value.has(childKey)) continue
        if (isAutoLocked(stateOf(childKey))) count++
        walk(childKey)
      }
    }
    walk(key)
    return count
  }

  // HU-032: Fill all remaining null states as No (used before final submit)
  function fillRemainingAsNo(): number {
    let filled = 0
    for (const c of criteria.value) {
      if (BOOLEAN_NODE_KEYS.value.has(c.criterionName) && c.isPresent === null) {
        c.isPresent = false
        filled++
      }
    }
    return filled
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
    if (c) {
      c.evidenceText = text
      
      // Auto-extract/normalize date for date check leaf nodes when evidence is captured
      const isDateCheck = name.includes('fecha') || name.includes('inicio') || name.includes('termino') || name.includes('realizacion')
      if (isDateCheck) {
        // Try to find a date pattern in the text
        const match = text.match(/\b\d{1,2}[\s/.\-]+\d{1,2}[\s/.\-]+\d{2,4}\b/) || text.match(/\b\d{6,8}\b/)
        if (match) {
          const norm = normalizeFecha(match[0])
          if (norm && /^\d{2}\/\d{2}\/\d{4}$/.test(norm)) {
            c.evidenceMetadata = { ...(c.evidenceMetadata || {}), value: norm }
          }
        }
      }
    }
  }

  // ── HU-029: gestión de múltiples fragmentos de evidencia ──────────────────
  // Los fragmentos viven en evidenceMetadata.evidences (jsonb). evidenceText se
  // mantiene como string derivado (join) para no romper progreso/validación/exports.
  function fragmentsToText(evidences: EvidenceFragment[]): string {
    return evidences.map((e) => e.text).filter((t) => t && t.trim() !== '').join(' | ')
  }

  // Lee los fragmentos de un criterio, migrando desde el evidenceText legacy si aún
  // no existen (sin escribir; la materialización ocurre al primer cambio).
  function getEvidenceList(name: string): EvidenceFragment[] {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (!c) return []
    const meta = (c.evidenceMetadata || {}) as any
    if (Array.isArray(meta.evidences)) return meta.evidences as EvidenceFragment[]
    return c.evidenceText && c.evidenceText.trim() !== ''
      ? [{ text: c.evidenceText, locked: true }]
      : []
  }

  // Escribe la lista de fragmentos en el criterio y re-sincroniza evidenceText
  // (y el valor de fecha para los criterios de tipo fecha, igual que setEvidence).
  function applyEvidences(c: CriterionState, evidences: EvidenceFragment[]) {
    const joined = fragmentsToText(evidences)
    const meta: Record<string, any> = { ...(c.evidenceMetadata || {}), evidences }
    const name = c.criterionName
    const isDateCheck = name.includes('fecha') || name.includes('inicio') || name.includes('termino') || name.includes('realizacion')
    if (isDateCheck && joined) {
      const match = joined.match(/\b\d{1,2}[\s/.\-]+\d{1,2}[\s/.\-]+\d{2,4}\b/) || joined.match(/\b\d{6,8}\b/)
      if (match) {
        const norm = normalizeFecha(match[0])
        if (norm && /^\d{2}\/\d{2}\/\d{4}$/.test(norm)) meta.value = norm
      }
    }
    c.evidenceMetadata = meta
    c.evidenceText = joined
  }

  function setActiveEvidence(name: string, index: number) {
    setActive(name)
    activeEvidenceIndex.value = index
  }

  function addEvidenceFragment(name: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (!c) return
    const list = getEvidenceList(name).slice()
    // Materializa la casilla principal (fantasma) antes de agregar la secundaria.
    if (list.length === 0) list.push({ text: '', locked: false })
    list.push({ text: '', locked: false })
    applyEvidences(c, list)
    setActiveEvidence(name, list.length - 1)
  }

  // Solo elimina casillas secundarias (index > 0); la principal es obligatoria.
  function removeEvidenceFragment(name: string, index: number) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (!c || index <= 0) return
    const list = getEvidenceList(name).slice()
    if (index >= list.length) return
    list.splice(index, 1)
    applyEvidences(c, list)
    if (activeCriterionName.value === name && activeEvidenceIndex.value >= list.length) {
      activeEvidenceIndex.value = Math.max(0, list.length - 1)
    }
  }

  function toggleEvidenceLock(name: string, index: number) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (!c) return
    const list = getEvidenceList(name).slice()
    if (!list[index]) return
    list[index] = { ...list[index], locked: !list[index].locked }
    applyEvidences(c, list)
  }

  // Edición manual del texto de una casilla abierta.
  function setEvidenceFragmentText(name: string, index: number, text: string) {
    const c = criteria.value.find((c) => c.criterionName === name)
    if (!c) return
    const list = getEvidenceList(name).slice()
    // Materializa la casilla principal si aún no existía (criterio recién marcado).
    if (list.length === 0 && index === 0) list.push({ text: '', locked: false })
    if (!list[index] || list[index].locked) return
    list[index] = { ...list[index], text }
    applyEvidences(c, list)
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
      // HU-029: la selección se copia a la casilla activa SOLO si está abierta.
      // Si está cerrada (locked) o no hay casilla, no hace nada.
      const name = activeCriterionName.value
      const c = criteria.value.find((c) => c.criterionName === name)
      if (c) {
        const list = getEvidenceList(name).slice()
        if (list.length === 0) list.push({ text: '', locked: false })
        const idx = activeEvidenceIndex.value
        const target = list[idx]
        if (target && !target.locked) {
          list[idx] = { ...target, text }
          applyEvidences(c, list)
        }
      }
    } else if (activeClinicalField.value) {
      setClinical(activeClinicalField.value as keyof ClinicalData, text)
    } else if (activeMetadataField.value) {
      if (activeMetadataField.value === 'fechaIngresoHosp' || activeMetadataField.value === 'hospitalizacion.fecha_ingreso') {
        fechaIngresoHosp.value = text
        const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_ingreso')
        if (node) node.evidenceText = text
      }
      else if (activeMetadataField.value === 'fechaEgresoHosp' || activeMetadataField.value === 'hospitalizacion.fecha_egreso') {
        fechaEgresoHosp.value = text
        const node = criteria.value.find(c => c.criterionName === 'hospitalizacion.fecha_egreso')
        if (node) node.evidenceText = text
      }
      else if (activeMetadataField.value === 'fechaIngresoUci' || activeMetadataField.value === 'ingreso.fecha_ingreso_upc') {
        fechaIngresoUci.value = text
      }
      else if (activeMetadataField.value === 'fechaEgresoUci' || activeMetadataField.value === 'egreso.fecha_egreso_upc') {
        fechaEgresoUci.value = text
      }
      else if (activeMetadataField.value === 'comentarioFinal' || activeMetadataField.value === 'calidad.comentario') {
        comentarioFinal.value = text
        const node = criteria.value.find(c => c.criterionName === 'calidad.comentario')
        if (node) node.evidenceText = text
      }
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
      formVersion: formVersion.value,
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
          evidenceMetadata: { ...c.evidenceMetadata, formVersion: formVersion.value },
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
          evidenceMetadata: { ...c.evidenceMetadata, formVersion: formVersion.value },
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

  const persistenceEnabled = ref(true)

  function persistLocally() {
    if (!epicrisisId.value || !persistenceEnabled.value) return
    const toSave = {
      formVersion: formVersion.value,
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

    const defaults = defaultClinicalData()
    Object.keys(defaults).forEach((key) => {
      if (key !== 'vmiInicio' && key !== 'vmiFin') {
        (clinicalData.value as any)[key] = (defaults as any)[key]
      }
    })
    clinicalData.value.vmiInicio = ''
    clinicalData.value.vmiFin = ''
  }

  watch(criteria, persistLocally, { deep: true })
  watch(clinicalData, persistLocally, { deep: true })

  return {
    formVersion,
    formSchema,
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
    pendingBooleanCount,
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
    loadAdminReview,
    setActive,
    setActiveClinical,
    setActiveMetadata,
    setIsPresent,
    setEvidence,
    setComments,
    injectEvidenceToActive,
    activeEvidenceIndex,
    getEvidenceList,
    setActiveEvidence,
    addEvidenceFragment,
    removeEvidenceFragment,
    toggleEvidenceLock,
    setEvidenceFragmentText,
    isGlossaryOpen,
    glossaryActiveKey,
    openGlossary,
    closeGlossary,
    clearActive,
    clearGlobalSelection,
    saveProgress,
    submitFinal,
    fillRemainingAsNo,
    lockedKeys,
    isLocked,
    toggleLock,
    resetDescendants,
    countSiOrUnknownBelow,
    reset,
  }
})
