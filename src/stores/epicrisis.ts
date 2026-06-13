import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { epicrisisService } from '@/services/epicrisis.service'
import type { LlmPredictions } from '@/types/db'
import type { ClinicalData } from '@/types/clinical'

export type EpicrisisStatus = 'pending' | 'in_review' | 'reviewed' | 'needs_expert_review'

export interface EpicrisisListItem {
  id: number
  patientId: string | null
  status: EpicrisisStatus
  assigneeId: number | null
  createdAt: string
  assigneeEmail: string | null
}

export interface EpicrisisSection {
  sectionName: string
  label: string
  content: string
  position: number
}

export interface EpicrisisDetail extends EpicrisisListItem {
  contentMarkdown?: string
  llmPredictions: LlmPredictions | null
  pdfPath: string | null
  fechaIngresoHosp: string | null
  fechaEgresoHosp: string | null
  fechaIngresoUci: string | null
  fechaEgresoUci: string | null
  comentarioFinal: string | null
  clinicalData: ClinicalData | null
  sections: EpicrisisSection[]
}

export const useEpicrisisStore = defineStore('epicrisis', () => {
  const list = ref<EpicrisisListItem[]>([])
  const current = ref<EpicrisisDetail | null>(null)
  const loading = ref(false)

  const pending = computed(() => list.value.filter((e) => e.status === 'pending'))
  const inReview = computed(() => list.value.filter((e) => e.status === 'in_review'))
  const reviewed = computed(() => list.value.filter((e) => e.status === 'reviewed'))
  const needsExpertReview = computed(() => list.value.filter((e) => e.status === 'needs_expert_review'))

  async function fetchList(silent = false) {
    if (!silent) loading.value = true
    try {
      const data = await epicrisisService.getList()
      list.value = data.epicrises
    } finally {
      if (!silent) loading.value = false
    }
  }

  async function fetchOne(id: number) {
    loading.value = true
    try {
      const data = await epicrisisService.getOne(id)
      current.value = data.epicrisis
    } finally {
      loading.value = false
    }
  }

  function updateStatus(id: number, status: EpicrisisListItem['status']) {
    const item = list.value.find((e) => e.id === id)
    if (item) item.status = status
    if (current.value?.id === id) current.value.status = status
  }

  return { list, current, loading, pending, inReview, reviewed, needsExpertReview, fetchList, fetchOne, updateStatus }
})
