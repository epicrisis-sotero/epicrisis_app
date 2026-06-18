<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import type { AdminEpicrisisRow, AdminStats, AdminUser, AdminMatrixRow, IrrResult } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth'
import { useEpicrisisStore } from '@/stores/epicrisis'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import AdminMatrix from '@/components/admin/AdminMatrix.vue'
import EpicrisisCard from '@/components/EpicrisisCard.vue'
import { COMORBIDITIES } from '@/constants/criteria'

const auth = useAuthStore()
const epicrisisStore = useEpicrisisStore()

type AdminTab = 'assignment' | 'expert_queue' | 'matrix' | 'irr' | 'users' | 'my_tasks'

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

// ── Assignment dropdown (multi-select per row) ───────────────────────────────
const openDropdownId = ref<number | null>(null)
const overlapPct = ref(15)

function toggleDropdown(epicrisisId: number) {
  openDropdownId.value = openDropdownId.value === epicrisisId ? null : epicrisisId
}

function isAssigned(row: AdminEpicrisisRow, userId: number) {
  return row.assignees?.some(a => a.id === userId) ?? false
}

async function toggleAssignee(row: AdminEpicrisisRow, userId: number) {
  const current = row.assignees?.map(a => a.id) ?? []
  const next = current.includes(userId)
    ? current.filter(id => id !== userId)
    : [...current, userId]
  await assign(row.id, next)
}

// ── Computed ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (filterStatus.value === 'all') return epicrises.value
  if (filterStatus.value === 'unassigned') return epicrises.value.filter(e => !e.assignees?.length)
  return epicrises.value.filter(e => e.status === filterStatus.value)
})

// HU-001: cola de revisión experta
const expertQueue = computed(() => epicrises.value.filter(e => e.status === 'needs_expert_review'))
const closingReview = ref<Record<number, boolean>>({})

async function closeReview(epicrisisId: number) {
  closingReview.value = { ...closingReview.value, [epicrisisId]: true }
  errorMsg.value = ''
  try {
    await adminService.closeExpertReview(epicrisisId)
    // Update optimista: el item sale de la cola de inmediato aunque load() falle
    const row = epicrises.value.find(e => e.id === epicrisisId)
    if (row) row.status = 'reviewed'
    await load()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'No se pudo cerrar la revisión.'
  } finally {
    closingReview.value = { ...closingReview.value, [epicrisisId]: false }
  }
}

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
  pending:             { label: 'Pendiente',       cls: 'bg-yellow-100 text-yellow-800' },
  in_review:           { label: 'En Revisión',     cls: 'bg-blue-100 text-blue-800' },
  reviewed:            { label: 'Revisada',        cls: 'bg-green-100 text-green-800' },
  needs_expert_review: { label: 'Revisión Experta', cls: 'bg-orange-100 text-orange-800' },
} as const

function maskedId(id: number, patientId?: string | null) {
  return patientId
    ? `EPC-${String(id).padStart(5, '0')} (${patientId})`
    : `EPC-${String(id).padStart(5, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
}

// HU-011: tiempo activo desde el SERVIDOR (ya no localStorage).
function formatMs(ms: number): string {
  if (!ms || ms < 1000) return '—'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}
function rowActiveTime(row: AdminEpicrisisRow): number {
  return (row.assignees ?? []).reduce((sum, a) => sum + (a.activeTimeMs ?? 0), 0)
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
  openDropdownId.value = null
  if (tab === 'matrix') loadMatrix()
  if (tab === 'irr') loadIrr()
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
  } else if (activeTab.value === 'irr') {
    irrLoaded.value = false
    loadIrr()
  } else {
    myTasksLoaded.value = false
    loadMyTasks()
  }
}

// ── Assignment actions ────────────────────────────────────────────────────────
async function assign(epicrisisId: number, userIds: number[]) {
  saving.value[epicrisisId] = true
  errorMsg.value = ''
  try {
    await adminService.assign(epicrisisId, userIds)
    const row = epicrises.value.find(e => e.id === epicrisisId)
    if (row) {
      row.assignees = userIds.map(id => ({
        id,
        email: allUsers.value.find(u => u.id === id)?.email ?? String(id),
        annotatedCount: row.assignees.find(a => a.id === id)?.annotatedCount ?? 0,
        activeTimeMs: row.assignees.find(a => a.id === id)?.activeTimeMs ?? 0,
      }))
      row.assigneeId = userIds[0] ?? null
      row.assigneeEmail = row.assignees[0]?.email ?? null
    }
    if (stats.value) {
      stats.value.unassigned = epicrises.value.filter(e => !e.assignees?.length).length
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al asignar'
  } finally {
    saving.value[epicrisisId] = false
  }
}

async function quickAssign() {
  if (!annotators.value.length) return
  // Excluir needs_expert_review: son sticky y se resuelven solo vía la cola de revisión
  const unassigned = epicrises.value.filter(e => !e.assignees?.length && e.status !== 'reviewed' && e.status !== 'needs_expert_review')
  const overlapCount = Math.round(unassigned.length * (overlapPct.value / 100))
  // Shuffle indices to pick which epicrisis get double assignment
  const overlapIndices = new Set(
    [...Array(unassigned.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, overlapCount)
  )

  for (let i = 0; i < unassigned.length; i++) {
    const primary = annotators.value[i % annotators.value.length]!
    const ids = [primary.id]
    if (overlapIndices.has(i) && annotators.value.length >= 2) {
      const secondary = annotators.value[(i + 1) % annotators.value.length]!
      if (secondary.id !== primary.id) ids.push(secondary.id)
    }
    await assign(unassigned[i]!.id, ids)
  }
}

// ── IRR tab ──────────────────────────────────────────────────────────────────
const irrData = ref<IrrResult | null>(null)
const loadingIrr = ref(false)
const irrLoaded = ref(false)

async function loadIrr() {
  if (irrLoaded.value) return
  loadingIrr.value = true
  errorMsg.value = ''
  try {
    irrData.value = await adminService.getIRR()
    irrLoaded.value = true
  } catch {
    errorMsg.value = 'Error cargando métricas IRR'
  } finally {
    loadingIrr.value = false
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
      e.assignees = e.assignees?.filter(a => a.id !== user.id) ?? []
      if (e.assigneeId === user.id) {
        e.assigneeId = e.assignees[0]?.id ?? null
        e.assigneeEmail = e.assignees[0]?.email ?? null
      }
    })
    if (stats.value) {
      stats.value.unassigned = epicrises.value.filter(e => !e.assignees?.length).length
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
  <div class="flex-1 min-h-0 overflow-y-auto bg-gray-50" @click.self="openDropdownId = null">
    <div class="px-4 py-6 sm:px-6 lg:px-8" @click="openDropdownId === null ? null : null">

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
          :class="activeTab === 'expert_queue' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('expert_queue')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z" />
          </svg>
          Cola de Revisión
          <span
            v-if="expertQueue.length > 0"
            class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold"
          >
            {{ expertQueue.length }}
          </span>
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
          :class="activeTab === 'irr' ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          @click="switchTab('irr')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Acuerdo IRR
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
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <span class="text-xs text-gray-500 font-medium">
              Mostrando {{ filtered.length }} epicrisis
              <span v-if="filterStatus !== 'all'">
                (filtro activo —
                <button class="underline" @click="filterStatus = 'all'">ver todas</button>)
              </span>
            </span>
            <div class="flex-1" />
            <template v-if="stats && stats.unassigned > 0">
              <div class="flex items-center gap-2">
                <label class="text-xs text-gray-500 whitespace-nowrap">Solapamiento:</label>
                <input
                  v-model.number="overlapPct"
                  type="range" min="0" max="50" step="5"
                  class="w-24 accent-brand-500"
                />
                <span class="text-xs font-semibold text-brand-600 w-8">{{ overlapPct }}%</span>
              </div>
              <BaseButton size="sm" @click="quickAssign">
                Distribuir {{ stats.unassigned }} sin asignar
              </BaseButton>
            </template>
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
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Tiempo</th>
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
                    <div v-if="row.assignees?.length" class="flex flex-wrap gap-1">
                      <span
                        v-for="a in row.assignees"
                        :key="a.id"
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200"
                      >
                        {{ a.email.split('@')[0] }}
                      </span>
                    </div>
                    <span v-else class="text-gray-300 text-xs italic">Sin asignar</span>
                  </td>
                  <td class="px-4 py-3 min-w-[180px]">
                    <div v-if="row.assignees?.length" class="flex flex-col gap-1.5">
                      <div v-for="a in row.assignees" :key="a.id" class="flex items-center gap-1.5">
                        <span class="text-[10px] text-gray-500 w-14 truncate flex-shrink-0" :title="a.email">
                          {{ a.email.split('@')[0] }}
                        </span>
                        <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-brand-500 rounded-full transition-all duration-500"
                            :style="{ width: Math.min((a.annotatedCount / COMORBIDITIES.length) * 100, 100) + '%' }"
                          />
                        </div>
                        <span class="text-[10px] text-gray-400 w-9 text-right flex-shrink-0">
                          {{ a.annotatedCount }}/{{ COMORBIDITIES.length }}
                        </span>
                        <span class="text-[10px] font-mono w-14 text-right flex-shrink-0" :class="a.activeTimeMs ? 'text-gray-500' : 'text-gray-300'" title="Tiempo activo de anotación">
                          {{ formatMs(a.activeTimeMs) }}
                        </span>
                      </div>
                    </div>
                    <span v-else class="text-gray-300 text-[10px]">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs" :class="rowActiveTime(row) === 0 ? 'text-gray-300' : 'text-gray-700'" title="Tiempo activo total (suma de anotadores)">
                      {{ formatMs(rowActiveTime(row)) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="row.status !== 'reviewed'" class="relative flex items-center gap-2">
                      <button
                        :disabled="!!saving[row.id]"
                        class="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:border-brand-400 focus:outline-none focus:border-brand-400 disabled:opacity-50 transition-colors"
                        @click="toggleDropdown(row.id)"
                      >
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Asignar
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <span v-if="saving[row.id]" class="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />

                      <!-- Dropdown -->
                      <div
                        v-if="openDropdownId === row.id"
                        class="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]"
                      >
                        <div class="px-3 py-1.5 border-b border-gray-100">
                          <button
                            class="text-[10px] text-red-500 hover:text-red-700 font-medium"
                            @click="assign(row.id, [])"
                          >
                            Quitar todos
                          </button>
                        </div>
                        <label
                          v-for="u in annotators"
                          :key="u.id"
                          class="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            :checked="isAssigned(row, u.id)"
                            class="accent-brand-500 w-3.5 h-3.5 flex-shrink-0"
                            @change="toggleAssignee(row, u.id)"
                          />
                          <span class="text-xs text-gray-700">{{ u.email }}</span>
                        </label>
                        <div v-if="!annotators.length" class="px-3 py-2 text-xs text-gray-400 italic">
                          No hay anotadores
                        </div>
                      </div>
                    </div>
                    <span v-else class="text-xs text-gray-300 italic">Finalizada</span>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="6" class="px-4 py-12 text-center text-sm text-gray-400">
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
      <!-- TAB: COLA DE REVISIÓN EXPERTA (HU-001)                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="activeTab === 'expert_queue'">
        <BaseLoader v-if="loading" message="Cargando cola…" />

        <template v-else>
          <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900">Cola de Revisión Experta</h2>
            <p class="text-sm text-gray-500 mt-1">
              Epicrisis derivadas porque un anotador marcó demasiados criterios como
              "no determinable". Resuelve las dudas y cierra la revisión.
            </p>
          </div>

          <!-- Empty state -->
          <div
            v-if="expertQueue.length === 0"
            class="bg-white rounded-xl border border-gray-200 p-10 text-center"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-700">No hay casos en revisión experta</p>
            <p class="text-xs text-gray-400 mt-1">Las derivaciones aparecerán aquí automáticamente.</p>
          </div>

          <!-- Queue table -->
          <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[560px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Estado</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Anotadores</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="row in expertQueue"
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
                    <div v-if="row.assignees?.length" class="flex flex-wrap gap-1">
                      <span
                        v-for="a in row.assignees"
                        :key="a.id"
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200"
                      >
                        {{ a.email.split('@')[0] }}
                      </span>
                    </div>
                    <span v-else class="text-gray-300 text-xs italic">Sin asignar</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <router-link
                        :to="{ name: 'annotate', params: { id: row.id } }"
                        class="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-brand-400 text-gray-600 transition-colors"
                      >
                        Revisar
                      </router-link>
                      <BaseButton
                        size="sm"
                        :loading="!!closingReview[row.id]"
                        title="Marcar las dudas como resueltas y cerrar la revisión (estado → Revisada)"
                        @click="closeReview(row.id)"
                      >
                        Cerrar revisión
                      </BaseButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB: ACUERDO IRR                                                   -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="activeTab === 'irr'">
        <BaseLoader v-if="loadingIrr" message="Calculando métricas IRR…" />

        <template v-else-if="irrData">
          <!-- Summary cards -->
          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div class="text-2xl font-bold text-gray-900">{{ irrData.nOverlapped }}</div>
              <div class="text-xs text-gray-400 mt-0.5">Epicrisis solapadas</div>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div class="text-2xl font-bold" :class="irrData.avgKappa === null ? 'text-gray-300' : irrData.avgKappa >= 0.6 ? 'text-green-600' : irrData.avgKappa >= 0.4 ? 'text-yellow-600' : 'text-red-600'">
                {{ irrData.avgKappa !== null ? irrData.avgKappa.toFixed(2) : '—' }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">κ promedio</div>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div class="text-2xl font-bold text-brand-600">{{ irrData.results.length }}</div>
              <div class="text-xs text-gray-400 mt-0.5">Criterios evaluados</div>
            </div>
          </div>

          <!-- IRR interpretation legend -->
          <div class="flex items-center gap-4 mb-4 text-[11px] text-gray-500">
            <span class="font-medium">Interpretación κ:</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span> &lt;0.4 Pobre</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span> 0.4–0.6 Moderado</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span> &gt;0.6 Sustancial</span>
          </div>

          <!-- Criterion table -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[500px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Criterio</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Comparaciones</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Acuerdo %</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Cohen's κ</th>
                  <th class="px-4 py-3 w-32"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="r in irrData.results"
                  :key="r.criterion"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ r.criterion }}</td>
                  <td class="px-4 py-3 text-right text-sm text-gray-500">{{ r.total }}</td>
                  <td class="px-4 py-3 text-right text-sm font-semibold text-gray-700">{{ r.agreementPct }}%</td>
                  <td class="px-4 py-3 text-right">
                    <span
                      class="font-mono text-sm font-bold"
                      :class="r.kappa >= 0.6 ? 'text-green-600' : r.kappa >= 0.4 ? 'text-yellow-600' : 'text-red-600'"
                    >
                      {{ r.kappa.toFixed(2) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="r.kappa >= 0.6 ? 'bg-green-400' : r.kappa >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'"
                        :style="{ width: Math.max(0, Math.min(1, r.kappa)) * 100 + '%' }"
                      />
                    </div>
                  </td>
                </tr>
                <tr v-if="irrData.results.length === 0">
                  <td colspan="5" class="px-4 py-12 text-center text-sm text-gray-400">
                    No hay epicrisis con ≥2 anotadores aún. Asigna una epicrisis a múltiples anotadores para ver métricas.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="mt-3 text-xs text-gray-400">
            Solo se muestran epicrisis anotadas por ≥2 personas. κ calculado con Pe=0.5 (distribución binaria conservadora).
          </p>
        </template>

        <div v-else class="py-16 text-center text-sm text-gray-400">
          No se pudieron cargar las métricas.
        </div>
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
