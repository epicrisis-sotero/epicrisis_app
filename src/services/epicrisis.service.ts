import { api } from './api'
import type { EpicrisisDetail, EpicrisisListItem } from '@/stores/epicrisis'

export const epicrisisService = {
  getList: () => api.get<{ epicrises: EpicrisisListItem[] }>('/epicrisis'),
  getOne: (id: number) => api.get<{ epicrisis: EpicrisisDetail }>(`/epicrisis?id=${id}`),
  getLayout: (id: number) => api.get<any>(`/epicrisis/${id}/layout`),
}
