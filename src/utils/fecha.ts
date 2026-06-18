// HU-008: normaliza una fecha tecleada de forma flexible a `DD/MM/AAAA`.
// Acepta separadores `/  -  .` o espacios, y año de 2 o 4 dígitos.
// Año < 100: <= 50 → 20YY ; > 50 → 19YY (contexto de UCI reciente).
// Si no se puede interpretar como fecha de 3 partes, devuelve el texto tal cual
// (no bloquea el ingreso; la validación de fechas se encarga de errores lógicos).
export function normalizeFecha(input: string): string {
  if (!input) return ''
  const raw = input.trim()
  const parts = raw.split(/[\s/.\-]+/).filter(Boolean)
  if (parts.length !== 3) return raw

  const [d, m, y] = parts
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{1,4}$/.test(y)) return raw

  const day = d.padStart(2, '0')
  const month = m.padStart(2, '0')
  let year = y
  if (y.length <= 2) {
    const yy = parseInt(y, 10)
    year = String(yy <= 50 ? 2000 + yy : 1900 + yy)
  } else {
    year = y.padStart(4, '0')
  }
  return `${day}/${month}/${year}`
}
