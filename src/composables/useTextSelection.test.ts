import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useTextSelection } from './useTextSelection'

// jsdom no implementa CSS.highlights — el composable lo consulta con `in`.
;(globalThis as any).CSS = (globalThis as any).CSS ?? {}

/** Hace que window.getSelection() devuelva el texto indicado (o vacío). */
function stubSelection(text: string) {
  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => text,
    rangeCount: text ? 1 : 0,
    getRangeAt: () => ({ commonAncestorContainer: docEl, cloneRange: () => ({}) }),
    removeAllRanges: () => {},
  } as any)
}

let docEl: HTMLElement

/** Simula seleccionar texto dentro del documento (selectionchange + mouseup). */
function selectInDoc(text: string) {
  stubSelection(text)
  document.dispatchEvent(new Event('selectionchange'))
  docEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
}

function mountWithSelection() {
  const Host = defineComponent({
    setup(_, { expose }) {
      const containerRef = ref<HTMLElement | null>(null)
      const api = useTextSelection(containerRef as any)
      expose({ api, containerRef })
      return () => h('div', { ref: containerRef }, 'documento clínico de prueba')
    },
  })
  const wrapper = mount(Host, { attachTo: document.body })
  docEl = wrapper.vm.containerRef as unknown as HTMLElement
  return wrapper
}

describe('useTextSelection — la selección sobrevive al capturar (regresión)', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.restoreAllMocks())

  it('guarda el texto al seleccionar dentro del documento', () => {
    const wrapper = mountWithSelection()
    selectInDoc('disnea de reposo')

    expect(wrapper.vm.api.selectedText.value).toBe('disnea de reposo')
    expect(wrapper.vm.api.hasSelection.value).toBe(true)
  })

  it('NO borra la selección al hacer clic FUERA del documento (botón Capturar)', () => {
    const wrapper = mountWithSelection()

    // 1) Selección dentro del documento
    selectInDoc('shock séptico')
    expect(wrapper.vm.api.selectedText.value).toBe('shock séptico')

    // 2) El usuario clica el botón Capturar (fuera del documento): el clic colapsa
    //    la selección visual del browser → getSelection vacío, target = boton externo
    const externalBtn = document.createElement('button')
    document.body.appendChild(externalBtn)
    stubSelection('')
    externalBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    // La selección guardada DEBE seguir disponible para capturar
    expect(wrapper.vm.api.selectedText.value).toBe('shock séptico')

    // 3) captureAndReturn entrega el texto y luego limpia
    expect(wrapper.vm.api.captureAndReturn()).toBe('shock séptico')
    expect(wrapper.vm.api.selectedText.value).toBe('')
  })

  it('SÍ deselecciona al hacer clic en el documento sin selección', () => {
    const wrapper = mountWithSelection()
    selectInDoc('neumonía')
    expect(wrapper.vm.api.hasSelection.value).toBe(true)

    stubSelection('')
    docEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    expect(wrapper.vm.api.selectedText.value).toBe('')
    expect(wrapper.vm.api.hasSelection.value).toBe(false)
  })
})
