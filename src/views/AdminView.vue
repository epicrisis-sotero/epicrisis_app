<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import type { AdminEpicrisisRow, AdminStats, AdminUser, AdminMatrixRow } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import { useEpicrisisStore } from '@/stores/epicrisis'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import AdminMatrix from '@/components/admin/AdminMatrix.vue'
import EpicrisisCard from '@/components/EpicrisisCard.vue'

const auth = useAuthStore()
const epicrisisStore = useEpicrisisStore()

type AdminTab = 'assignment' | 'matrix' | 'users' | 'my_tasks'

// ── Assignment tab ──────────────────────────────────────────────────────────
// ── Assignment tab ──────────────────────────────────────────────────────────
const epicrises = ref<AdminEpicrisisRow[]>([])
const stats = ref<AdminStats | null>(null)
const loading = ref(true)
const saving = ref<Record<number, boolean>>({})
const filterStatus = ref<'all' | 'pending' | 'in_review' | 'reviewed' | 'unassigned'>('all')

// ── Matrix tab ──────────────────────────────────────────────────────────────
const matrixRows = ref<AdminMatrixRow[]>([])
const loadingMatrix = ref(false)
const matrixLoaded = ref(false)

// ── Shared ──────────────────────────────────────────────────────────────────
const activeTab = ref<AdminTab>('assignment')
const errorMsg = ref('')

// ── Users tab ───────────────────────────────────────────────────────────────
const allUsers = ref<AdminUser[]>([])
const loadingUsers = ref(false)
const usersLoaded = ref(false)

// Computed selector for annotators (SSOT strategy)
const annotators = computed(() => allUsers.value.filter(u => u.role === 'annotator'))

const showCreateForm = ref(false)
const newEmail = ref('')
const newPassword = ref('')
const createRole = ref<'admin' | 'annotator'>('annotator')
const creatingUser = ref(false)

const updatingRole = ref<Record<number, boolean>>({})
const deletingUser = ref<Record<number, boolean>>({})
const confirmDeleteId = ref<number | null>(null)

const resetUserId = ref<number | null>(null)
const resetPasswordValue = ref('')
const resettingPassword = ref(false)

// ── My tasks tab ────────────────────────────────────────────────────────────
const myTasksLoaded = ref(false)
const myTasksTab = ref<'pending' | 'in_review' | 'reviewed'>('pending')

// ── Computed ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (filterStatus.value === 'all') return epicrises.value
  if (filterStatus.value === 'unassigned') return epicrises.value.filter(e => e.assigneeId === null)
  return epicrises.value.filter(e => e.status === filterStatus.value)
})

const myTasksFiltered = computed(() => {
  if (myTasksTab.value === 'pending') return epicrisisStore.pending
  if (myTasksTab.value === 'in_review') return epicrisisStore.inReview
  return epicrisisStore.reviewed
})

const myTasksCounts = computed(() => ({
  pending: epicrisisStore.pending.length,
  in_review: epicrisisStore.inReview.length,
  reviewed: epicrisisStore.reviewed.length,
}))

const resetUserEmail = computed(
  () => allUsers.value.find(u => u.id === resetUserId.value)?.email ?? ''
)

const statusConfig = {
  pending:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-800' },
  in_review: { label: 'En Revisión', cls: 'bg-blue-100 text-blue-800' },
  reviewed:  { label: 'Revisada',    cls: 'bg-green-100 text-green-800' },
} as const

function maskedId(id: number, patientId?: string | null) {
  return patientId
    ? `EPC-${String(id).padStart(5, '0')} (${patientId})`
    : `EPC-${String(id).padStart(5, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Data loaders ─────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    // We load EVERYTHING on mount for a smoother experience
    const [eRes, uRes] = await Promise.all([
      adminService.getEpicrises(),
      adminService.getAllUsers(),
    ])
    epicrises.value = eRes.epicrises
    stats.value = eRes.stats
    allUsers.value = uRes.users
    usersLoaded.value = true
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error cargando datos'
  } finally {
    loading.value = false
  }
}

async function loadMatrix() {
  if (matrixLoaded.value) return
  loadingMatrix.value = true
  errorMsg.value = ''
  try {
    const res = await adminService.getMatrix()
    matrixRows.value = res.matrix
    matrixLoaded.value = true
  } catch {
    errorMsg.value = 'Error cargando matriz'
  } finally {
    loadingMatrix.value = false
  }
}

async function loadAllUsers() {
  if (usersLoaded.value) return
  loadingUsers.value = true
  errorMsg.value = ''
  try {
    const res = await adminService.getAllUsers()
    allUsers.value = res.users
    usersLoaded.value = true
  } catch {
    errorMsg.value = 'Error cargando usuarios'
  } finally {
    loadingUsers.value = false
  }
}

async function loadMyTasks() {
  if (myTasksLoaded.value) return
  errorMsg.value = ''
  try {
    await epicrisisStore.fetchList()
    myTasksLoaded.value = true
  } catch {
    errorMsg.value = 'Error cargando tus epicrisis'
  }
}

function switchTab(tab: AdminTab) {
  activeTab.value = tab
  errorMsg.value = ''
  confirmDeleteId.value = null
  if (tab === 'matrix') loadMatrix()
  if (tab === 'users') loadAllUsers()
  if (tab === 'my_tasks') loadMyTasks()
}

function refresh() {
  if (activeTab.value === 'assignment') {
    load()
  } else if (activeTab.value === 'matrix') {
    matrixLoaded.value = false
    loadMatrix()
  } else if (activeTab.value === 'users') {
    usersLoaded.value = false
    loadAllUsers()
  } else {
    myTasksLoaded.value = false
    loadMyTasks()
  }
}

// ── Assignment actions ────────────────────────────────────────────────────────
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
        ? (allUsers.value.find(u => u.id === parsedId)?.email ?? null)
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

async function quickAssign() {
  if (!annotators.value.length) return
  const unassigned = epicrises.value.filter(e => e.assigneeId === null && e.status !== 'reviewed')
  for (let i = 0; i < unassigned.length; i++) {
    const annotator = annotators.value[i % annotators.value.length]!
    await assign(unassigned[i]!.id, String(annotator.id))
  }
}

// ── User management actions ───────────────────────────────────────────────────
async function createUser() {
  if (!newEmail.value || !newPassword.value) return
  creatingUser.value = true
  errorMsg.value = ''
  try {
    const res = await adminService.createUser(newEmail.value.trim(), newPassword.value, createRole.value)
    allUsers.value.push(res.user)
    newEmail.value = ''
    newPassword.value = ''
    createRole.value = 'annotator'
    showCreateForm.value = false
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al crear usuario'
  } finally {
    creatingUser.value = false
  }
}

async function toggleRole(user: AdminUser) {
  const targetRole: 'admin' | 'annotator' = user.role === 'admin' ? 'annotator' : 'admin'
  updatingRole.value[user.id] = true
  errorMsg.value = ''
  try {
    await adminService.updateUserRole(user.id, targetRole)
    const idx = allUsers.value.findIndex(u => u.id === user.id)
    if (idx !== -1) allUsers.value[idx]!.role = targetRole
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al cambiar rol'
  } finally {
    updatingRole.value[user.id] = false
  }
}

async function handleDeleteUser(user: AdminUser) {
  deletingUser.value[user.id] = true
  errorMsg.value = ''
  try {
    await adminService.deleteUser(user.id)
    allUsers.value = allUsers.value.filter(u => u.id !== user.id)
    epicrises.value.forEach(e => {
      if (e.assigneeId === user.id) {
        e.assigneeId = null
        e.assigneeEmail = null
      }
    })
    if (stats.value) {
      stats.value.unassigned = epicrises.value.filter(e => e.assigneeId === null).length
    }
    confirmDeleteId.value = null
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al eliminar usuario'
  } finally {
    deletingUser.value[user.id] = false
  }
}

async function submitResetPassword() {
  if (resetUserId.value === null || !resetPasswordValue.value) return
  resettingPassword.value = true
  errorMsg.value = ''
  try {
    await adminService.resetUserPassword(resetUserId.value, resetPasswordValue.value)
    resetUserId.value = null
    resetPasswordValue.value = ''
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al resetear contraseña'
  } finally {
    resettingPassword.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto bg-gray-50">
    <div class="px-4 py-6 sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p class="text-sm text-gray-500 mt-0.5">Gestión de epicrisis, anotadores y usuarios</p>
        </div>
        <BaseButton size="sm" variant="secondary" @click="refresh">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </BaseButton>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center gap-1 p-1 bg-gray-200/40 backdrop-blur-sm rounded-xl mb-8 border border-gray-200 overflow-x-auto">
        <button
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="activeTab === 'assignment' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('assignment')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Asignaciones
        </button>
        <button
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="activeTab === 'matrix' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('matrix')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Matriz de Hallazgos
        </button>
        <button
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="activeTab === 'users' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('users')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Usuarios
        </button>
        <button
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="activeTab === 'my_tasks' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('my_tasks')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Mis Epicrisis
        </button>
      </div>

      <!-- Error banner -->
      <div
        v-if="errorMsg"
        class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700"
      >
        {{ errorMsg }}
        <button class="ml-auto text-red-400 hover:text-red-600" @click="errorMsg = ''">✕</button>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ASIGNACIONES                                                  -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'assignment'">
        <BaseLoader v-if="loading" message="Cargando epicrisis…" />

        <template v-else>
          <!-- Stats cards -->
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
              :class="filterStatus === key ? `ring-2 ring-${color}-400` : `hover:border-${color}-300`"
              @click="filterStatus = filterStatus === key ? 'all' : key"
            >
              <div :class="`text-2xl font-bold text-${color}-600`">{{ stats[key] }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ label }}</div>
            </div>
          </div>

          <!-- Quick-assign toolbar -->
          <div class="flex items-center gap-3 mb-4">
            <span class="text-xs text-gray-500 font-medium">
              Mostrando {{ filtered.length }} epicrisis
              <span v-if="filterStatus !== 'all'">
                (filtro activo —
                <button class="underline" @click="filterStatus = 'all'">ver todas</button>)
              </span>
            </span>
            <div class="flex-1" />
            <BaseButton
              v-if="stats && stats.unassigned > 0"
              size="sm"
              @click="quickAssign"
            >
              Distribuir {{ stats.unassigned }} sin asignar
            </BaseButton>
          </div>

          <!-- Assignment table -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[560px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Estado</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asignado a</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Progreso</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Asignar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="row in filtered"
                  :key="row.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 font-mono text-xs font-semibold">
                    <router-link
                      :to="{ name: 'annotate', params: { id: row.id } }"
                      class="text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {{ maskedId(row.id, row.patientId) }}
                    </router-link>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[row.status].cls]">
                      {{ statusConfig[row.status].label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="row.assigneeEmail" class="text-gray-700 text-xs">{{ row.assigneeEmail }}</span>
                    <span v-else class="text-gray-300 text-xs italic">Sin asignar</span>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="row.assigneeId" class="flex flex-col gap-1">
                      <div class="flex justify-between text-[10px] text-gray-500 font-medium">
                        <span>{{ row.annotatedCount }}/15</span>
                        <span>{{ Math.round((row.annotatedCount / 15) * 100) }}%</span>
                      </div>
                      <div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-brand-500 rounded-full transition-all duration-500"
                          :style="{ width: (row.annotatedCount / 15) * 100 + '%' }"
                        />
                      </div>
                    </div>
                    <span v-else class="text-gray-300 text-[10px]">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="row.status !== 'reviewed'" class="flex items-center gap-2">
                      <select
                        :value="row.assigneeId ?? ''"
                        :disabled="!!saving[row.id]"
                        class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-400 disabled:opacity-50 max-w-[180px]"
                        @change="assign(row.id, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">— Sin asignar —</option>
                        <option v-for="u in annotators" :key="u.id" :value="u.id">
                          {{ u.email.split('@')[0] }}
                        </option>
                      </select>
                      <span v-if="saving[row.id]" class="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    </div>
                    <span v-else class="text-xs text-gray-300 italic">Finalizada</span>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="5" class="px-4 py-12 text-center text-sm text-gray-400">
                    No hay epicrisis en esta categoría.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 text-xs text-gray-400">
            <strong class="text-gray-600">Anotadores ({{ annotators.length }}):</strong>
            {{ annotators.map(u => u.email.split('@')[0]).join(', ') }}
          </div>
        </template>
      </template>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: MATRIZ DE HALLAZGOS                                           -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="activeTab === 'matrix'">
        <BaseLoader v-if="loadingMatrix" message="Cargando matriz…" />
        <AdminMatrix v-else :rows="matrixRows" />
      </template>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: USUARIOS                                                       -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="activeTab === 'users'">
        <BaseLoader v-if="loadingUsers" message="Cargando usuarios…" />

        <template v-else>
          <!-- Create user section -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-700">
                Usuarios del sistema
                <span class="ml-2 text-xs font-normal text-gray-400">({{ allUsers.length }})</span>
              </h2>
              <BaseButton size="sm" @click="showCreateForm = !showCreateForm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo usuario
              </BaseButton>
            </div>

            <!-- Create form (collapsible) -->
            <div
              v-if="showCreateForm"
              class="bg-white border border-brand-200 rounded-xl p-4 mb-4 shadow-sm"
            >
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Crear nuevo usuario</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    v-model="newEmail"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Contraseña (mín. 8 chars)</label>
                  <input
                    v-model="newPassword"
                    type="password"
                    placeholder="••••••••"
                    class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                  <select
                    v-model="createRole"
                    class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="annotator">Anotador</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-2 justify-end">
                <BaseButton variant="secondary" size="sm" @click="showCreateForm = false">Cancelar</BaseButton>
                <BaseButton
                  size="sm"
                  :loading="creatingUser"
                  :disabled="!newEmail || newPassword.length < 8"
                  @click="createUser"
                >
                  Crear usuario
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Users table -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[560px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Rol</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Creado</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Términos</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="user in allUsers"
                  :key="user.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-800 font-medium">
                    {{ user.email }}
                    <span v-if="user.id === auth.user?.id" class="ml-2 text-[10px] text-gray-400 font-normal">(tú)</span>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                      ]"
                    >
                      {{ user.role === 'admin' ? 'Admin' : 'Anotador' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-400">{{ formatDate(user.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <span
                      v-if="user.role === 'admin'"
                      class="text-xs text-gray-400 italic"
                      title="Los administradores no requieren firmar términos"
                    >
                      N/A
                    </span>
                    <span
                      v-else-if="user.termsAcceptedAt"
                      class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                      :title="'Firmado el ' + formatDate(user.termsAcceptedAt)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                      Firmado
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Pendiente
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <!-- Normal actions -->
                    <div v-if="confirmDeleteId !== user.id" class="flex items-center gap-2">
                      <!-- Toggle role -->
                      <button
                        :disabled="user.id === auth.user?.id || !!updatingRole[user.id]"
                        :title="user.id === auth.user?.id ? 'No puedes cambiar tu propio rol' : (user.role === 'admin' ? 'Degradar a anotador' : 'Promover a admin')"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        :class="user.role === 'admin' ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'"
                        @click="toggleRole(user)"
                      >
                        <span v-if="updatingRole[user.id]" class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <template v-else>
                          {{ user.role === 'admin' ? '↓ Anotador' : '↑ Admin' }}
                        </template>
                      </button>

                      <!-- Reset password -->
                      <button
                        class="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                        @click="resetUserId = user.id; resetPasswordValue = ''"
                      >
                        Reset pwd
                      </button>

                      <!-- Delete -->
                      <button
                        :disabled="user.id === auth.user?.id"
                        :title="user.id === auth.user?.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'"
                        class="px-2.5 py-1 rounded-lg text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        @click="confirmDeleteId = user.id"
                      >
                        Eliminar
                      </button>
                    </div>

                    <!-- Inline delete confirmation -->
                    <div v-else class="flex items-center gap-2">
                      <span class="text-xs text-red-600 font-medium">¿Eliminar {{ user.email.split('@')[0] }}?</span>
                      <button
                        :disabled="!!deletingUser[user.id]"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all"
                        @click="handleDeleteUser(user)"
                      >
                        <span v-if="deletingUser[user.id]" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <template v-else>Confirmar</template>
                      </button>
                      <button
                        class="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-all"
                        @click="confirmDeleteId = null"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="allUsers.length === 0">
                  <td colspan="4" class="px-4 py-12 text-center text-sm text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: MIS EPICRISIS                                                  -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="activeTab === 'my_tasks'">
        <BaseLoader v-if="epicrisisStore.loading" message="Cargando tus epicrisis…" />

        <template v-else>
          <!-- Sub-tabs -->
          <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
            <button
              v-for="[key, label] in [['pending', 'Por Revisar'], ['in_review', 'En Revisión'], ['reviewed', 'Completadas']] as const"
              :key="key"
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
              :class="myTasksTab === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              @click="myTasksTab = key"
            >
              {{ label }}
              <span
                v-if="myTasksCounts[key] > 0"
                class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                :class="myTasksTab === key ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'"
              >
                {{ myTasksCounts[key] }}
              </span>
            </button>
          </div>

          <!-- Card list -->
          <div v-if="myTasksFiltered.length > 0" class="space-y-2">
            <EpicrisisCard
              v-for="item in myTasksFiltered"
              :key="item.id"
              :epicrisis="item"
            />
          </div>
          <div v-else class="py-16 text-center text-sm text-gray-400">
            <template v-if="myTasksTab === 'pending'">No tienes epicrisis pendientes asignadas.</template>
            <template v-else-if="myTasksTab === 'in_review'">No tienes epicrisis en revisión actualmente.</template>
            <template v-else>Todavía no has completado ninguna anotación.</template>
          </div>
        </template>
      </template>

    </div>
  </div>

  <!-- Reset password modal -->
  <BaseModal
    title="Resetear contraseña"
    :open="resetUserId !== null"
    @close="resetUserId = null; resetPasswordValue = ''"
  >
    <p class="text-sm text-gray-600 mb-4">
      Nueva contraseña para <strong>{{ resetUserEmail }}</strong>
    </p>
    <input
      v-model="resetPasswordValue"
      type="password"
      placeholder="Mínimo 8 caracteres"
      class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-brand-400"
      @keyup.enter="submitResetPassword"
    />
    <div class="flex gap-2 justify-end">
      <BaseButton variant="secondary" size="sm" @click="resetUserId = null; resetPasswordValue = ''">
        Cancelar
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="resettingPassword"
        :disabled="resetPasswordValue.length < 8"
        @click="submitResetPassword"
      >
        Guardar contraseña
      </BaseButton>
    </div>
  </BaseModal>
</template>
