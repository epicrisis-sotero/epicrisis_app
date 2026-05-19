// Tipos compartidos de la capa de base de datos — importar desde aquí en el frontend
export interface LlmPrediction {
  valor: boolean | null
  metodo: string
  confianza: number
  evidencia: string
  conflicto: boolean
  requiere_llm: boolean
  num_presentes: number
  num_ausentes: number
  _evidencia_llm?: string
  _razonamiento_llm?: string
}

export type LlmPredictions = Record<string, LlmPrediction>
