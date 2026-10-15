import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { FORM_SCHEMA, V3_LEAF_VARIABLES, isBooleanNode, type FormNode } from './formSchema'
import { GLOSARIO_DEFINICIONES } from './glosario.generated'
import { useAnnotationStore } from '@/stores/annotation'

// HU-047 — subcategoría Psiquiátrico dentro de Antecedentes médicos

const PSIQ = 'antecedentes.psiquiatrico'

const HOJAS = [
  'antecedentes.psiquiatrico.depresion',
  'antecedentes.psiquiatrico.ansiedad',
  'antecedentes.psiquiatrico.trastorno_bipolar',
  'antecedentes.psiquiatrico.esquizofrenia_otro_psicotico',
  'antecedentes.psiquiatrico.trastorno_consumo_sustancias',
  'antecedentes.psiquiatrico.intento_suicidio_previo',
  'antecedentes.psiquiatrico.trastorno_personalidad',
  'antecedentes.psiquiatrico.uso_cronico_psicofarmacos',
  'antecedentes.psiquiatrico.otra_psiquiatrica'
]

function flatten(nodes: FormNode[]): FormNode[] {
  return nodes.flatMap(n => [n, ...flatten(n.children ?? [])])
}

const TODOS = flatten(FORM_SCHEMA)

function find(key: string): FormNode | undefined {
  return TODOS.find(n => n.key === key)
}

describe('HU-047 subgrupo Psiquiátrico en el schema', () => {
  it('cuelga de Antecedentes médicos, entre Neurológico y Otro antecedente médico', () => {
    const medicos = find('antecedentes.medicos')!
    const keys = medicos.children!.map(c => c.key)
    expect(keys).toContain(PSIQ)
    expect(keys.indexOf(PSIQ)).toBe(keys.indexOf('antecedentes.neurologico') + 1)
    expect(keys.indexOf(PSIQ)).toBe(keys.indexOf('antecedentes.otro_antecedente_medico') - 1)
  })

  it('es una madre con toggle Sí/No/?, como sus hermanas por sistema', () => {
    const psiq = find(PSIQ)!
    expect(psiq.type).toBe('mother')
    expect(isBooleanNode(psiq)).toBe(true)
  })

  it('tiene las nueve hojas esperadas, en orden', () => {
    const psiq = find(PSIQ)!
    expect(psiq.children!.map(c => c.key)).toEqual(HOJAS)
    expect(psiq.children!.every(c => c.type === 'leaf')).toBe(true)
  })

  it('las nueve cuentan para el progreso', () => {
    const hojas = V3_LEAF_VARIABLES.map(n => n.key)
    for (const key of HOJAS) {
      expect(hojas, `falta ${key} en V3_LEAF_VARIABLES`).toContain(key)
    }
  })

  it('todas tienen CIE-10 salvo "Otra psiquiátrica"', () => {
    const psiq = find(PSIQ)!
    for (const hija of psiq.children!) {
      const esperado = hija.key !== 'antecedentes.psiquiatrico.otra_psiquiatrica'
      expect(!!hija.icd10Hint, `${hija.key} icd10Hint`).toBe(esperado)
    }
  })

  it('no rompe "Otro antecedente médico": conserva su key y pasa a 2.1.11', () => {
    const otro = find('antecedentes.otro_antecedente_medico')!
    expect(otro.id).toBe('2.1.11')
    expect(otro.type).toBe('leaf')
  })

  it('las keys del schema siguen siendo únicas', () => {
    const keys = TODOS.map(n => n.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('las nueve tienen definición en el glosario generado', () => {
    for (const key of HOJAS) {
      expect(GLOSARIO_DEFINICIONES[key], `falta definición de ${key} — ¿corriste sync-glosario?`).toBeTruthy()
    }
  })
})

describe('HU-047 comportamiento conservado en el formulario anterior', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })

  function get(s: any, key: string) {
    return s.criteria.find((c: any) => c.criterionName === key)!
  }

  it('el store crea un criterio para el subgrupo y sus nueve hojas, en blanco', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.loadFromServer([{ criterionName: PSIQ, isPresent: null, evidenceText: null, comments: null }], null)
    expect(get(s, PSIQ).isPresent).toBeNull()
    for (const key of HOJAS) {
      expect(get(s, key), `falta criterio ${key}`).toBeTruthy()
      expect(get(s, key).isPresent).toBeNull()
    }
  })

  it('marcar el subgrupo como No propaga No a las nueve hojas', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.loadFromServer([{ criterionName: PSIQ, isPresent: null, evidenceText: null, comments: null }], null)
    s.setIsPresent(PSIQ, false)
    for (const key of HOJAS) {
      expect(get(s, key).isPresent, `${key} no recibió la cascada`).toBe(false)
    }
  })

  it('las nueve entran al denominador del progreso', () => {
    const s = useAnnotationStore()
    s.initForEpicrisis(1, null)
    s.loadFromServer([{ criterionName: PSIQ, isPresent: null, evidenceText: null, comments: null }], null)
    const antes = s.totalProgress.completed
    s.setIsPresent(PSIQ, false)
    // el subgrupo no es hoja: los 9 completados son las hojas
    expect(s.totalProgress.completed).toBe(antes + HOJAS.length)
  })
})
