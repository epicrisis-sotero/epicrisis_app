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
    expect(s.criteria).toHaveLength(countNodes(FORM_SCHEMA))
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
})
