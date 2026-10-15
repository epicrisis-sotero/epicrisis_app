<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import { glossaryForVersion } from '@/constants/formGlossary'
import GlosarioTree from './GlosarioTree.vue'

const annotationStore = useAnnotationStore()
const glossary = computed(() => glossaryForVersion(annotationStore.formVersion))
const searchQuery = ref('')
const scrollRef = ref<HTMLElement | null>(null)

const isSearching = computed(() => !!searchQuery.value.trim())

const hasActiveDefinition = computed(() => {
  return !!(annotationStore.glossaryActiveKey && glossary.value.definitions[annotationStore.glossaryActiveKey])
})

const activeLabelName = computed(() => {
  if (!annotationStore.glossaryActiveKey) return ''
  // Try to find in criteria
  const crit = annotationStore.criteria.find(c => c.criterionName === annotationStore.glossaryActiveKey)
  if (crit) return crit.criterionName.split('.').pop()?.replace(/_/g, ' ') || ''
  return annotationStore.glossaryActiveKey.split('.').pop()?.replace(/_/g, ' ') || ''
})

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const filteredEntries = computed(() => {
  const q = normalize(searchQuery.value)
  const all = Object.values(glossary.value.definitions)
  if (!q) return all
  return all.filter(e => 
    normalize(e.term).includes(q) || 
    normalize(e.definitionMarkdown).includes(q)
  )
})

watch(() => annotationStore.isGlossaryOpen, async (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    await nextTick()
    const activeKey = annotationStore.glossaryActiveKey
    if (activeKey && scrollRef.value) {
      const el = scrollRef.value.querySelector(`[data-glos-key="${activeKey}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div 
      v-if="annotationStore.isGlossaryOpen"
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      @click="annotationStore.closeGlossary"
    >
      <div 
        class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85%] flex flex-col border border-slate-100"
        @click.stop
      >
        <!-- Header -->
        <div class="p-4 border-b border-slate-100 flex-shrink-0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Glosario Clínico
            </h3>
            <button 
              class="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors"
              @click="annotationStore.closeGlossary"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Search input -->
          <div class="relative">
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Buscar término o descripción..."
              class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-brand-400 bg-slate-50/50"
            />
          </div>
        </div>

        <!-- Alert if field lacks definition -->
        <div 
          v-if="!hasActiveDefinition"
          class="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex gap-2"
        >
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            El campo <strong class="capitalize">"{{ activeLabelName }}"</strong> no tiene definición directa en este glosario.
          </div>
        </div>

        <!-- Entries Scroll Container -->
        <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 space-y-2">
          <!-- Búsqueda: lista plana de resultados -->
          <template v-if="isSearching">
            <div
              v-for="entry in filteredEntries"
              :key="entry.key"
              class="p-3 border border-slate-100 rounded-xl bg-slate-50/30"
            >
              <h4 class="font-bold text-xs text-slate-800 mb-1">{{ entry.term }}</h4>
              <div class="glosario-html text-[11px] text-slate-600 leading-relaxed" v-html="entry.definitionHtml" />
            </div>
            <div v-if="filteredEntries.length === 0" class="text-center py-8 text-slate-400 text-xs">
              No se encontraron términos para "{{ searchQuery }}".
            </div>
          </template>

          <!-- Vista jerárquica (respeta la anidación del formulario) -->
          <GlosarioTree
            v-else
            :nodes="glossary.structure"
            :active-key="annotationStore.glossaryActiveKey"
          />
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end flex-shrink-0">
          <button 
            class="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-xs font-bold"
            @click="annotationStore.closeGlossary"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.glosario-html :deep(p) {
  margin-bottom: 0.5rem;
}
.glosario-html :deep(p:last-child) {
  margin-bottom: 0;
}
.glosario-html :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.glosario-html :deep(li) {
  margin-bottom: 0.25rem;
}
.glosario-html :deep(strong) {
  font-weight: 600;
  color: #1e293b;
}
.glosario-html :deep(em) {
  font-style: italic;
}
.glosario-html :deep(hr) {
  border: none;
  border-top: 1px dashed #e2e8f0;
  margin: 0.75rem 0;
}
</style>
