import { ref, computed, onUnmounted, type Ref } from 'vue'

interface TimerState {
  totalMs: number
  lastStartMs: number | null // non-null = running
}

function storageKey(id: number) {
  return `annotation_timer_${id}`
}

function loadState(id: number): TimerState {
  try {
    const raw = localStorage.getItem(storageKey(id))
    if (raw) return JSON.parse(raw)
  } catch {}
  return { totalMs: 0, lastStartMs: null }
}

function saveState(id: number, state: TimerState) {
  localStorage.setItem(storageKey(id), JSON.stringify(state))
}

export function useAnnotationTimer(epicrisisId: Ref<number>) {
  const state = ref<TimerState>(loadState(epicrisisId.value))
  const tickMs = ref(0) // reactive tick so formatted re-computes each second
  let interval: ReturnType<typeof setInterval> | null = null

  function currentElapsed(): number {
    if (state.value.lastStartMs === null) return state.value.totalMs
    return state.value.totalMs + (Date.now() - state.value.lastStartMs)
  }

  function tick() {
    tickMs.value = currentElapsed()
  }

  function startInterval() {
    if (interval) return
    interval = setInterval(tick, 1000)
    tick()
  }

  function stopInterval() {
    if (interval) { clearInterval(interval); interval = null }
  }

  const isRunning = computed(() => state.value.lastStartMs !== null)

  const formatted = computed(() => {
    // Re-computes when tickMs changes
    tickMs.value // read to establish reactivity dependency
    const ms = currentElapsed()
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  function start() {
    if (state.value.lastStartMs !== null) return // already running
    state.value.lastStartMs = Date.now()
    saveState(epicrisisId.value, state.value)
    startInterval()
  }

  function pause() {
    if (state.value.lastStartMs === null) return // already paused
    state.value.totalMs += Date.now() - state.value.lastStartMs
    state.value.lastStartMs = null
    saveState(epicrisisId.value, state.value)
    tick()
    stopInterval()
  }

  function stop() {
    pause()
  }

  function clear() {
    stopInterval()
    state.value = { totalMs: 0, lastStartMs: null }
    saveState(epicrisisId.value, state.value)
    tick()
  }

  // Auto-resume if it was running when the page was last closed
  if (state.value.lastStartMs !== null) {
    startInterval()
  } else {
    tick()
  }

  onUnmounted(() => {
    stopInterval()
  })

  return { isRunning, formatted, start, pause, stop, clear }
}
