import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GlosarioView from './GlosarioView.vue'
it('el glosario permite consultar ambas versiones sin mezclar definiciones',async()=>{
  const wrapper=mount(GlosarioView)
  const search=wrapper.find('input')
  await search.setValue('Parkinson')
  expect(wrapper.text()).not.toContain('Parkinson o parkinsonismo')
  await wrapper.find('select').setValue('uci-v3')
  expect(wrapper.text()).toContain('Parkinson o parkinsonismo')
  await search.setValue('cesárea')
  expect(wrapper.text()).toContain('Resultados de búsqueda (0)')
  await wrapper.find('select').setValue('uci-v4-20261015')
  expect(wrapper.text()).toContain('Antecedentes quirúrgicos')
  wrapper.unmount()
})
