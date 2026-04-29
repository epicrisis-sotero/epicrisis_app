<script setup lang="ts">
import { COMORBIDITIES } from '@/constants/criteria'
import type { AdminMatrixRow } from '@/services/admin.service'

defineProps<{
  rows: AdminMatrixRow[]
  loading?: boolean
}>()

function maskedId(id: number) {
  return `EPC-${String(id).padStart(5, '0')}`
}
</script>

<template>
  <div class="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[70vh]">
    <!-- Table Container for scrolling -->
    <div class="flex-1 overflow-auto relative custom-scrollbar">
      <table class="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr class="bg-gray-50">
            <!-- Patient ID Sticky Header -->
            <th class="sticky left-0 top-0 z-30 bg-gray-100 border-b border-r border-gray-200 px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider min-w-[120px]">
              Paciente
            </th>
            <!-- Comorbidities Headers -->
            <th 
              v-for="c in COMORBIDITIES" 
              :key="c.name"
              class="sticky top-0 z-20 bg-gray-50 border-b border-r border-gray-200 px-2 py-3 text-center font-semibold text-gray-500 uppercase tracking-tighter whitespace-nowrap min-w-[80px]"
              :title="c.label"
            >
              <div class="rotate-[-15deg] transform origin-center py-2 px-1">
                {{ c.label.length > 12 ? c.label.substring(0, 10) + '..' : c.label }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-gray-50/80 group">
            <!-- Sticky Patient ID Column -->
            <td class="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 px-4 py-2 font-mono font-bold text-brand-600">
              <div class="flex flex-col">
                <span>{{ maskedId(row.id) }}</span>
                <span class="text-[9px] text-gray-400 font-normal truncate max-w-[80px]" :title="row.assigneeEmail || 'Sin asignar'">
                  {{ row.assigneeEmail?.split('@')[0] || '—' }}
                </span>
              </div>
            </td>

            <!-- Cells -->
            <td 
              v-for="c in COMORBIDITIES" 
              :key="c.name"
              class="border-r border-gray-100 p-0 relative"
            >
              <div 
                v-if="row.annotations[c.name]"
                class="w-full h-10 flex items-center justify-center transition-colors relative group/cell"
                :class="[
                  row.annotations[c.name].isPresent === true ? 'bg-green-100 text-green-700' : 
                  row.annotations[c.name].isPresent === false ? 'bg-red-100 text-red-700' : 
                  'bg-gray-50 text-gray-400'
                ]"
              >
                <!-- Icon/Text -->
                <span v-if="row.annotations[c.name].isPresent === true" class="font-bold">✓</span>
                <span v-else-if="row.annotations[c.name].isPresent === false" class="font-bold">✗</span>
                <span v-else class="text-[9px]">?</span>

                <!-- Tooltip for Evidence -->
                <div 
                  v-if="row.annotations[c.name].evidenceText"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
                >
                  <p class="font-bold mb-1 border-b border-gray-700 pb-1">{{ c.label }}</p>
                  <p class="italic opacity-90 line-clamp-4">"{{ row.annotations[c.name].evidenceText }}"</p>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
              
              <!-- Empty state (no annotation record) -->
              <div v-else class="w-full h-10 bg-gray-50/50 flex items-center justify-center text-gray-300">
                <span class="text-[9px]">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Legend -->
    <div class="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center gap-6 text-[10px]">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 bg-green-200 border border-green-300 rounded" />
        <span class="text-gray-600 font-medium">Presente</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 bg-red-200 border border-red-300 rounded" />
        <span class="text-gray-600 font-medium">Ausente</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 bg-gray-100 border border-gray-200 rounded" />
        <span class="text-gray-600 font-medium">No evaluado</span>
      </div>
      <div class="ml-auto text-gray-400 italic">
        * Pase el mouse sobre una celda para ver la evidencia.
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Ensure sticky columns don't have transparency issues */
td.sticky, th.sticky {
  box-shadow: 1px 0 0 0 #e5e7eb;
}
</style>
