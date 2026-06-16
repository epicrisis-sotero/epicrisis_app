import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CriterionRow from './CriterionRow.vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { Criterion } from '@/constants/criteria'
import type { CriterionState } from '@/stores/annotation'

function setup() {
  localStorage.clear()
  setActivePinia(createPinia())
  const store = useAnnotationStore()
  store.initForEpicrisis(1, null)
  return store
}

const metaTabaco: Criterion = { name: 'consumo_tabaco', label: 'Consumo de Tabaco', icd10Hint: 'F17' }
const metaAlcohol: Criterion = { name: 'consumo_alcohol', label: 'Consumo de Alcohol', icd10Hint: 'F10' }

describe('CriterionRow — Detalles de Sustancias Inline', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  it('sin criterio de consumo en "Sí" no muestra campos de detalle', () => {
    const store = setup()
    const state: CriterionState = {
      criterionName: 'consumo_tabaco',
      isPresent: null,
      evidenceText: '',
      comments: '',
      difficulty: null,
      difficultyNotes: '',
      llm: null
    }
    const w = mount(CriterionRow, {
      props: {
        meta: metaTabaco,
        state,
        isActive: false,
        isReadOnly: false
      }
    })
    expect(w.text()).not.toContain('Detalles de consumo')
    expect(w.findAll('select')).toHaveLength(0)
  })

  it('marcar consumo_tabaco = Sí muestra el detalle de tabaco (estado + IPA)', () => {
    const store = setup()
    const state: CriterionState = {
      criterionName: 'consumo_tabaco',
      isPresent: true,
      evidenceText: '',
      comments: '',
      difficulty: null,
      difficultyNotes: '',
      llm: null
    }
    const w = mount(CriterionRow, {
      props: {
        meta: metaTabaco,
        state,
        isActive: false,
        isReadOnly: false
      }
    })
    expect(w.text()).toContain('Detalles de consumo (Tabaco)')
    expect(w.text()).toContain('Cigarrillos / día')
    expect(w.findAll('select').length).toBe(1)
  })

  it('marcar consumo_alcohol = Sí muestra el detalle de alcohol', () => {
    const store = setup()
    const state: CriterionState = {
      criterionName: 'consumo_alcohol',
      isPresent: true,
      evidenceText: '',
      comments: '',
      difficulty: null,
      difficultyNotes: '',
      llm: null
    }
    const w = mount(CriterionRow, {
      props: {
        meta: metaAlcohol,
        state,
        isActive: false,
        isReadOnly: false
      }
    })
    expect(w.text()).toContain('Detalles de consumo (Alcohol)')
    expect(w.text()).not.toContain('Cigarrillos / día')
  })
})
