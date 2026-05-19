import { ref, onMounted, onUnmounted } from 'vue'

export interface UseAutoRefreshOptions {
  intervalMs?: number
  immediate?: boolean
  getCount?: () => number
  onNewItems?: (delta: number) => void
}

export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { intervalMs = 30_000, immediate = true, onNewItems, getCount } = options
  const isPolling = ref(false)
  let timerId: ReturnType<typeof setInterval> | null = null

  async function runFetch() {
    if (isPolling.value) return
    isPolling.value = true
    const countBefore = getCount?.() ?? 0
    try {
      await fetchFn()
      if (onNewItems && getCount) {
        const delta = getCount() - countBefore
        if (delta > 0) onNewItems(delta)
      }
    } finally {
      isPolling.value = false
    }
  }

  function startPolling() {
    if (timerId !== null) return
    timerId = setInterval(runFetch, intervalMs)
  }

  function stopPolling() {
    if (timerId === null) return
    clearInterval(timerId)
    timerId = null
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopPolling()
    } else {
      runFetch()
      startPolling()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    if (!document.hidden) {
      if (immediate) runFetch()
      startPolling()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    stopPolling()
  })

  return { isPolling }
}
