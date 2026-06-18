<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEpicrisisStore } from '@/stores/epicrisis'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { useToast } from '@/composables/useToast'
import EpicrisisCard from '@/components/EpicrisisCard.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'

const epicrisisStore = useEpicrisisStore()
const { show: showToast } = useToast()

// HU-015: pestaña activa persistida en el store (sobrevive ir a anotar y volver)
const activeTab = computed({
  get: () => epicrisisStore.dashboardTab,
  set: (v) => { epicrisisStore.dashboardTab = v },
})
const scrollContainer = ref<HTMLElement | null>(null)

const tabs = [
  { key: 'pending' as const,   label: 'Por Revisar' },
  { key: 'in_review' as const, label: 'En Revisión' },
  { key: 'reviewed' as const,  label: 'Completadas' },
]

useAutoRefresh(
  () => epicrisisStore.fetchList(true),
  {
    intervalMs: 30_000,
    immediate: true,
    getCount: () => epicrisisStore.list.length,
    onNewItems: (delta) => {
      showToast(
        delta === 1 ? 'Se te asignó 1 nueva epicrisis' : `Se te asignaron ${delta} nuevas epicrisis`,
        'info'
      )
    },
  }
)

// HU-015: restaurar scroll al volver (la lista persiste en el store, ya está
// renderizada) y guardarlo antes de salir hacia la anotación.
onMounted(() => {
  nextTick(() => {
    if (scrollContainer.value && epicrisisStore.dashboardScrollTop > 0) {
      scrollContainer.value.scrollTop = epicrisisStore.dashboardScrollTop
    }
  })
})
onBeforeUnmount(() => {
  if (scrollContainer.value) epicrisisStore.dashboardScrollTop = scrollContainer.value.scrollTop
})
</script>

<template>
  <div ref="scrollContainer" class="flex-1 min-h-0 overflow-y-auto">
    <div class="px-4 py-6 sm:px-6 lg:px-8">
      
      <!-- Header Section -->
      <div class="mb-8 border-b border-gray-200 pb-6">
        <h1 class="text-2xl font-extrabold text-slate-900">
          Mis Asignaciones
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Lista de epicrisis para validación de criterios clínicos.
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2"
          :class="activeTab === tab.key 
            ? 'border-brand-600 text-brand-600' 
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
            {{ tab.key === 'pending' ? epicrisisStore.pending.length : tab.key === 'in_review' ? epicrisisStore.inReview.length : epicrisisStore.reviewed.length }}
          </span>
        </button>
      </div>

      <!-- Content Area -->
      <BaseLoader v-if="epicrisisStore.loading" message="Cargando datos del servidor…" />

      <template v-else>
        <div v-if="activeTab === 'pending'" class="grid grid-cols-1 gap-4">
          <EpicrisisCard v-for="e in epicrisisStore.pending" :key="e.id" :epicrisis="e" />
          <div v-if="epicrisisStore.pending.length === 0" class="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <span class="text-sm text-slate-400 font-medium">No hay epicrisis pendientes en tu bandeja.</span>
          </div>
        </div>

        <div v-if="activeTab === 'in_review'" class="grid grid-cols-1 gap-4">
          <EpicrisisCard v-for="e in epicrisisStore.inReview" :key="e.id" :epicrisis="e" />
          <div v-if="epicrisisStore.inReview.length === 0" class="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <span class="text-sm text-slate-400 font-medium">No tienes borradores guardados.</span>
          </div>
        </div>

        <div v-if="activeTab === 'reviewed'" class="grid grid-cols-1 gap-4">
          <EpicrisisCard v-for="e in epicrisisStore.reviewed" :key="e.id" :epicrisis="e" />
          <div v-if="epicrisisStore.reviewed.length === 0" class="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <span class="text-sm text-slate-400 font-medium">No has finalizado ninguna anotación aún.</span>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
/* No more custom fonts here, using global Inter from MainLayout */
</style>
