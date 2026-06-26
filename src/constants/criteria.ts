import { COMORBIDITIES as V3_COMORBIDITIES } from './formSchema'

export interface Criterion {
  name: string
  label: string
  icd10Hint?: string
}

export const COMORBIDITIES: Criterion[] = V3_COMORBIDITIES
