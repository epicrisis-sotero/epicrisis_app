import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ClinicalDataPanel from './ClinicalDataPanel.vue'
import { useAnnotationStore } from '@/stores/annotation'

function mountPanel() {
  const store = useAnnotationStore()
  store.initForEpicrisis(1, null)
  const wrapper = mount(ClinicalDataPanel, { props: { isReadOnly: false, searchQuery: '' } })
  return { wrapper, store }
}

function btnIn(section: any, text: string) {
  return section.findAll('button').find((b: any) => b.text() === text)
}

describe('ClinicalDataPanel — captura + toggle simétrico (HU-001/HU-003)', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('todas las secciones clínicas están dentro de [data-capture-zone]', () => {
    const { wrapper } = mountPanel()
    expect(wrapper.findAll('[data-capture-zone]').length).toBeGreaterThanOrEqual(9)
  })

  it('marcar "Sí" en VMI activa la captura de su evidencia (HU-003)', async () => {
    const { wrapper, store } = mountPanel()
    const vmi = wrapper.find('[data-clinical-section="ventilatorio"]')
    await btnIn(vmi, 'Sí').trigger('click')
    expect(store.clinicalData.vmi).toBe(true)
    expect(store.activeClinicalField).toBe('vmiEvidencia')
  })

  it('marcar "No" sobre el campo activo cierra la captura (toggle simétrico)', async () => {
    const { wrapper, store } = mountPanel()
    const vmi = wrapper.find('[data-clinical-section="ventilatorio"]')
    await btnIn(vmi, 'Sí').trigger('click')
    expect(store.activeClinicalField).toBe('vmiEvidencia')
    await btnIn(vmi, 'No').trigger('click')
    expect(store.clinicalData.vmi).toBe(false)
    expect(store.activeClinicalField).toBeNull()
  })

  it('Transfusión también activa captura al marcar "Sí" (campo estandarizado)', async () => {
    const { wrapper, store } = mountPanel()
    const tx = wrapper.find('[data-clinical-section="transfusion"]')
    await btnIn(tx, 'Sí').trigger('click')
    expect(store.clinicalData.transfusion).toBe(true)
    expect(store.activeClinicalField).toBe('transfusionEvidencia')
  })
})
