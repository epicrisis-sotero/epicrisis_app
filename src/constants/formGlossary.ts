import { GLOSARIO_DEFINICIONES, type GlosarioSection, type GlosarioEntry } from './glosario.generated'
import { LEGACY_FORM_VERSION, schemaForVersion, type FormVersion } from './formVersions'
import type { FormNode } from './formSchema'

// La ayuda anterior se conserva al abrir capturas de la primera ronda.
export function glossaryForVersion(version: FormVersion) {
  const definitions: Record<string, GlosarioEntry> = {}
  function visit(nodes: FormNode[]): GlosarioSection[] {
    return nodes.map(node => {
      let definition = GLOSARIO_DEFINICIONES[node.key]
      if (definition && node.key === 'antecedentes.quirurgicos' && version === LEGACY_FORM_VERSION) {
        definition = { ...definition, definitionMarkdown: 'Cirugías previas relevantes documentadas.', definitionHtml: '<p>Cirugías previas relevantes documentadas.</p>' }
      }
      if (definition) definitions[node.key] = definition
      return { id: node.id, key: node.key, label: node.label, type: node.type,
        ...(definition ? { definitionMarkdown: definition.definitionMarkdown, definitionHtml: definition.definitionHtml } : {}),
        ...(node.children ? { children: visit(node.children) } : {}),
      }
    })
  }
  const structure = visit(schemaForVersion(version))
  return { definitions, structure }
}
