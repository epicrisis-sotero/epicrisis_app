import { describe, it, expect } from 'vitest'
import { normalizeFecha } from './fecha'

describe('normalizeFecha (HU-008) — ingreso flexible de fechas', () => {
  it('separadores con espacios y año de 2 dígitos: "22 03 22" → "22/03/2022"', () => {
    expect(normalizeFecha('22 03 22')).toBe('22/03/2022')
  })

  it('respeta DD/MM/AAAA ya correcto', () => {
    expect(normalizeFecha('22/03/2022')).toBe('22/03/2022')
  })

  it('rellena día/mes de 1 dígito: "1/2/2023" → "01/02/2023"', () => {
    expect(normalizeFecha('1/2/2023')).toBe('01/02/2023')
  })

  it('pivote de año: ≤50 → 20YY, >50 → 19YY', () => {
    expect(normalizeFecha('5-6-23')).toBe('05/06/2023')
    expect(normalizeFecha('5-6-99')).toBe('05/06/1999')
    expect(normalizeFecha('1.1.50')).toBe('01/01/2050')
    expect(normalizeFecha('1.1.51')).toBe('01/01/1951')
  })

  it('acepta separador punto: "5.6.2023" → "05/06/2023"', () => {
    expect(normalizeFecha('5.6.2023')).toBe('05/06/2023')
  })

  it('texto no interpretable se devuelve sin cambios (no bloquea)', () => {
    expect(normalizeFecha('ver epicrisis')).toBe('ver epicrisis')
    expect(normalizeFecha('')).toBe('')
    expect(normalizeFecha('22/03')).toBe('22/03') // solo 2 partes
  })
})
