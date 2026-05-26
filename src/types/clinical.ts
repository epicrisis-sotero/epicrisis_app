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
  vmiInicio: string
  vmiFin: string
  vmiComments: string

  // ── REANIMACIÓN ──
  maniobrasReanimacion: string
  ciclosParo: number | null
  cantidadParos: number | null

  // ── TRANSFUSIÓN ──
  transfusion: boolean | null
  transfusionEvidencia: string
  transfusionUnidades: number | null
  transfusionComments: string

  // ── DROGAS VASOACTIVAS ──
  drogasVasoactivas: boolean | null
  drogasVasoactivasEvidencia: string
  drogasVasoactivasMultiples: boolean | null
  drogasVasoactivasComments: string

  // ── CIRUGÍAS DURANTE HOSPITALIZACIÓN ──
  cirugiasHosp: number | null
  cirugiasHospDescripcion: string

  // ── INFECCIONES POR FOCO ──
  infeccionUrinario: boolean | null
  infeccionUrinarioEvidencia: string
  infeccionUrinarioGermen: string
  infeccionUrinarioComments: string

  infeccionRespiratorio: boolean | null
  infeccionRespiratorioEvidencia: string
  infeccionRespiratorioGermen: string
  infeccionRespiratorioComments: string

  infeccionVascular: boolean | null
  infeccionVascularEvidencia: string
  infeccionVascularGermen: string
  infeccionVascularComments: string

  infeccionSangre: boolean | null
  infeccionSangreEvidencia: string
  infeccionSangreGermen: string
  infeccionSangreComments: string

  infeccionCerebral: boolean | null
  infeccionCerebralEvidencia: string
  infeccionCerebralGermen: string
  infeccionCerebralComments: string

  infeccionCardiaco: boolean | null
  infeccionCardiacoEvidencia: string
  infeccionCardiacoGermen: string
  infeccionCardiacoComments: string

  infeccionQuirurgico: boolean | null
  infeccionQuirurgicoEvidencia: string
  infeccionQuirurgicoGermen: string
  infeccionQuirurgicoComments: string

  infeccionGastrointestinal: boolean | null
  infeccionGastrointestinalEvidencia: string
  infeccionGastrointestinalGermen: string
  infeccionGastrointestinalComments: string

  infeccionPielTejidos: boolean | null
  infeccionPielTejidosEvidencia: string
  infeccionPielTejidosGermen: string
  infeccionPielTejidosComments: string

  infeccionOsea: boolean | null
  infeccionOseaEvidencia: string
  infeccionOseaGermen: string
  infeccionOseaComments: string

  infeccionGeneral: boolean | null
  infeccionGeneralEvidencia: string
  infeccionGeneralGermen: string
  infeccionGeneralComments: string

  // ── TERAPIA DE REEMPLAZO RENAL ──
  trr: boolean | null
  trrEvidencia: string
  trrTipo: string
  trrComments: string

  // ── FALLA ORGÁNICA ──
  fallaRenal: boolean | null
  fallaRenalEvidencia: string
  fallaRenalComments: string

  fallaNervioso: boolean | null
  fallaNerviosoEvidencia: string
  fallaNerviosoComments: string

  fallaVascular: boolean | null
  fallaVascularEvidencia: string
  fallaVascularComments: string

  fallaCardiaco: boolean | null
  fallaCardiacoEvidencia: string
  fallaCardiacoComments: string

  fallaPulmonar: boolean | null
  fallaPulmonarEvidencia: string
  fallaPulmonarComments: string

  fallaHepatico: boolean | null
  fallaHepaticoEvidencia: string
  fallaHepaticoComments: string

  fallaOtra: boolean | null
  fallaOtraEvidencia: string
  fallaOtraDescripcion: string
  fallaOtraComments: string

  // ── DIAGNÓSTICOS Y EGRESO ──
  diagnosticoIngreso: string
  diagnosticoEgreso: string
  farmacosHosp: string
  mortalidad: boolean | null
  mortalidadEvidencia: string
  mortalidadComments: string
  hfav: boolean | null
  hfavEvidencia: string
  hfavComments: string
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
    vmiInicio: '',
    vmiFin: '',
    vmiComments: '',
    maniobrasReanimacion: '',
    ciclosParo: null,
    cantidadParos: null,
    transfusion: null,
    transfusionEvidencia: '',
    transfusionUnidades: null,
    transfusionComments: '',
    drogasVasoactivas: null,
    drogasVasoactivasEvidencia: '',
    drogasVasoactivasMultiples: null,
    drogasVasoactivasComments: '',
    cirugiasHosp: null,
    cirugiasHospDescripcion: '',
    infeccionUrinario: null,
    infeccionUrinarioEvidencia: '',
    infeccionUrinarioGermen: '',
    infeccionUrinarioComments: '',
    infeccionRespiratorio: null,
    infeccionRespiratorioEvidencia: '',
    infeccionRespiratorioGermen: '',
    infeccionRespiratorioComments: '',
    infeccionVascular: null,
    infeccionVascularEvidencia: '',
    infeccionVascularGermen: '',
    infeccionVascularComments: '',
    infeccionSangre: null,
    infeccionSangreEvidencia: '',
    infeccionSangreGermen: '',
    infeccionSangreComments: '',
    infeccionCerebral: null,
    infeccionCerebralEvidencia: '',
    infeccionCerebralGermen: '',
    infeccionCerebralComments: '',
    infeccionCardiaco: null,
    infeccionCardiacoEvidencia: '',
    infeccionCardiacoGermen: '',
    infeccionCardiacoComments: '',
    infeccionQuirurgico: null,
    infeccionQuirurgicoEvidencia: '',
    infeccionQuirurgicoGermen: '',
    infeccionQuirurgicoComments: '',
    infeccionGastrointestinal: null,
    infeccionGastrointestinalEvidencia: '',
    infeccionGastrointestinalGermen: '',
    infeccionGastrointestinalComments: '',
    infeccionPielTejidos: null,
    infeccionPielTejidosEvidencia: '',
    infeccionPielTejidosGermen: '',
    infeccionPielTejidosComments: '',

    infeccionOsea: null,
    infeccionOseaEvidencia: '',
    infeccionOseaGermen: '',
    infeccionOseaComments: '',

    infeccionGeneral: null,
    infeccionGeneralEvidencia: '',
    infeccionGeneralGermen: '',
    infeccionGeneralComments: '',
    trr: null,
    trrEvidencia: '',
    trrTipo: '',
    trrComments: '',
    fallaRenal: null,
    fallaRenalEvidencia: '',
    fallaRenalComments: '',
    fallaNervioso: null,
    fallaNerviosoEvidencia: '',
    fallaNerviosoComments: '',
    fallaVascular: null,
    fallaVascularEvidencia: '',
    fallaVascularComments: '',
    fallaCardiaco: null,
    fallaCardiacoEvidencia: '',
    fallaCardiacoComments: '',
    fallaPulmonar: null,
    fallaPulmonarEvidencia: '',
    fallaPulmonarComments: '',
    fallaHepatico: null,
    fallaHepaticoEvidencia: '',
    fallaHepaticoComments: '',
    fallaOtra: null,
    fallaOtraEvidencia: '',
    fallaOtraDescripcion: '',
    fallaOtraComments: '',
    diagnosticoIngreso: '',
    diagnosticoEgreso: '',
    farmacosHosp: '',
    mortalidad: null,
    mortalidadEvidencia: '',
    mortalidadComments: '',
    hfav: null,
    hfavEvidencia: '',
    hfavComments: '',
  }
}
