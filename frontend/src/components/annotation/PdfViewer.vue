<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ pdfPath: string }>()

// Same-origin rewrite (configured in vercel.json) → /pdfs/* proxies to the ngrok backend.
// Using same-origin lets the iframe satisfy CSP default-src 'self' without needing frame-src.
const pdfUrl = computed(() => `/file/${props.pdfPath}`)

// Track load state
const loaded = ref(false)
const errored = ref(false)

function onLoad() { loaded.value = true }
function onError() { errored.value = true }
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 h-full">
    <div v-if="errored" class="flex flex-col items-center justify-center flex-1 gap-3 text-gray-400 text-sm">
      <svg class="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>No se pudo cargar el PDF.</span>
      <a :href="pdfUrl" target="_blank" rel="noopener" class="text-brand-600 underline text-xs">Abrir en nueva pestaña</a>
    </div>

    <div v-else class="flex flex-col flex-1 min-h-0 relative">
      <div v-if="!loaded" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
        <span class="text-xs text-gray-400 animate-pulse">Cargando PDF…</span>
      </div>
      <iframe
        :src="pdfUrl + '#toolbar=1&navpanes=0'"
        class="flex-1 w-full border-0"
        style="min-height: 0;"
        @load="onLoad"
        @error="onError"
      />
    </div>
  </div>
</template>
