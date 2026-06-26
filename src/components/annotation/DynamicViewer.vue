<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  layoutData: any
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'capture-block', payload: { text: string; id?: string }): void
}>()

// Default fallback structure in case the JSON is slightly different
const pages = computed(() => {
  if (Array.isArray(props.layoutData)) return props.layoutData
  if (props.layoutData?.pages) return props.layoutData.pages
  // If it's a single page wrapped
  if (props.layoutData?.blocks) return [props.layoutData]
  return []
})

// Highlight computation can be added here similar to PdfViewer
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 bg-[#e8ecf0] overflow-y-auto py-6 px-4 items-center">
    <!-- Escala ajustada para encajar visualmente como el PDF original -->
    <div
      v-for="(page, pIdx) in pages"
      :key="pIdx"
      class="bg-white shadow-md mb-6 relative overflow-hidden"
      :style="{ 
        width: (page.width || 612) + 'px', 
        height: (page.height || 792) + 'px',
        transformOrigin: 'top center'
      }"
    >
      <div
        v-for="(block, bIdx) in (page.blocks || page.elements || [])"
        :key="bIdx"
        class="absolute cursor-pointer leading-none whitespace-nowrap"
        :class="{ 'hover:bg-blue-200 transition-colors': true }"
        @click="emit('capture-block', { text: block.text, id: block.id })"
        :style="{
          left: block.x + 'px',
          top: block.y + 'px',
          fontSize: (block.fontSize || 12) + 'px',
          fontFamily: block.fontFamily || 'sans-serif'
        }"
      >
        {{ block.text }}
      </div>
    </div>
  </div>
</template>
