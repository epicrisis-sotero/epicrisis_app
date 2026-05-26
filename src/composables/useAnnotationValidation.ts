import { watch } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import { useToast } from '@/composables/useToast'

export type RuleSeverity = 'error' | 'warning'

export interface ValidationRule {
  id: string
  message: string
  severity: RuleSeverity
  // Returns true when the rule is VIOLATED
  check: () => boolean
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function useAnnotationValidation() {
  const store = useAnnotationStore()
  const { show, dismissByMessage } = useToast()

  const rules: ValidationRule[] = [
    // ── Inversiones de fechas hospitalarias ──────────────────────────────────
    {
      id: 'hosp_order',
      severity: 'error',
      message: 'Ingreso hospitalario es posterior al egreso. Revisa las fechas.',
      check: () => {
        const a = parseDate(store.fechaIngresoHosp)
        const b = parseDate(store.fechaEgresoHosp)
        return !!(a && b && a > b)
      },
    },
    {
      id: 'uci_order',
      severity: 'error',
      message: 'Ingreso UCI es posterior al egreso UCI. Revisa las fechas.',
      check: () => {
        const a = parseDate(store.fechaIngresoUci)
        const b = parseDate(store.fechaEgresoUci)
        return !!(a && b && a > b)
      },
    },
    {
      id: 'vmi_order',
      severity: 'error',
      message: 'Inicio VMI es posterior al fin VMI. Revisa las fechas.',
      check: () => {
        const a = parseDate(store.clinicalData.vmiInicio)
        const b = parseDate(store.clinicalData.vmiFin)
        return !!(a && b && a > b)
      },
    },

    // ── VMI fuera del período de hospitalización ─────────────────────────────
    {
      id: 'vmi_before_hosp',
      severity: 'warning',
      message: 'Inicio VMI es anterior al ingreso hospitalario.',
      check: () => {
        const vmi = parseDate(store.clinicalData.vmiInicio)
        const hosp = parseDate(store.fechaIngresoHosp)
        return !!(vmi && hosp && vmi < hosp)
      },
    },
    {
      id: 'vmi_after_discharge',
      severity: 'warning',
      message: 'Fin VMI es posterior al egreso hospitalario.',
      check: () => {
        const vmi = parseDate(store.clinicalData.vmiFin)
        const egreso = parseDate(store.fechaEgresoHosp)
        return !!(vmi && egreso && vmi > egreso)
      },
    },

    // ── UCI fuera del período de hospitalización ─────────────────────────────
    {
      id: 'uci_before_hosp',
      severity: 'warning',
      message: 'Ingreso UCI es anterior al ingreso hospitalario.',
      check: () => {
        const uci = parseDate(store.fechaIngresoUci)
        const hosp = parseDate(store.fechaIngresoHosp)
        return !!(uci && hosp && uci < hosp)
      },
    },
    {
      id: 'uci_after_discharge',
      severity: 'warning',
      message: 'Egreso UCI es posterior al egreso hospitalario.',
      check: () => {
        const uci = parseDate(store.fechaEgresoUci)
        const egreso = parseDate(store.fechaEgresoHosp)
        return !!(uci && egreso && uci > egreso)
      },
    },

    // ── Fechas en el futuro ───────────────────────────────────────────────────
    {
      id: 'future_dates',
      severity: 'warning',
      message: 'Una o más fechas están en el futuro. Verifica el documento.',
      check: () => {
        const t = today()
        const dates = [
          store.fechaIngresoHosp,
          store.fechaEgresoHosp,
          store.fechaIngresoUci,
          store.fechaEgresoUci,
          store.clinicalData.vmiInicio,
          store.clinicalData.vmiFin,
        ]
        return dates.some((d) => { const p = parseDate(d); return p !== null && p > t })
      },
    },
  ]

  // Returns violated rules — useful for blocking save
  function getViolations(): ValidationRule[] {
    return rules.filter((r) => r.check())
  }

  function hasErrors(): boolean {
    return rules.some((r) => r.severity === 'error' && r.check())
  }

  // Called reactively on field changes: shows new violations, auto-dismisses resolved ones
  function validateAndNotify() {
    for (const rule of rules) {
      if (rule.check()) {
        show(rule.message, rule.severity)
      } else {
        dismissByMessage(rule.message)
      }
    }
  }

  // Set up reactive watchers for all date fields
  function attachWatchers() {
    watch(
      [
        () => store.fechaIngresoHosp,
        () => store.fechaEgresoHosp,
        () => store.fechaIngresoUci,
        () => store.fechaEgresoUci,
        () => store.clinicalData.vmiInicio,
        () => store.clinicalData.vmiFin,
      ],
      () => validateAndNotify(),
    )
  }

  return { rules, getViolations, hasErrors, validateAndNotify, attachWatchers }
}
