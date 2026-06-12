import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })

const FIRMA_RE =
  /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:[^\S\n]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){1,3})(\s*\n\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}[^\S\n]+\d{1,2}:\d{2}(?::\d{2})?)/gm

const CONTACTO_RE =
  /(?:contacto\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})+)/gi

const FAMILIAR_RE =
  /(?:hija?|hijo|esposa?|marido|cónyuge|pareja|hermana?|hermano|madre|padre)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})+)/gi

const MEDICAL = new Set([
  'Anamnesis','Antecedentes','Diagnósticos','Diagnóstico','Evolución',
  'Resumen','Procedimientos','Laboratorio','Ingreso','Egreso',
  'Crisis','Shock','Sepsis','Manejo','Renal','Pulmonar','Hepático',
  'Cardíaco','Cerebral','Vascular','Remota','Próxima','Mórbidos',
])

function isMedical(name: string) {
  return [...MEDICAL].some(t => name.includes(t))
}

function clean(text: string): { cleaned: string; count: number } {
  let count = 0

  const withoutFirmas = text.replace(FIRMA_RE, (match, name, rest) => {
    if (isMedical(name)) return match
    count++
    return `[FIRMA MÉDICO ANONIMIZADA]${rest}`
  })

  const withoutContactos = withoutFirmas.replace(CONTACTO_RE, (match, name) => {
    if (isMedical(name)) return match
    count++
    return match.replace(name, '[ANONIMIZADO]')
  })

  const withoutFamiliares = withoutContactos.replace(FAMILIAR_RE, (match, name) => {
    if (isMedical(name)) return match
    count++
    return match.replace(name, '[ANONIMIZADO]')
  })

  return { cleaned: withoutFamiliares, count }
}

async function main() {
  const client = await pool.connect()
  try {
    console.log('Leyendo secciones de texto…')
    const { rows } = await client.query<{ epicrisis_id: number; section_name: string; content: string }>(
      'SELECT epicrisis_id, section_name, content FROM epicrisis_sections'
    )
    console.log(`Total secciones: ${rows.length}`)

    let updated = 0
    let totalChanges = 0

    for (const row of rows) {
      const { cleaned, count } = clean(row.content ?? '')
      if (count > 0) {
        await client.query(
          'UPDATE epicrisis_sections SET content = $1 WHERE epicrisis_id = $2 AND section_name = $3',
          [cleaned, row.epicrisis_id, row.section_name]
        )
        updated++
        totalChanges += count
        process.stdout.write(`\r  Actualizadas: ${updated} secciones, ${totalChanges} ocurrencias…`)
      }
    }

    console.log(`\n✓ Listo. ${updated} secciones actualizadas, ${totalChanges} ocurrencias de PII eliminadas.`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
