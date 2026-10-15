import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAnnotationStore } from './annotation'
import { annotationService } from '@/services/annotation.service'
import { CURRENT_FORM_VERSION, LEGACY_FORM_VERSION, schemaForVersion } from '@/constants/formVersions'
import { getLeafNodes } from '@/constants/formSchema'
import { glossaryForVersion } from '@/constants/formGlossary'

const removed = 'antecedentes.neurologico.parkinson'
beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()); vi.restoreAllMocks() })
describe('HU-031 / HU-032 / HU-035: versiones de captura', () => {
  it('captura nueva usa 183 campos y no exige los retirados', () => {
    const s = useAnnotationStore(); s.initForEpicrisis(1, null)
    expect(s.formVersion).toBe(CURRENT_FORM_VERSION)
    expect(getLeafNodes(s.formSchema)).toHaveLength(183)
    expect(s.criteria.find(c => c.criterionName === removed)).toBeUndefined()
    expect(s.missingItems.some(c => c.kind === 'criterion' && c.key === removed)).toBe(false)
    expect(getLeafNodes(schemaForVersion(LEGACY_FORM_VERSION))).toHaveLength(199)
  })
  it('borrador anterior sin marcador conserva campos y evidencia', async () => {
    localStorage.setItem('annotation_draft_1', JSON.stringify({criteria: [{criterionName: removed, isPresent: true, evidenceText: 'Texto anterior', comments: 'Conservar'}]}))
    const s = useAnnotationStore(); s.initForEpicrisis(1, null); await nextTick()
    expect(s.formVersion).toBe(LEGACY_FORM_VERSION)
    expect(s.criteria.find(c => c.criterionName === removed)).toMatchObject({isPresent: true, evidenceText:'Texto anterior', comments:'Conservar'})
    expect(JSON.parse(localStorage.getItem('annotation_draft_1')!).formVersion).toBe(LEGACY_FORM_VERSION)
  })
  it('revisión anterior y luego nueva cambian el árbol y progreso sin perder la referencia', () => {
    const s = useAnnotationStore(); s.initForEpicrisis(1,null)
    s.loadFromServer([{criterionName:removed,isPresent:true,evidenceText:'anterior',comments:null}],null)
    expect(s.formVersion).toBe(LEGACY_FORM_VERSION)
    expect(s.criteria.find(c=>c.criterionName===removed)?.evidenceText).toBe('anterior')
    s.loadAdminReview(2, [], null, {}, null)
    expect(s.formVersion).toBe(CURRENT_FORM_VERSION)
    expect(s.criteria.find(c=>c.criterionName===removed)).toBeUndefined()
  })
  it('guardar/recargar transmite versión, duda y evidencia sin los campos retirados', async () => {
    const submit = vi.spyOn(annotationService,'submit').mockResolvedValue({ok:true,status:'in_review'})
    const s=useAnnotationStore();s.initForEpicrisis(1,null)
    s.setIsPresent('infecciones.focos.respiratorio','unknown');s.setEvidence('infecciones.focos.respiratorio','sospecha documentada')
    await s.saveProgress()
    const [id,rows,,meta] = submit.mock.calls[0]
    expect(id).toBe(1);expect(meta?.formVersion).toBe(CURRENT_FORM_VERSION)
    expect(rows.every((c:any)=>c.evidenceMetadata.formVersion===CURRENT_FORM_VERSION)).toBe(true)
    expect(rows.some((c:any)=>c.criterionName===removed)).toBe(false)
    const updated = rows.map((c:any)=>({...c,evidenceMetadata:c.evidenceMetadata}))
    s.loadFromServer(updated,null)
    expect(s.criteria.find(c=>c.criterionName==='infecciones.focos.respiratorio')).toMatchObject({isPresent:'unknown',evidenceText:'sospecha documentada'})
  })
  it('versión desconocida no sobrescribe un borrador guardado', () => {
    const saved=JSON.stringify({formVersion:'future',criteria:[]});localStorage.setItem('annotation_draft_1',saved)
    expect(()=>useAnnotationStore().initForEpicrisis(1,null)).toThrow(/Versión/)
    expect(localStorage.getItem('annotation_draft_1')).toBe(saved)
  })
  it('ayuda quirúrgica nueva usa ejemplos aprobados y conserva la ayuda anterior', () => {
    expect(glossaryForVersion(CURRENT_FORM_VERSION).definitions['antecedentes.quirurgicos'].definitionMarkdown).toMatch(/cesárea/)
    expect(glossaryForVersion(LEGACY_FORM_VERSION).definitions['antecedentes.quirurgicos'].definitionMarkdown).not.toMatch(/cesárea/)
    expect(glossaryForVersion(CURRENT_FORM_VERSION).definitions[removed]).toBeUndefined()
    expect(glossaryForVersion(LEGACY_FORM_VERSION).definitions[removed]).toBeDefined()
  })
})
