export interface ClinicalData {
  // ── ANTECEDENTES ──
  cirugiaPrevias: boolean | null
  cirugiasPreviasCantidad: number | null
  farmacos: string

  // ── SOPORTE VENTILATORIO ──
  vmi: boolean | null
  vmiEvidencia: string
  vmiMotivo: string
  vmiUrgente: boolean | null
  vmiProno: boolean | null

  // ── REANIMACIÓN ──
  maniobrasReanimacion: string
  ciclosParo: number | null
  cantidadParos: number | null

  // ── TRANSFUSIÓN ──
  transfusion: boolean | null
  transfusionEvidencia: string
  transfusionUnidades: number | null

  // ── DROGAS VASOACTIVAS ──
  drogasVasoactivas: boolean | null
  drogasVasoactivasEvidencia: string
  drogasVasoactivasMultiples: boolean | null

  // ── CIRUGÍAS DURANTE HOSPITALIZACIÓN ──
  cirugiasHosp: number | null
  cirugiasHospDescripcion: string

  // ── INFECCIONES POR FOCO ──
  infeccionUrinario: boolean | null
  infeccionUrinarioEvidencia: string
  infeccionUrinarioGermen: string

  infeccionRespiratorio: boolean | null
  infeccionRespiratorioEvidencia: string
  infeccionRespiratorioGermen: string

  infeccionVascular: boolean | null
  infeccionVascularEvidencia: string
  infeccionVascularGermen: string

  infeccionSangre: boolean | null
  infeccionSangreEvidencia: string
  infeccionSangreGermen: string

  infeccionCerebral: boolean | null
  infeccionCerebralEvidencia: string
  infeccionCerebralGermen: string

  infeccionCardiaco: boolean | null
  infeccionCardiacoEvidencia: string
  infeccionCardiacoGermen: string

  infeccionQuirurgico: boolean | null
  infeccionQuirurgicoEvidencia: string
  infeccionQuirurgicoGermen: string

  infeccionGastrointestinal: boolean | null
  infeccionGastrointestinalEvidencia: string
  infeccionGastrointestinalGermen: string

  infeccionPielTejidos: boolean | null
  infeccionPielTejidosEvidencia: string
  infeccionPielTejidosGermen: string

  // ── TERAPIA DE REEMPLAZO RENAL ──
  trr: boolean | null
  trrEvidencia: string
  trrTipo: string

  // ── FALLA ORGÁNICA ──
  fallaRenal: boolean | null
  fallaRenalEvidencia: string

  fallaNervioso: boolean | null
  fallaNerviosoEvidencia: string

  fallaVascular: boolean | null
  fallaVascularEvidencia: string

  fallaCardiaco: boolean | null
  fallaCardiacoEvidencia: string

  fallaPulmonar: boolean | null
  fallaPulmonarEvidencia: string

  fallaHepatico: boolean | null
  fallaHepaticoEvidencia: string

  fallaOtra: boolean | null
  fallaOtraEvidencia: string
  fallaOtraDescripcion: string

  // ── DIAGNÓSTICOS Y EGRESO ──
  diagnosticoIngreso: string
  diagnosticoEgreso: string
  farmacosHosp: string
  mortalidad: boolean | null
  hfav: boolean | null
}

export function defaultClinicalData(): ClinicalData {
  return {
    cirugiaPrevias: null,
    cirugiasPreviasCantidad: null,
    farmacos: '',
    vmi: null,
    vmiEvidencia: '',
    vmiMotivo: '',
    vmiUrgente: null,
    vmiProno: null,
    maniobrasReanimacion: '',
    ciclosParo: null,
    cantidadParos: null,
    transfusion: null,
    transfusionEvidencia: '',
    transfusionUnidades: null,
    drogasVasoactivas: null,
    drogasVasoactivasEvidencia: '',
    drogasVasoactivasMultiples: null,
    cirugiasHosp: null,
    cirugiasHospDescripcion: '',
    infeccionUrinario: null,
    infeccionUrinarioEvidencia: '',
    infeccionUrinarioGermen: '',
    infeccionRespiratorio: null,
    infeccionRespiratorioEvidencia: '',
    infeccionRespiratorioGermen: '',
    infeccionVascular: null,
    infeccionVascularEvidencia: '',
    infeccionVascularGermen: '',
    infeccionSangre: null,
    infeccionSangreEvidencia: '',
    infeccionSangreGermen: '',
    infeccionCerebral: null,
    infeccionCerebralEvidencia: '',
    infeccionCerebralGermen: '',
    infeccionCardiaco: null,
    infeccionCardiacoEvidencia: '',
    infeccionCardiacoGermen: '',
    infeccionQuirurgico: null,
    infeccionQuirurgicoEvidencia: '',
    infeccionQuirurgicoGermen: '',
    infeccionGastrointestinal: null,
    infeccionGastrointestinalEvidencia: '',
    infeccionGastrointestinalGermen: '',
    infeccionPielTejidos: null,
    infeccionPielTejidosEvidencia: '',
    infeccionPielTejidosGermen: '',
    trr: null,
    trrEvidencia: '',
    trrTipo: '',
    fallaRenal: null,
    fallaRenalEvidencia: '',
    fallaNervioso: null,
    fallaNerviosoEvidencia: '',
    fallaVascular: null,
    fallaVascularEvidencia: '',
    fallaCardiaco: null,
    fallaCardiacoEvidencia: '',
    fallaPulmonar: null,
    fallaPulmonarEvidencia: '',
    fallaHepatico: null,
    fallaHepaticoEvidencia: '',
    fallaOtra: null,
    fallaOtraEvidencia: '',
    fallaOtraDescripcion: '',
    diagnosticoIngreso: '',
    diagnosticoEgreso: '',
    farmacosHosp: '',
    mortalidad: null,
    hfav: null,
  }
}
