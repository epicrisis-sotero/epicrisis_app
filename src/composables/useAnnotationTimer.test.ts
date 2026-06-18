import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useAnnotationTimer } from './useAnnotationTimer'

function setOnScreen(on: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => !on })
  vi.spyOn(document, 'hasFocus').mockReturnValue(on)
}

function mountTimer() {
  const Host = defineComponent({
    setup(_, { expose }) {
      const t = useAnnotationTimer(ref(1))
      expose({ t })
      return () => null
    },
  })
  const w = mount(Host, { attachTo: document.body })
  return w.vm.t as ReturnType<typeof useAnnotationTimer>
}

describe('useAnnotationTimer — solo cuenta tiempo activo (HU-010)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    setOnScreen(true)
  })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

  it('acumula tiempo mientras está activo en pantalla', () => {
    const t = mountTimer()
    t.start()
    vi.advanceTimersByTime(5000)
    expect(t.getMs()).toBeGreaterThanOrEqual(5000)
    expect(t.getMs()).toBeLessThan(5100)
  })

  it('NO cuenta el tiempo mientras la pestaña está sin foco', () => {
    const t = mountTimer()
    t.start()
    vi.advanceTimersByTime(5000)        // 5s activos
    setOnScreen(false)
    window.dispatchEvent(new Event('blur'))  // pausa
    const frozen = t.getMs()
    expect(frozen).toBeGreaterThanOrEqual(5000)
    vi.advanceTimersByTime(60000)       // 60s sin foco
    expect(t.getMs()).toBe(frozen)      // no avanzó
    expect(t.isRunning.value).toBe(false)
  })

  it('reanuda al volver el foco y sigue sumando', () => {
    const t = mountTimer()
    t.start()
    vi.advanceTimersByTime(5000)
    setOnScreen(false); window.dispatchEvent(new Event('blur'))
    vi.advanceTimersByTime(60000)       // no cuenta
    setOnScreen(true);  window.dispatchEvent(new Event('focus'))  // reanuda
    vi.advanceTimersByTime(3000)
    expect(t.getMs()).toBeGreaterThanOrEqual(8000)
    expect(t.getMs()).toBeLessThan(8100)
  })

  it('al recargar NO cuenta el tiempo que la pestaña estuvo cerrada', () => {
    // simula un estado guardado "corriendo" desde hace mucho (lastStartMs viejo)
    localStorage.setItem('annotation_timer_1', JSON.stringify({ totalMs: 4000, lastStartMs: Date.now() - 999999 }))
    const t = mountTimer()
    // descarta el segmento abierto: solo conserva los 4s ya acumulados
    expect(t.getMs()).toBe(4000)
    expect(t.isRunning.value).toBe(false)
  })
})
