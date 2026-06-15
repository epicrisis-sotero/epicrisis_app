import { describe, it, expect } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useAntiScreenCapture } from './useAntiScreenCapture'

function mountWithTwoPanels() {
  const Host = defineComponent({
    setup(_, { expose }) {
      const textEl = ref<HTMLElement | null>(null)
      const pdfEl = ref<HTMLElement | null>(null)
      useAntiScreenCapture(textEl, pdfEl)
      expose({ textEl, pdfEl })
      return () => h('div', [
        h('div', { ref: textEl }, 'panel texto'),
        h('div', { ref: pdfEl }, 'panel pdf'),
      ])
    },
  })
  return mount(Host, { attachTo: document.body })
}

describe('useAntiScreenCapture — protege TEXTO y PDF a la vez', () => {
  it('al perder el foco ofusca AMBOS paneles (texto y pdf)', async () => {
    const w = mountWithTwoPanels()
    window.dispatchEvent(new Event('blur'))
    await w.vm.$nextTick()
    expect((w.vm.textEl as HTMLElement).classList.contains('blurred')).toBe(true)
    expect((w.vm.pdfEl as HTMLElement).classList.contains('blurred')).toBe(true)
  })

  it('al recuperar el foco desofusca AMBOS paneles', async () => {
    const w = mountWithTwoPanels()
    window.dispatchEvent(new Event('blur'))
    await w.vm.$nextTick()
    window.dispatchEvent(new Event('focus'))
    await w.vm.$nextTick()
    for (const el of [w.vm.textEl, w.vm.pdfEl] as HTMLElement[]) {
      expect(el.classList.contains('blurred')).toBe(false)
      expect(el.classList.contains('unblurred')).toBe(true)
    }
  })
})
