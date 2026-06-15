import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ClinicalDataPanel from './ClinicalDataPanel.vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'

function mountWith(seed?: Partial<ClinicalData>) {
  const store = useAnnotationStore()
  store.initForEpicrisis(1, null)
  if (seed) for (const [k, v] of Object.entries(seed)) store.setClinical(k as keyof ClinicalData, v as any)
  const wrapper = mount(ClinicalDataPanel, { props: { isReadOnly: false, searchQuery: '' } })
  return { wrapper, store }
}

describe('HU-003 árbol de infecciones y sepsis', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('la sección de infecciones incluye Sepsis (campo transversal)', () => {
    const { wrapper } = mountWith()
    expect(wrapper.find('[data-clinical-section="infecciones"]').text()).toContain('Sepsis')
  })

  it('foco Urinario en "Sí" despliega el tipo (Cistitis / Pielonefritis)', () => {
    const { wrapper } = mountWith({ infeccionUrinario: true })
    const txt = wrapper.find('[data-clinical-section="infecciones"]').text()
    expect(txt).toContain('Cistitis')
    expect(txt).toContain('Pielonefritis')
    // un foco sin tipo seleccionado no muestra el de otro foco
    expect(txt).not.toContain('Neumonía')
  })

  it('foco Respiratorio en "Sí" despliega su tipo (Neumonía / NAV)', () => {
    const { wrapper } = mountWith({ infeccionRespiratorio: true })
    const txt = wrapper.find('[data-clinical-section="infecciones"]').text()
    expect(txt).toContain('Neumonía')
    expect(txt).toContain('NAV')
  })

  it('foco Sangre en "Sí" ofrece marcar contaminación de cultivo', () => {
    const { wrapper } = mountWith({ infeccionSangre: true })
    expect(wrapper.find('[data-clinical-section="infecciones"]').text()).toContain('Contaminación')
  })

  it('un foco sin tipo (Cerebral) NO despliega selector de tipo al marcarlo', () => {
    const { wrapper } = mountWith({ infeccionCerebral: true })
    const txt = wrapper.find('[data-clinical-section="infecciones"]').text()
    expect(txt).not.toContain('Cistitis')
    expect(txt).not.toContain('Neumonía')
  })
})
