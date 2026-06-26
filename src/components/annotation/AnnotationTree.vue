<script setup lang="ts">
import { computed } from 'vue'
import { FORM_SCHEMA, type FormNode } from '@/constants/formSchema'
import AnnotationNode from './AnnotationNode.vue'

const props = defineProps<{
  searchQuery: string
  isReadOnly?: boolean
}>()

// Helper to normalize search query (remove accents, lowercase)
function normalizeStr(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

// Recursive search filter to preserve parent hierarchy
const filteredSchema = computed(() => {
  const query = props.searchQuery.trim()
  if (!query) return FORM_SCHEMA
  
  const qNorm = normalizeStr(query)
  
  function filterNode(node: FormNode): FormNode | null {
    const matchesLabel = normalizeStr(node.label).includes(qNorm)
    const matchesSynonyms = node.synonyms?.some(syn => normalizeStr(syn).includes(qNorm))
    
    if (matchesLabel || matchesSynonyms) {
      return node // Return full node with all children
    }
    
    if (node.children) {
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter((child): child is FormNode => child !== null)
        
      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        }
      }
    }
    
    return null
  }
  
  return FORM_SCHEMA
    .map(node => filterNode(node))
    .filter((node): node is FormNode => node !== null)
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="filteredSchema.length === 0" class="py-12 text-center text-sm text-gray-400 bg-white rounded-lg border border-gray-100">
      <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      No se encontraron campos que coincidan con la búsqueda
    </div>
    
    <AnnotationNode
      v-for="node in filteredSchema"
      :key="node.key"
      :node="node"
      :is-read-only="isReadOnly"
      :depth="0"
    />
  </div>
</template>
