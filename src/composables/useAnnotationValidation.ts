import { watch } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import { useToast } from '@/composables/useToast'
import type { ClinicalData } from '@/types/clinical'
import { normalizeFecha } from '@/utils/fecha'
import { COMORBIDITIES } from '@/constants/criteria'

export type RuleSeverity = 'error' | 'warning'

// HU-003 (admin): condiciones críticas que, si se marcan "Sí", deberían tener
// evidencia (ground truth) capturada o escrita. Pares [booleano, campoEvidencia].
const CRITICAL_EVIDENCE_PAIRS: Array<[keyof ClinicalData, keyof ClinicalData]> = [
  ['vmi', 'vmiEvidencia'],
  ['vmni', 'vmniEvidencia'],
  ['transfusion', 'transfusionEvidencia'],
  ['drogasVasoactivas', 'drogasVasoactivasEvidencia'],
  ['trr', 'trrEvidencia'],
  ['sepsis', 'sepsisEvidencia'],
  ['fallaRenal', 'fallaRenalEvidencia'],
  ['fallaNervioso', 'fallaNerviosoEvidencia'],
  ['fallaVascular', 'fallaVascularEvidencia'],
  ['fallaCardiaco', 'fallaCardiacoEvidencia'],
  ['fallaPulmonar', 'fallaPulmonarEvidencia'],
  ['fallaHepatico', 'fallaHepaticoEvidencia'],
  ['fallaOtra', 'fallaOtraEvidencia'],
  ['fallecimiento', 'fallecimientoEvidencia'],
  ['hfav', 'hfavEvidencia'],
  ['infeccionUrinario', 'infeccionUrinarioEvidencia'],
  ['infeccionRespiratorio', 'infeccionRespiratorioEvidencia'],
  ['infeccionVascular', 'infeccionVascularEvidencia'],
  ['infeccionSangre', 'infeccionSangreEvidencia'],
  ['infeccionCerebral', 'infeccionCerebralEvidencia'],
  ['infeccionCardiaco', 'infeccionCardiacoEvidencia'],
  ['infeccionQuirurgico', 'infeccionQuirurgicoEvidencia'],
  ['infeccionGastrointestinal', 'infeccionGastrointestinalEvidencia'],
  ['infeccionPielTejidos', 'infeccionPielTejidosEvidencia'],
  ['infeccionOsea', 'infeccionOseaEvidencia'],
  ['infeccionGeneral', 'infeccionGeneralEvidencia'],
]

export interface ValidationRule {
  id: string
  message: string | (() => string)
  severity: RuleSeverity
  // Returns true when the rule is VIOLATED
  check: () => boolean
  // Si es false, la regla solo se evalúa al enviar (getViolations), no en el
  // path reactivo (validateAndNotify). Default: true.
  reactive?: boolean
}

export interface RuleViolation {
  id: string
  message: string
  severity: RuleSeverity
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null
  // HU-008: normalizar primero (acepta año de 2 dígitos y separadores flexibles)
  const flexible = normalizeFecha(s)
  // DD/MM/YYYY (formato chileno) → YYYY-MM-DD antes de parsear
  const normalized = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(flexible)
    ? flexible.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, '$3-$2-$1')
    : flexible
  const d = new Date(normalized)
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

    // ── Transfusión ──────────────────────────────────────────────────────────
    {
      id: 'transfusion_unidades_positive',
      severity: 'error',
      message: 'Unidades de transfusión deben ser un número positivo.',
      check: () => {
        const u = store.clinicalData.transfusionUnidades
        return u !== null && (!Number.isInteger(u) || u <= 0)
      },
    },

    // ── HU-003: "Sí" en condición crítica sin evidencia capturada ────────────
    {
      id: 'critical_yes_without_evidence',
      severity: 'warning',
      // Solo al enviar (HU-003 crit 3: "al intentar guardar"), no reactivo,
      // para no generar toasts ruidosos mientras el anotador todavía completa.
      reactive: false,
      message: () => {
        const missingLabels: string[] = []
        
        CRITICAL_EVIDENCE_PAIRS.forEach(([boolKey, evKey]) => {
          if (store.clinicalData[boolKey] === true && !String(store.clinicalData[evKey] ?? '').trim()) {
            missingLabels.push(String(boolKey))
          }
        })

        store.criteria.forEach((c) => {
          if (c.isPresent === true && !String(c.evidenceText ?? '').trim()) {
            const def = COMORBIDITIES.find(x => x.name === c.criterionName)
            missingLabels.push(def ? def.label : c.criterionName)
          }
        })

        if (missingLabels.length > 0) {
          return `Falta evidencia en: ${missingLabels.join(', ')}.`
        }
        return 'Marcaste "Sí" en una o más condiciones críticas o diagnósticos sin capturar evidencia (ground truth).'
      },
      check: () => {
        const clinicalMissing = CRITICAL_EVIDENCE_PAIRS.some(
          ([boolKey, evKey]) =>
            store.clinicalData[boolKey] === true &&
            !String(store.clinicalData[evKey] ?? '').trim(),
        )
        if (clinicalMissing) return true

        const criteriaMissing = store.criteria.some(
          (c) => c.isPresent === true && !String(c.evidenceText ?? '').trim()
        )
        return criteriaMissing
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
  function getViolations(): RuleViolation[] {
    return rules.filter((r) => r.check()).map(r => ({
      id: r.id,
      severity: r.severity,
      message: typeof r.message === 'function' ? r.message() : r.message
    }))
  }

  function hasErrors(): boolean {
    return rules.some((r) => r.severity === 'error' && r.check())
  }

  // Called reactively on field changes: shows new violations, auto-dismisses resolved ones
  function validateAndNotify() {
    for (const rule of rules) {
      if (rule.reactive === false) continue
      const msg = typeof rule.message === 'function' ? rule.message() : rule.message
      if (rule.check()) {
        show(msg, rule.severity)
      } else {
        dismissByMessage(msg)
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
        () => store.clinicalData.transfusionUnidades,
      ],
      () => validateAndNotify(),
    )
  }

  return { rules, getViolations, hasErrors, validateAndNotify, attachWatchers }
}
