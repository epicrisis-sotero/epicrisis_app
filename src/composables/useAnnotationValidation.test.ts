import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnotationStore } from '@/stores/annotation'
import { useAnnotationValidation } from './useAnnotationValidation'

function setup() {
  localStorage.clear()
  setActivePinia(createPinia())
  const store = useAnnotationStore()
  store.initForEpicrisis(1, null)
  const v = useAnnotationValidation()
  return { store, v }
}

describe('useAnnotationValidation', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('detecta inversión de fechas hospitalarias como error', () => {
    const { store, v } = setup()
    store.fechaIngresoHosp = '10/02/2026'
    store.fechaEgresoHosp = '01/02/2026'
    expect(v.hasErrors()).toBe(true)
    expect(v.getViolations().some(r => r.id === 'hosp_order')).toBe(true)
  })

  it('unidades de transfusión negativas es error', () => {
    const { store, v } = setup()
    store.clinicalData.transfusionUnidades = -2
    expect(v.getViolations().some(r => r.id === 'transfusion_unidades_positive')).toBe(true)
  })

  it('sin problemas → no hay violaciones', () => {
    const { v } = setup()
    expect(v.getViolations()).toHaveLength(0)
    expect(v.hasErrors()).toBe(false)
  })

  it('HU-003: "Sí" en condición crítica sin evidencia → warning (no bloquea)', () => {
    const { store, v } = setup()
    store.clinicalData.vmi = true
    store.clinicalData.vmiEvidencia = ''
    const violations = v.getViolations()
    const rule = violations.find(r => r.id === 'critical_yes_without_evidence')
    expect(rule).toBeTruthy()
    expect(rule!.severity).toBe('warning')
    // es warning, no error → no bloquea el envío
    expect(v.hasErrors()).toBe(false)
  })

  it('HU-003: con evidencia capturada, el warning desaparece', () => {
    const { store, v } = setup()
    store.clinicalData.vmi = true
    store.clinicalData.vmiEvidencia = 'intubado el 12/01'
    expect(v.getViolations().some(r => r.id === 'critical_yes_without_evidence')).toBe(false)
  })

  it('HU-003: marcar "No" o null NO dispara el warning', () => {
    const { store, v } = setup()
    store.clinicalData.transfusion = false
    store.clinicalData.trr = null
    expect(v.getViolations().some(r => r.id === 'critical_yes_without_evidence')).toBe(false)
  })

  it('la regla de evidencia es no-reactiva (solo se evalúa al enviar)', () => {
    const { v } = setup()
    const rule = v.rules.find(r => r.id === 'critical_yes_without_evidence')!
    expect(rule.reactive).toBe(false)
  })

  // HU-014: la condición crítica ahora es "fallecimiento" (no "mortalidad")
  it('HU-014: "fallecimiento" Sí sin evidencia dispara el warning; "mortalidad" ya no', () => {
    const { store, v } = setup()
    store.clinicalData.fallecimiento = true
    store.clinicalData.fallecimientoEvidencia = ''
    expect(v.getViolations().some(r => r.id === 'critical_yes_without_evidence')).toBe(true)

    // limpiar fallecimiento; marcar solo la columna legacy mortalidad → NO dispara
    store.clinicalData.fallecimiento = null
    store.clinicalData.mortalidad = true
    store.clinicalData.mortalidadEvidencia = ''
    expect(v.getViolations().some(r => r.id === 'critical_yes_without_evidence')).toBe(false)
  })
})
