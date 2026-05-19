import { ref, onMounted, onUnmounted } from 'vue'

export function useAntiScreenCapture(containerRef: { value: HTMLElement | null }) {
  const isObscured = ref(false)

  function obscure() {
    isObscured.value = true
    if (containerRef.value) {
      containerRef.value.classList.add('blurred')
      containerRef.value.classList.remove('unblurred')
    }
  }

  function reveal() {
    isObscured.value = false
    if (containerRef.value) {
      containerRef.value.classList.remove('blurred')
      containerRef.value.classList.add('unblurred')
    }
  }

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
    if (containerRef.value?.contains(e.target as Node)) {
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
