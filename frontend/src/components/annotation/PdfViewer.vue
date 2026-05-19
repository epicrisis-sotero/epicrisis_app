<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const props = defineProps<{ pdfPath: string }>()

const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const errored = ref(false)
const totalPages = ref(0)
const currentPage = ref(0)

let cancelled = false
let currentTask: { destroy: () => void } | null = null

async function renderPdf() {
  if (!containerRef.value || !props.pdfPath) return
  cancelled = false
  loading.value = true
  errored.value = false
  totalPages.value = 0
  currentPage.value = 0
  containerRef.value.innerHTML = ''

  try {
    const url = `/api/pdf?id=${encodeURIComponent(props.pdfPath)}`
    const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false })
    currentTask = loadingTask
    const pdf = await loadingTask.promise
    if (cancelled) return
    totalPages.value = pdf.numPages

    const dpr = window.devicePixelRatio || 1
    const baseScale = 1.4

    for (let i = 1; i <= pdf.numPages; i++) {
      if (cancelled) return
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: baseScale * dpr })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = '100%'
      canvas.style.height = 'auto'
      canvas.style.display = 'block'
      canvas.style.marginBottom = '12px'
      canvas.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)'
      canvas.style.borderRadius = '4px'
      canvas.style.background = '#fff'
      containerRef.value!.appendChild(canvas)
      const ctx = canvas.getContext('2d')!
      await page.render({ canvas, canvasContext: ctx, viewport }).promise
      currentPage.value = i
    }
  } catch (err) {
    if (!cancelled) {
      errored.value = true
      console.error('PDF render failed', err)
    }
  } finally {
    loading.value = false
    currentTask = null
  }
}

onMounted(renderPdf)
watch(() => props.pdfPath, renderPdf)
onBeforeUnmount(() => {
  cancelled = true
  currentTask?.destroy?.()
})
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 h-full bg-gray-100">
    <div
      v-if="loading || totalPages > 0"
      class="flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-200 text-[10px] text-gray-500"
    >
      <span v-if="loading && totalPages === 0">Cargando PDF…</span>
      <span v-else-if="loading">Renderizando página {{ currentPage }} / {{ totalPages }}…</span>
      <span v-else>{{ totalPages }} página{{ totalPages === 1 ? '' : 's' }}</span>
    </div>

    <div v-if="errored" class="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400 text-sm">
      <svg class="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>No se pudo cargar el PDF.</span>
    </div>

    <div
      ref="containerRef"
      class="flex-1 min-h-0 overflow-y-auto p-3"
    />
  </div>
</template>
