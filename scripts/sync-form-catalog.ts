/** Actualizar contrato backend sin ejecutar modelos ni consultar datos clínicos.
 * node --import tsx scripts/sync-form-catalog.ts [--check]
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CURRENT_FORM_VERSION, LEGACY_FORM_VERSION, schemaForVersion } from '../src/constants/formVersions'
import type { FormNode } from '../src/constants/formSchema'
function keys(nodes: FormNode[]): string[] { return nodes.flatMap(n => [n.key, ...keys(n.children ?? [])]) }
const catalogs = { [LEGACY_FORM_VERSION]: keys(schemaForVersion(LEGACY_FORM_VERSION)), [CURRENT_FORM_VERSION]: keys(schemaForVersion(CURRENT_FORM_VERSION)) }
const target = fileURLToPath(new URL('../../epicrisis_backend/api/_lib/form-catalog.ts', import.meta.url))
const generated = '// HU-031: generado desde formSchema.ts y formVersions.ts.\nexport const FORM_KEYS = ' + JSON.stringify(catalogs, null, 2) + ' as const\n'
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== generated) throw new Error('Catálogo backend desactualizado; ejecutar sync-form-catalog.ts.')
  console.log('Catálogos frontend/backend coinciden.')
} else writeFileSync(target, generated)
