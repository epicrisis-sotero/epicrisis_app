import { describe, it, expect } from 'vitest'
import { COMORBIDITIES } from './criteria'

describe('COMORBIDITIES', () => {
  it('ya NO contiene "abuso_sustancias"', () => {
    expect(COMORBIDITIES.some(c => c.name === 'abuso_sustancias')).toBe(false)
  })

  it('contiene los 3 criterios de consumo (tabaco/alcohol/otras)', () => {
    for (const n of ['consumo_tabaco', 'consumo_alcohol', 'consumo_otras']) {
      expect(COMORBIDITIES.some(c => c.name === n), `falta ${n}`).toBe(true)
    }
  })

  it('los nombres de criterio son únicos', () => {
    const names = COMORBIDITIES.map(c => c.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
