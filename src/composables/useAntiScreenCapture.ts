import { ref, onMounted, onUnmounted } from 'vue'

type ElRef = { value: HTMLElement | null }

// Acepta uno o varios contenedores: así protege a la vez el panel de TEXTO y el
// visor de PDF (ambos muestran datos sensibles del paciente).
export function useAntiScreenCapture(...containerRefs: ElRef[]) {
  const isObscured = ref(false)

  function setBlur(blurred: boolean) {
    for (const r of containerRefs) {
      const el = r.value
      if (!el) continue
      el.classList.toggle('blurred', blurred)
      el.classList.toggle('unblurred', !blurred)
    }
  }

  function obscure() { isObscured.value = true; setBlur(true) }
  function reveal() { isObscured.value = false; setBlur(false) }

  function onVisibilityChange() {
    if (document.hidden) obscure()
    else reveal()
  }

  function onWindowBlur() {
    obscure()
  }

  function onWindowFocus() {
    reveal()
  }

  function onKeyDown(e: KeyboardEvent) {
    const isCtrl = e.ctrlKey || e.metaKey
    // Bloquear Ctrl+P (Imprimir) y combinaciones comunes
    if (isCtrl && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
      e.preventDefault()
      return false
    }

    // Si presiona PrintScreen, obscurecemos por un tiempo
    if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
      obscure()
      setTimeout(reveal, 3000)
    }
  }

  function onContextMenu(e: MouseEvent) {
    if (containerRefs.some(r => r.value?.contains(e.target as Node))) {
      e.preventDefault()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('contextmenu', onContextMenu)

    // Si la página carga sin foco, obscurecer de entrada
    if (!document.hasFocus()) obscure()
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('blur', onWindowBlur)
    window.removeEventListener('focus', onWindowFocus)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('contextmenu', onContextMenu)
  })

  return { isObscured, obscure, reveal }
}
