import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnotationStore } from './annotation'
import { COMORBIDITIES } from '@/constants/criteria'
import { FORM_SCHEMA } from '@/constants/formSchema'

const C0 = COMORBIDITIES[0].name

function countNodes(nodes: any[]): number {
  let count = 0
  function traverse(n: any) {
    count++
    if (n.children) n.children.forEach(traverse)
  }
  nodes.forEach(traverse)
  return count
}

describe('annotation store — captura y estado activo', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initForEpicrisis crea un criterio por comorbilidad', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    expect(s.criteria).toHaveLength(countNodes(s.formSchema))
    expect(s.criteria.every(c => c.isPresent === null || c.isPresent === false)).toBe(true)
  })

  it('clearActive limpia los 3 campos activos sin tocar la selección', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.selectedText = 'evidencia'
    s.hasSelection = true
    s.setActiveClinical('vmiEvidencia')
    expect(s.activeClinicalField).toBe('vmiEvidencia')
    s.clearActive()
    expect(s.activeCriterionName).toBeNull()
    expect(s.activeClinicalField).toBeNull()
    expect(s.activeMetadataField).toBeNull()
    // la selección NO se toca
    expect(s.selectedText).toBe('evidencia')
    expect(s.hasSelection).toBe(true)
  })

  it('los setters de activo son mutuamente excluyentes', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    expect(s.activeCriterionName).toBe(C0)
    s.setActiveClinical('vmiEvidencia')
    expect(s.activeCriterionName).toBeNull()
    expect(s.activeClinicalField).toBe('vmiEvidencia')
    s.setActiveMetadata('fechaIngresoHosp')
    expect(s.activeClinicalField).toBeNull()
    expect(s.activeMetadataField).toBe('fechaIngresoHosp')
  })

  it('injectEvidenceToActive inyecta en el criterio activo', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    s.injectEvidenceToActive('disnea de reposo')
    expect(s.criteria.find(c => c.criterionName === C0)!.evidenceText).toBe('disnea de reposo')
  })

  it('injectEvidenceToActive inyecta en el campo clínico activo', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActiveClinical('vmiEvidencia')
    s.injectEvidenceToActive('intubación 12/01')
    expect(s.clinicalData.vmiEvidencia).toBe('intubación 12/01')
  })

  it('injectEvidenceToActive inyecta en metadata (fecha) activa', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActiveMetadata('fechaIngresoHosp')
    s.injectEvidenceToActive('12/01/2026')
    expect(s.fechaIngresoHosp).toBe('12/01/2026')
  })

  it('marcar un criterio como "unknown" se refleja en el estado', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setIsPresent(C0, 'unknown')
    expect(s.criteria.find(c => c.criterionName === C0)!.isPresent).toBe('unknown')
  })
})

describe('revisión administrativa', () => {
  it('reemplaza respuestas por anotador sin contaminar el borrador local del admin', () => {
    const store = useAnnotationStore()
    store.initForEpicrisis(626, null)
    localStorage.removeItem('annotation_draft_626')

    store.loadAdminReview(626, [{
      criterionName: 'antecedentes.cardiovascular.hipertension_arterial', isPresent: true, evidenceText: 'HTA conocida', comments: 'Vicente',
    }], { fechaIngresoHosp: '28/11/2022', notes: 'nota privada' }, {}, null)

    expect(store.criteria.find(item => item.criterionName === 'antecedentes.cardiovascular.hipertension_arterial')?.isPresent).toBe(true)
    expect(store.fechaIngresoHosp).toBe('28/11/2022')
    expect(store.clinicalData.notes).toBe('nota privada')
    expect(localStorage.getItem('annotation_draft_626')).toBeNull()

    store.loadAdminReview(626, [{
      criterionName: 'antecedentes.cardiovascular.hipertension_arterial', isPresent: false, evidenceText: null, comments: 'Matías',
    }], null, {}, null)

    expect(store.criteria.find(item => item.criterionName === 'antecedentes.cardiovascular.hipertension_arterial')?.isPresent).toBe(false)
    expect(store.fechaIngresoHosp).toBe('')
    expect(store.clinicalData.notes).toBe('')
    expect(localStorage.getItem('annotation_draft_626')).toBeNull()
  })
})

// HU-001 (anotador) — cierre automático del modo captura.
// Verifica el mecanismo del store detrás de captureEvidence() y del listener
// click-outside (handleCaptureOutsideClick) de AnnotationView.
describe('HU-001 cierre automático de captura', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('criterio 2: tras inyectar la evidencia, clearActive cierra el modo (la evidencia persiste)', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    // secuencia de captureEvidence(): activar → inyectar → clearActive
    s.setActiveClinical('vmiEvidencia')
    s.injectEvidenceToActive('intubación 12/01')
    s.clearActive()
    expect(s.clinicalData.vmiEvidencia).toBe('intubación 12/01') // persiste
    expect(s.activeClinicalField).toBeNull()                     // modo cerrado
  })

  it('criterio 3: cerrar el modo NO descarta la selección de texto', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.selectedText = 'fragmento del documento'
    s.hasSelection = true
    s.setActive(C0)
    s.clearActive()
    expect(s.selectedText).toBe('fragmento del documento')
    expect(s.hasSelection).toBe(true)
  })
})

// HU-013 — notas del anotador (persisten vía clinicalData)
describe('HU-013 notas del anotador', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('notes arranca vacío y se puede editar', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    expect(s.clinicalData.notes).toBe('')
    s.setClinical('notes', 'paciente complejo, revisar sepsis')
    expect(s.clinicalData.notes).toBe('paciente complejo, revisar sepsis')
  })

  it('totalProgress expone completados/total/porcentaje para la barra', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    const p = s.totalProgress
    expect(p).toHaveProperty('completed')
    expect(p).toHaveProperty('total')
    expect(p).toHaveProperty('percentage')
    expect(p.total).toBeGreaterThan(0)
    expect(p.percentage).toBeGreaterThanOrEqual(0)
  })

  it('no exige fechas ni textos ocultos cuando su variable madre está en No', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(626, null)

    s.setIsPresent('soporte.respiratorio.vmi', true)
    const activeTotal = s.totalProgress.total
    s.setIsPresent('soporte.respiratorio.vmi', false)

    const conditionalKeys = [
      'soporte.respiratorio.vmi.fecha_inicio',
      'soporte.respiratorio.vmi.fecha_termino',
      'soporte.respiratorio.vmi.motivo',
    ]
    expect(s.totalProgress.total).toBe(activeTotal - conditionalKeys.length)
    expect(s.missingItems.map(item => item.key)).not.toEqual(
      expect.arrayContaining(conditionalKeys),
    )
  })

  it('todo No permite completar sin inventar datos en subcampos condicionales', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(626, null)
    s.fillRemainingAsNo()

    const textValues: Record<string, string> = {
      'hospitalizacion.fecha_ingreso': '28/11/2022',
      'hospitalizacion.fecha_egreso': '21/01/2023',
      'ingreso.fecha_ingreso_upc': '28/11/2022',
      'egreso.fecha_egreso_upc': '21/01/2023',
      'egreso.diagnostico': 'Shock hipovolémico',
      'calidad.comentario': 'Prueba de formulario',
    }
    for (const [key, value] of Object.entries(textValues)) s.setEvidence(key, value)

    const selectValues: Record<string, string> = {
      'ingreso.unidad_origen': 'Urgencia',
      'egreso.estado_vital': 'Fallecido',
      'egreso.destino': 'Sala común / otra unidad',
      'calidad.global': 'confiable',
    }
    for (const [key, value] of Object.entries(selectValues)) {
      const criterion = s.criteria.find(c => c.criterionName === key)!
      criterion.evidenceMetadata = { value }
    }

    expect(s.missingItems).toEqual([])
    expect(s.isComplete).toBe(true)
  })
})

describe('Sincronización de fechas bidireccional y auto-fill', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('sincroniza hospitalizacion.fecha_ingreso y hospitalizacion.fecha_egreso de criteria a store refs', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    
    // Set evidence on the criteria nodes
    s.setEvidence('hospitalizacion.fecha_ingreso', '27/07/2022')
    s.setEvidence('hospitalizacion.fecha_egreso', '30/12/2022')
    
    // Check values
    expect(s.fechaIngresoHosp).toBe('27/07/2022')
    expect(s.fechaEgresoHosp).toBe('30/12/2022')
  })

  it('sincroniza store refs de fechas a los correspondientes criteria nodes', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    
    s.fechaIngresoHosp = '01/01/2023'
    s.fechaEgresoHosp = '10/01/2023'
    
    expect(s.criteria.find(c => c.criterionName === 'hospitalizacion.fecha_ingreso')?.evidenceText).toBe('01/01/2023')
    expect(s.criteria.find(c => c.criterionName === 'hospitalizacion.fecha_egreso')?.evidenceText).toBe('10/01/2023')
  })

  it('sincroniza ingreso.fecha_ingreso_upc y egreso.fecha_egreso_upc a fechaIngresoUci y fechaEgresoUci', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    
    const nodeIng = s.criteria.find(c => c.criterionName === 'ingreso.fecha_ingreso_upc')!
    nodeIng.isPresent = true
    nodeIng.evidenceMetadata = { value: '28/07/2022' }
    
    const nodeEgr = s.criteria.find(c => c.criterionName === 'egreso.fecha_egreso_upc')!
    nodeEgr.isPresent = true
    nodeEgr.evidenceMetadata = { value: '29/12/2022' }
    
    // Trigger deep watch
    s.criteria = [...s.criteria]
    
    expect(s.fechaIngresoUci).toBe('28/07/2022')
    expect(s.fechaEgresoUci).toBe('29/12/2022')
  })

  it('auto-completa evidenceMetadata.value cuando se captura evidencia que contiene una fecha', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    
    s.setEvidence('ingreso.fecha_ingreso_upc', 'Ingresó a UCI el 27 07 2022')
    
    const node = s.criteria.find(c => c.criterionName === 'ingreso.fecha_ingreso_upc')!
    expect(node.evidenceMetadata?.value).toBe('27/07/2022')
  })

  it('loadFromServer preserva valores de epicrisisData si no vienen en la lista del servidor', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null, {
      fechaIngresoHosp: '27/07/2022',
      fechaEgresoHosp: '30/12/2022',
      clinicalData: { vmiInicio: '15/08/2022' }
    } as any)

    expect(s.fechaIngresoHosp).toBe('27/07/2022')
    expect(s.clinicalData.vmiInicio).toBe('15/08/2022')

    // Cargar del servidor una lista que NO contiene hospitalizacion.fecha_ingreso ni vmiInicio
    s.loadFromServer([
      {
        criterionName: 'hospitalizacion.fecha_egreso',
        isPresent: true,
        evidenceText: '30/12/2022',
        comments: null
      }
    ], null)

    // Se deben conservar los datos previos que no fueron sobreescritos por el servidor
    expect(s.fechaIngresoHosp).toBe('27/07/2022')
    expect(s.fechaEgresoHosp).toBe('30/12/2022')
    expect(s.clinicalData.vmiInicio).toBe('15/08/2022')
  })
})

// HU-032 — Inicio en blanco con propagación jerárquica
describe('HU-032 inicio en blanco y propagación en cascada', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('buildInitial inicializa todas las variables en null (no false)', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    // All leaf and mother nodes should start as null
    const allLeafMother = s.criteria.filter(c => {
      const node = FORM_SCHEMA.flatMap(function flatChildren(n: any): any[] {
        return [n, ...(n.children || []).flatMap(flatChildren)]
      }).find((n: any) => n.key === c.criterionName)
      return node && (node.type === 'leaf' || node.type === 'mother')
    })
    expect(allLeafMother.every(c => c.isPresent === null)).toBe(true)
  })

  it('marcar madre como No propaga No a todas las hijas', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    // Mark a mother node (antecedentes.cardiovascular) as No
    s.setIsPresent('antecedentes.cardiovascular', false)
    // All children should be false
    const hta = s.criteria.find(c => c.criterionName === 'antecedentes.cardiovascular.hipertension_arterial')!
    const ec = s.criteria.find(c => c.criterionName === 'antecedentes.cardiovascular.enfermedad_coronaria')!
    expect(hta.isPresent).toBe(false)
    expect(ec.isPresent).toBe(false)
  })

  it('marcar madre como Sí resetea hijas a null para revisión individual', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    // First set mother to No (cascades children to false)
    s.setIsPresent('antecedentes.cardiovascular', false)
    // Then switch to Sí (children should go back to null)
    s.setIsPresent('antecedentes.cardiovascular', true)
    const hta = s.criteria.find(c => c.criterionName === 'antecedentes.cardiovascular.hipertension_arterial')!
    expect(hta.isPresent).toBeNull()
  })

  it('fillRemainingAsNo convierte solo preguntas booleanas y no campos de texto/fecha/select', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    // Mark just one node as Sí
    s.setIsPresent('antecedentes.cardiovascular.hipertension_arterial', true)
    const filled = s.fillRemainingAsNo()
    expect(filled).toBeGreaterThan(0)
    expect(s.pendingBooleanCount).toBe(0)
    expect(s.criteria.find(c => c.criterionName === 'egreso.diagnostico')?.isPresent).toBeNull()
    // The one we set to true should remain true
    const hta = s.criteria.find(c => c.criterionName === 'antecedentes.cardiovascular.hipertension_arterial')!
    expect(hta.isPresent).toBe(true)
  })
})

// HU-029 — captura y gestión de múltiples evidencias (ground truth)
describe('HU-029 múltiples fragmentos de evidencia', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('la captura escribe en la casilla activa abierta y deriva evidenceText', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    s.injectEvidenceToActive('fragmento uno')
    expect(s.getEvidenceList(C0)).toEqual([{ text: 'fragmento uno', locked: false }])
    expect(s.criteria.find(c => c.criterionName === C0)!.evidenceText).toBe('fragmento uno')
  })

  it('[+] agrega una casilla secundaria, la activa, y captura en ella', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    s.injectEvidenceToActive('principal')
    s.addEvidenceFragment(C0)
    expect(s.activeEvidenceIndex).toBe(1)
    s.injectEvidenceToActive('secundario')
    const list = s.getEvidenceList(C0)
    expect(list).toHaveLength(2)
    expect(list[1].text).toBe('secundario')
    // evidenceText = join de los fragmentos
    expect(s.criteria.find(c => c.criterionName === C0)!.evidenceText).toBe('principal | secundario')
  })

  it('una casilla cerrada (candado) NO recibe la captura', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    s.injectEvidenceToActive('confirmado')
    s.toggleEvidenceLock(C0, 0) // cerrar candado
    s.injectEvidenceToActive('intento de sobrescribir')
    expect(s.getEvidenceList(C0)[0]).toEqual({ text: 'confirmado', locked: true })
  })

  it('sin criterio activo, la captura no hace nada', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.clearActive()
    s.injectEvidenceToActive('flotante')
    expect(s.getEvidenceList(C0)).toEqual([])
  })

  it('[-] elimina secundarias pero la principal (índice 0) es intocable', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setActive(C0)
    s.injectEvidenceToActive('principal')
    s.addEvidenceFragment(C0)
    s.injectEvidenceToActive('secundario')
    s.removeEvidenceFragment(C0, 1)
    expect(s.getEvidenceList(C0)).toHaveLength(1)
    // intentar eliminar la principal no hace nada
    s.removeEvidenceFragment(C0, 0)
    expect(s.getEvidenceList(C0)).toHaveLength(1)
  })

  it('migra el evidenceText legacy a un fragmento cerrado', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setEvidence(C0, 'evidencia guardada antes')
    expect(s.getEvidenceList(C0)).toEqual([{ text: 'evidencia guardada antes', locked: true }])
  })
})

// HU-039 — corregir tipos de campos que pedían Sí/No y deberían capturar un dato
describe('HU-039 tipos de campos (Egreso/Ingreso/Soporte)', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  function nodeByKey(key: string): any {
    let found: any = null
    const walk = (n: any) => { if (n.key === key) found = n; (n.children || []).forEach(walk) }
    FORM_SCHEMA.forEach(walk)
    return found
  }

  it('los campos de Egreso/Ingreso tienen el tipo correcto (no leaf)', () => {
    expect(nodeByKey('egreso.fecha_egreso_upc').type).toBe('date')
    expect(nodeByKey('egreso.estado_vital').type).toBe('select')
    expect(nodeByKey('egreso.estado_vital').choices).toEqual(['Vivo', 'Fallecido'])
    expect(nodeByKey('egreso.destino').type).toBe('select')
    expect(nodeByKey('egreso.diagnostico').type).toBe('text')
    expect(nodeByKey('ingreso.fecha_ingreso_upc').type).toBe('date')
    expect(nodeByKey('ingreso.unidad_origen').type).toBe('select')
    expect(nodeByKey('ingreso.diagnostico.principal').type).toBe('text')
    expect(nodeByKey('soporte.reanimacion.ritmo_inicial').type).toBe('select')
    expect(nodeByKey('soporte.respiratorio.vmi.fecha_inicio').type).toBe('date')
    // reingreso se mantiene como leaf (Sí/No)
    expect(nodeByKey('egreso.reingreso_upc').type).toBe('leaf')
  })

  it('migra una fecha legacy (metadata.value) a evidenceText al cargar del servidor', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.loadFromServer([
      { criterionName: 'egreso.fecha_egreso_upc', isPresent: true, evidenceText: null, comments: null, evidenceMetadata: { value: '30/12/2022' } } as any,
    ], null)
    const node = s.criteria.find(c => c.criterionName === 'egreso.fecha_egreso_upc')!
    expect(node.evidenceText).toBe('30/12/2022') // migrado a evidenceText
    expect(s.fechaEgresoUci).toBe('30/12/2022')
  })

  it('el getter de fecha de UPC escribe en evidenceText (nuevo modelo date)', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.fechaIngresoUci = '05/05/2026'
    expect(s.criteria.find(c => c.criterionName === 'ingreso.fecha_ingreso_upc')!.evidenceText).toBe('05/05/2026')
  })
})

// HU-044 — cascada no destructiva, invariante de subida, candado y reset
describe('HU-044 cascada, invariante y candados', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  const ANTEC = 'antecedentes'
  const CARDIO = 'antecedentes.cardiovascular'
  const HTA = 'antecedentes.cardiovascular.hipertension_arterial'
  const CORONARIA = 'antecedentes.cardiovascular.enfermedad_coronaria'
  const ACV = 'antecedentes.cardiovascular.accidente_cerebrovascular_previo'
  const RENAL_ERC = 'antecedentes.renal.enfermedad_renal_cronica'
  const DM_COMPLICADA = 'antecedentes.metabolico_endocrino.diabetes_mellitus.complicada'

  function get(s: any, key: string) {
    return s.criteria.find((c: any) => c.criterionName === key)!
  }

  // ── R1: la cascada No solo escribe sobre lo que está en blanco ──
  it('R1: No baja solo a los descendientes en blanco', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = true

    s.setIsPresent(CARDIO, false)

    expect(get(s, HTA).isPresent).toBe(true)              // auto-bloqueada
    expect(get(s, CORONARIA).isPresent).toBe(false)       // estaba en blanco
  })

  it('R1: la cascada no borra evidencia de nadie', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    const hta = get(s, HTA)
    hta.isPresent = true
    hta.evidenceText = 'paciente hipertenso'
    hta.comments = 'confirmado'
    hta.evidenceMetadata = { value: 'x' }

    s.setIsPresent(CARDIO, false)

    expect(hta.evidenceText).toBe('paciente hipertenso')
    expect(hta.comments).toBe('confirmado')
    expect(hta.evidenceMetadata).toEqual({ value: 'x' })
  })

  it('R1: un ? también queda protegido de la cascada', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = 'unknown'

    s.setIsPresent(CARDIO, false)

    expect(get(s, HTA).isPresent).toBe('unknown')
  })

  // ── R2: el Sí conserva, salvo que todo esté en No ──
  it('R2: con estados mezclados, marcar Sí deja los hijos tal cual', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = false
    get(s, CORONARIA).isPresent = false
    // ACV y el resto siguen en blanco

    s.setIsPresent(CARDIO, true)

    expect(get(s, HTA).isPresent).toBe(false)
    expect(get(s, CORONARIA).isPresent).toBe(false)
    expect(get(s, ACV).isPresent).toBeNull()
  })

  it('R2: si TODO el subárbol está en No, marcar Sí lo resetea a blanco', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setIsPresent(CARDIO, false) // deja todo el subárbol en No

    s.setIsPresent(CARDIO, true)

    expect(get(s, HTA).isPresent).toBeNull()
    expect(get(s, ACV).isPresent).toBeNull()
  })

  it('R2: la comprobación mira todo el subárbol, no solo los hijos directos', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.setIsPresent(ANTEC, false)
    // una variable profunda deja de estar en No → ya no se cumple "todo en No"
    get(s, DM_COMPLICADA).isPresent = null

    s.setIsPresent(ANTEC, true)

    expect(get(s, HTA).isPresent).toBe(false) // no se reseteó nada
  })

  // ── R3: invariante de subida ──
  it('R3: marcar un nieto Sí promueve a madre y abuela', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)

    s.setIsPresent(HTA, true)

    expect(get(s, CARDIO).isPresent).toBe(true)
    expect(get(s, 'antecedentes.medicos').isPresent).toBe(true)
    expect(get(s, ANTEC).isPresent).toBe(true)
  })

  it('R3: un ? abajo promueve igual que un Sí', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)

    s.setIsPresent(HTA, 'unknown')

    expect(get(s, CARDIO).isPresent).toBe(true)
  })

  it('R3 es invariante: se reevalúa aunque el Sí venga de antes', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = true // puesto a mano, sin pasar por setIsPresent

    s.setIsPresent(RENAL_ERC, false) // cualquier cambio dispara el invariante

    expect(get(s, CARDIO).isPresent).toBe(true)
  })

  // ── El rebote ──
  it('rebote: marcar No con un Sí abajo deja la sección en Sí y marca el resto', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = true

    s.setIsPresent(CARDIO, false)

    expect(get(s, CARDIO).isPresent).toBe(true)        // rebotó
    expect(get(s, CORONARIA).isPresent).toBe(false)    // el resto sí quedó en No
    expect(s.countSiOrUnknownBelow(CARDIO)).toBe(1)
  })

  // ── Candado manual ──
  it('candado: la cascada no cruza una sección bloqueada', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.toggleLock(CARDIO)

    s.setIsPresent(ANTEC, false)

    expect(get(s, HTA).isPresent).toBeNull()           // congelada
    expect(get(s, RENAL_ERC).isPresent).toBe(false)    // rama sin candado sí cambió
  })

  it('candado: un Sí encerrado no promueve por encima del candado', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.toggleLock(CARDIO)

    s.setIsPresent(HTA, true)

    expect(get(s, ANTEC).isPresent).not.toBe(true)
  })

  it('candado: abrirlo no dispara nada retroactivo', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.toggleLock(CARDIO)
    s.setIsPresent(ANTEC, false)
    expect(get(s, HTA).isPresent).toBeNull()

    s.toggleLock(CARDIO) // desbloquear

    expect(get(s, HTA).isPresent).toBeNull() // sigue igual
  })

  it('candado: toggleLock alterna y isLocked lo refleja', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    expect(s.isLocked(CARDIO)).toBe(false)
    expect(s.toggleLock(CARDIO)).toBe(true)
    expect(s.isLocked(CARDIO)).toBe(true)
    expect(s.toggleLock(CARDIO)).toBe(false)
  })

  // ── R4: reset ──
  it('R4: el reset deja el subárbol en blanco, incluso lo auto-bloqueado', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = true
    get(s, CORONARIA).isPresent = false

    const cleared = s.resetDescendants(CARDIO)

    expect(cleared).toBeGreaterThan(0)
    expect(get(s, HTA).isPresent).toBeNull()
    expect(get(s, CORONARIA).isPresent).toBeNull()
  })

  it('R4: el reset respeta el candado manual', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    get(s, HTA).isPresent = true
    s.toggleLock(CARDIO)

    s.resetDescendants(ANTEC)

    expect(get(s, HTA).isPresent).toBe(true)
  })

  it('R4: el reset no borra evidencia', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    const hta = get(s, HTA)
    hta.isPresent = true
    hta.evidenceText = 'hipertenso'

    s.resetDescendants(CARDIO)

    expect(hta.isPresent).toBeNull()
    expect(hta.evidenceText).toBe('hipertenso')
  })
})
