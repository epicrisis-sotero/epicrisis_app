import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminMatrix from './AdminMatrix.vue'

afterEach(()=>vi.restoreAllMocks())
describe('CSV conserva versión para separar las rondas',()=>{
  it('incluye una columna de versión por anotador con el valor correspondiente',async()=>{
    let blob: Blob|undefined
    vi.stubGlobal('URL', {createObjectURL:(value:Blob)=>{blob=value;return 'blob:test'}})
    vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{})
    const rows:any[]=[{id:1,patientId:'SYNTHETIC',status:'in_review',annotations:{'falla.renal_aguda':[
      {userId:1,email:'old@example.invalid',isPresent:true,isUnknown:false,evidenceMetadata:null},
      {userId:2,email:'new@example.invalid',isPresent:false,isUnknown:false,evidenceMetadata:{formVersion:'uci-v4-20261015'}},
    ]}}]
    const wrapper=mount(AdminMatrix,{props:{rows}})
    await wrapper.findAll('button').find(b=>b.text().includes('Exportar CSV'))!.trigger('click')
    const contents=await new Promise<string>(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.readAsText(blob!)})
    const lines=contents.replace(/^\uFEFF/,'').split('\n')
    expect(lines[0].split(',')[3]).toBe('Versión formulario')
    expect(lines[1]).toContain('uci-v3');expect(lines[2]).toContain('uci-v4-20261015')
    wrapper.unmount();vi.unstubAllGlobals()
  })
})
