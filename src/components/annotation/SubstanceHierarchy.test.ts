import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SubstanceHierarchy from './SubstanceHierarchy.vue'
import { useAnnotationStore } from '@/stores/annotation'

function setup() {
  localStorage.clear()
  setActivePinia(createPinia())
  const store = useAnnotationStore()
  store.initForEpicrisis(1, null)
  return store
}

describe('SubstanceHierarchy — el detalle se dirige por los criterios (refactor limpio)', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('sin criterio de consumo en "Sí" muestra la pista y ningún detalle', () => {
    const store = setup()
    const w = mount(SubstanceHierarchy, { props: { isReadOnly: false } })
    expect(w.text()).toContain('Marca "Sí"')
    expect(w.findAll('select')).toHaveLength(0)
  })

  it('marcar consumo_tabaco = Sí muestra el detalle de tabaco (estado + IPA)', async () => {
    const store = setup()
    store.setIsPresent('consumo_tabaco', true)
    const w = mount(SubstanceHierarchy, { props: { isReadOnly: false } })
    expect(w.text()).toContain('Tabaco')
    expect(w.text()).toContain('Cigarrillos / día')
    expect(w.findAll('select').length).toBe(1)
  })

  it('cada sustancia aparece solo si SU criterio está en "Sí"', () => {
    const store = setup()
    store.setIsPresent('consumo_alcohol', true)
    const w = mount(SubstanceHierarchy, { props: { isReadOnly: false } })
    expect(w.text()).toContain('Alcohol')
    expect(w.text()).not.toContain('Cigarrillos / día') // tabaco no está en Sí
  })

  it('no usa toggles Sí/No propios (el gate es el criterio)', () => {
    const store = setup()
    store.setIsPresent('consumo_tabaco', true)
    const w = mount(SubstanceHierarchy, { props: { isReadOnly: false } })
    const btns = w.findAll('button').map(b => b.text())
    expect(btns).not.toContain('Sí')
    expect(btns).not.toContain('No')
  })
})
