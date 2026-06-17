import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

interface TimerState {
  totalMs: number
  lastStartMs: number | null // non-null = corriendo
}

function storageKey(id: number) {
  return `annotation_timer_${id}`
}

function loadState(id: number): TimerState {
  try {
    const raw = localStorage.getItem(storageKey(id))
    if (raw) {
      const s = JSON.parse(raw) as TimerState
      // HU-010: descartar el segmento abierto (lastStartMs) — NO contar el tiempo
      // que la pestaña estuvo cerrada. Solo conservamos lo ya acumulado.
      return { totalMs: s.totalMs ?? 0, lastStartMs: null }
    }
  } catch {}
  return { totalMs: 0, lastStartMs: null }
}

function saveState(id: number, state: TimerState) {
  localStorage.setItem(storageKey(id), JSON.stringify(state))
}

/**
 * Cronómetro de TIEMPO ACTIVO (HU-010): solo avanza cuando el anotador está
 * efectivamente en pantalla (pestaña visible y ventana con foco). Se pausa al
 * perder foco / ocultar la pestaña y reanuda al volver. No cuenta tiempo con la
 * pestaña cerrada o en segundo plano.
 */
export function useAnnotationTimer(epicrisisId: Ref<number>) {
  const state = ref<TimerState>(loadState(epicrisisId.value))
  const tickMs = ref(0)
  let interval: ReturnType<typeof setInterval> | null = null
  let wantActive = false // la vista quiere que el cronómetro corra

  function currentElapsed(): number {
    if (state.value.lastStartMs === null) return state.value.totalMs
    return state.value.totalMs + (Date.now() - state.value.lastStartMs)
  }

  function getMs(): number {
    return currentElapsed()
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
    tickMs.value // establecer dependencia reactiva
    const ms = currentElapsed()
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  function isOnScreen() {
    return !document.hidden && document.hasFocus()
  }

  // Arranca el reloj real (idempotente)
  function resume() {
    if (state.value.lastStartMs !== null) return
    state.value.lastStartMs = Date.now()
    saveState(epicrisisId.value, state.value)
    startInterval()
  }
  // Detiene el reloj real acumulando lo corrido
  function suspend() {
    if (state.value.lastStartMs === null) return
    state.value.totalMs += Date.now() - state.value.lastStartMs
    state.value.lastStartMs = null
    saveState(epicrisisId.value, state.value)
    tick()
    stopInterval()
  }

  // ── API para la vista ──
  function start() {
    wantActive = true
    if (isOnScreen()) resume()
  }
  function pause() {
    // pausa "dura" (deja de querer correr) — usar al cerrar la anotación
    wantActive = false
    suspend()
  }
  function stop() {
    pause()
  }
  function clear() {
    stopInterval()
    wantActive = false
    state.value = { totalMs: 0, lastStartMs: null }
    saveState(epicrisisId.value, state.value)
    tick()
  }

  // Pausa/reanuda automáticamente según foco/visibilidad (solo si la vista quiere correr)
  function onScreenChange() {
    if (!wantActive) return
    if (isOnScreen()) resume()
    else suspend()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onScreenChange)
    window.addEventListener('focus', onScreenChange)
    window.addEventListener('blur', onScreenChange)
    tick()
  })

  onUnmounted(() => {
    suspend() // al desmontar, acumular lo corrido (no se pierde)
    document.removeEventListener('visibilitychange', onScreenChange)
    window.removeEventListener('focus', onScreenChange)
    window.removeEventListener('blur', onScreenChange)
    stopInterval()
  })

  return { isRunning, formatted, start, pause, stop, clear, getMs }
}
