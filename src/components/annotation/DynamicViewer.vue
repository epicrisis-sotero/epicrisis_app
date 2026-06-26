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
  <div class="flex flex-col flex-1 min-h-0 bg-[#e8ecf0] overflow-y-auto py-6 px-4">
    <div
      v-for="(page, pIdx) in pages"
      :key="pIdx"
      class="bg-white shadow-md mx-auto mb-4 p-8 w-full max-w-4xl flex flex-col gap-2 text-gray-800"
    >
      <div
        v-for="(block, bIdx) in (page.blocks || page.elements || [])"
        :key="bIdx"
        class="cursor-pointer whitespace-pre-wrap leading-relaxed rounded"
        :class="{ 'hover:bg-blue-100 transition-colors': true }"
        @click="emit('capture-block', { text: block.text, id: block.id })"
      >
        {{ block.text }}
      </div>
    </div>
  </div>
</template>
