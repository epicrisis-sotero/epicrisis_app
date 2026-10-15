import { describe, expect, it } from 'vitest'
import { CURRENT_FORM_VERSION, LEGACY_FORM_VERSION, RETIRED_FIELD_ROOTS, schemaForVersion } from './formVersions'
import type { FormNode } from './formSchema'
function flatten(nodes: FormNode[]): FormNode[] { return nodes.flatMap(n=>[n,...flatten(n.children??[])]) }
describe('catálogo de esta entrega',()=>{
  it('solo retira claves aprobadas, sin cambiar orden, etiquetas o tipos restantes',()=>{
    const previous=flatten(schemaForVersion(LEGACY_FORM_VERSION));const current=flatten(schemaForVersion(CURRENT_FORM_VERSION))
    const keep=(key:string)=>!RETIRED_FIELD_ROOTS.some(r=>key===r||key.startsWith(r+'.'))
    expect(previous.length-current.length).toBe(16)
    expect(current.map(n=>n.key)).toEqual(previous.filter(n=>keep(n.key)).map(n=>n.key))
    for (const node of current) {
      const old=previous.find(n=>n.key===node.key)!
      const {children:_,...attributes}=node;const {children:__,...oldAttributes}=old
      expect(attributes).toEqual(oldAttributes)
    }
  })
})
