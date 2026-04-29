<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import type { AdminEpicrisisRow, AdminStats, AdminUser } from '@/services/admin.service'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const epicrises = ref<AdminEpicrisisRow[]>([])
const users = ref<AdminUser[]>([])
const stats = ref<AdminStats | null>(null)
const loading = ref(true)
const saving = ref<Record<number, boolean>>({})
const errorMsg = ref('')
const filterStatus = ref<'all' | 'pending' | 'in_review' | 'reviewed' | 'unassigned'>('all')

const filtered = computed(() => {
  if (filterStatus.value === 'all') return epicrises.value
  if (filterStatus.value === 'unassigned') return epicrises.value.filter(e => e.assigneeId === null)
  return epicrises.value.filter(e => e.status === filterStatus.value)
})

const statusConfig = {
  pending:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-800' },
  in_review: { label: 'En Revisión', cls: 'bg-blue-100 text-blue-800' },
  reviewed:  { label: 'Revisada',    cls: 'bg-green-100 text-green-800' },
}

function maskedId(id: number) {
  return `EPC-${String(id).padStart(5, '0')}`
}

async function load() {
  loading.value = true
  try {
    const [eRes, uRes] = await Promise.all([
      adminService.getEpicrises(),
      adminService.getUsers(),
    ])
    epicrises.value = eRes.epicrises
    stats.value = eRes.stats
    users.value = uRes.users
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error cargando datos'
  } finally {
    loading.value = false
  }
}

async function assign(epicrisisId: number, userId: string) {
  saving.value[epicrisisId] = true
  errorMsg.value = ''
  try {
    const parsedId = userId === '' ? null : Number(userId)
    await adminService.assign(epicrisisId, parsedId)
    const row = epicrises.value.find(e => e.id === epicrisisId)
    if (row) {
      row.assigneeId = parsedId
      row.assigneeEmail = parsedId
        ? users.value.find(u => u.id === parsedId)?.email ?? null
        : null
    }
    if (stats.value) {
      stats.value.unassigned = epicrises.value.filter(e => e.assigneeId === null).length
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al asignar'
  } finally {
    saving.value[epicrisisId] = false
  }
}

// Asignación rápida: distribuye todas las pendientes sin asignar entre los anotadores en orden
async function quickAssign() {
  if (!users.value.length) return
  const unassigned = epicrises.value.filter(e => e.assigneeId === null && e.status !== 'reviewed')
  for (let i = 0; i < unassigned.length; i++) {
    const user = users.value[i % users.value.length]
    await assign(unassigned[i].id, String(user.id))
  }
}

onMounted(load)
</script>

<template>
  <div class="h-full overflow-y-auto bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p class="text-sm text-gray-500 mt-0.5">Asignación de epicrisis a anotadores</p>
        </div>
        <BaseButton size="sm" variant="secondary" @click="load">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </BaseButton>
      </div>

      <!-- Stats -->
      <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
          <div class="text-xs text-gray-400 mt-0.5">Total</div>
        </div>
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer hover:border-orange-300 transition-colors"
          :class="{ 'ring-2 ring-orange-400': filterStatus === 'unassigned' }"
          @click="filterStatus = filterStatus === 'unassigned' ? 'all' : 'unassigned'"
        >
          <div class="text-2xl font-bold text-orange-600">{{ stats.unassigned }}</div>
          <div class="text-xs text-gray-400 mt-0.5">Sin asignar</div>
        </div>
        <div
          v-for="[key, label, color] in [['pending','Pendientes','yellow'], ['in_review','En Revisión','blue'], ['reviewed','Revisadas','green']] as const"
          :key="key"
          class="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer transition-colors"
          :class="[
            filterStatus === key ? `ring-2 ring-${color}-400` : `hover:border-${color}-300`,
          ]"
          @click="filterStatus = filterStatus === key ? 'all' : key"
        >
          <div :class="`text-2xl font-bold text-${color}-600`">{{ stats[key] }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ label }}</div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="errorMsg"
        class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700"
      >
        {{ errorMsg }}
        <button class="ml-auto" @click="errorMsg = ''">✕</button>
      </div>

      <!-- Quick assign toolbar -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-xs text-gray-500 font-medium">
          Mostrando {{ filtered.length }} epicrisis
          <span v-if="filterStatus !== 'all'">(filtro activo — <button class="underline" @click="filterStatus='all'">ver todas</button>)</span>
        </span>
        <div class="flex-1" />
        <BaseButton
          v-if="stats && stats.unassigned > 0"
          size="sm"
          @click="quickAssign"
        >
          ⚡ Distribuir {{ stats.unassigned }} sin asignar
        </BaseButton>
      </div>

      <!-- Table -->
      <BaseLoader v-if="loading" message="Cargando epicrisis…" />

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">ID</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Estado</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asignado a</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Asignar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="row in filtered"
              :key="row.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- ID -->
              <td class="px-4 py-3 font-mono text-xs font-semibold">
                <router-link
                  :to="{ name: 'annotate', params: { id: row.id } }"
                  class="text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {{ maskedId(row.id) }}
                </router-link>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span
                  :class="['px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[row.status].cls]"
                >
                  {{ statusConfig[row.status].label }}
                </span>
              </td>

              <!-- Current assignee -->
              <td class="px-4 py-3">
                <span v-if="row.assigneeEmail" class="text-gray-700 text-xs">
                  {{ row.assigneeEmail }}
                </span>
                <span v-else class="text-gray-300 text-xs italic">Sin asignar</span>
              </td>

              <!-- Assignment dropdown -->
              <td class="px-4 py-3">
                <div v-if="row.status !== 'reviewed'" class="flex items-center gap-2">
                  <select
                    :value="row.assigneeId ?? ''"
                    :disabled="saving[row.id]"
                    class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-400 disabled:opacity-50 max-w-[180px]"
                    @change="assign(row.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">— Sin asignar —</option>
                    <option v-for="u in users" :key="u.id" :value="u.id">
                      {{ u.email.split('@')[0] }}
                    </option>
                  </select>
                  <span v-if="saving[row.id]" class="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                </div>
                <span v-else class="text-xs text-gray-300 italic">Finalizada</span>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="4" class="px-4 py-12 text-center text-sm text-gray-400">
                No hay epicrisis en esta categoría.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span>
          <strong class="text-gray-600">Anotadores disponibles ({{ users.length }}):</strong>
          {{ users.map(u => u.email.split('@')[0]).join(', ') }}
        </span>
      </div>
    </div>
  </div>
</template>
