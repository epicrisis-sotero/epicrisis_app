import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'warning'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, show, dismiss }
}
