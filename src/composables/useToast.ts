import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    // Deduplicate: don't stack identical messages
    if (toasts.value.some((t) => t.message === message && t.type === type)) return
    const id = ++nextId
    toasts.value.push({ id, message, type })
    // Errors require manual dismiss
    if (type !== 'error') setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function dismissByMessage(message: string) {
    toasts.value = toasts.value.filter((t) => t.message !== message)
  }

  return { toasts, show, dismiss, dismissByMessage }
}
