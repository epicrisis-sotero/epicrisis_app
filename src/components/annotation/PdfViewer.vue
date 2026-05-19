<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ pdfPath: string }>()

const loading = ref(false)
const errored = ref(false)
const viewerId = `pdf-viewer-${Math.random().toString(36).slice(2, 9)}`

onMounted(() => {
  initEmbedPdf()
})

watch(() => props.pdfPath, () => {
  initEmbedPdf()
})

function getPdfUrl() {
  if (!props.pdfPath) return ''
  const filename = props.pdfPath.split('/').pop()
  return `${window.location.origin}/api/pdf?id=${filename}`
}

function initEmbedPdf() {
  if (!props.pdfPath) return

  loading.value = true
  errored.value = false

  const pdfUrl = getPdfUrl()

  const script = document.createElement('script')
  script.async = true
  script.type = 'module'
  script.textContent = `
    import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';

    try {
      const viewer = EmbedPDF.init({
        type: 'container',
        target: document.getElementById('${viewerId}'),
        src: '${pdfUrl}'
      });
      window.dispatchEvent(new CustomEvent('pdf-loaded'));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('pdf-error', { detail: err }));
    }
  `

  window.addEventListener('pdf-loaded', () => {
    loading.value = false
  }, { once: true })

  window.addEventListener('pdf-error', () => {
    loading.value = false
    errored.value = true
    console.error('PDF viewer failed to load')
  }, { once: true })

  document.head.appendChild(script)
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 h-full bg-gray-100">
    <div
      v-if="loading"
      class="flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-200 text-[10px] text-gray-500"
    >
      <span>Cargando PDF…</span>
    </div>

    <div v-if="errored" class="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400 text-sm">
      <svg class="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>No se pudo cargar el PDF.</span>
    </div>

    <div
      :id="viewerId"
      class="flex-1 min-h-0 overflow-y-auto"
    >
      <embedpdf-container data-color-scheme="light"></embedpdf-container>
    </div>
  </div>
</template>
