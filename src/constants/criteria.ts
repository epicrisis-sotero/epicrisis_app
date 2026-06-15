export interface Criterion {
  name: string
  label: string
  icd10Hint?: string
}

export const COMORBIDITIES: Criterion[] = [
  { name: 'hipertension_arterial',        label: 'Hipertensión Arterial',             icd10Hint: 'I10' },
  { name: 'hipertension_pulmonar',         label: 'Hipertensión Pulmonar',             icd10Hint: 'I27' },
  { name: 'enfermedad_pulmonar',           label: 'Enfermedad Pulmonar',               icd10Hint: 'J98' },
  { name: 'diabetes_tipo2_complicada',     label: 'Diabetes Tipo 2 Complicada',        icd10Hint: 'E11.6' },
  { name: 'diabetes_tipo2_no_complicada',  label: 'Diabetes Tipo 2 No Complicada',     icd10Hint: 'E11.9' },
  { name: 'enfermedad_renal_cronica',      label: 'Enfermedad Renal Crónica',          icd10Hint: 'N18' },
  { name: 'insuficiencia_cardiaca_clase_iv', label: 'Insuficiencia Cardíaca Clase IV', icd10Hint: 'I50' },
  { name: 'arritmias',                     label: 'Arritmias',                         icd10Hint: 'I49' },
  { name: 'neoplasia_hematologica',        label: 'Neoplasia Hematológica',            icd10Hint: 'C81-C96' },
  { name: 'cancer_metastasico',            label: 'Cáncer Metastásico',                icd10Hint: 'C77-C79' },
  { name: 'demencia',                      label: 'Demencia',                          icd10Hint: 'F00-F03' },
  { name: 'consumo_tabaco',                label: 'Consumo de Tabaco',                 icd10Hint: 'F17' },
  { name: 'consumo_alcohol',               label: 'Consumo de Alcohol',                icd10Hint: 'F10' },
  { name: 'consumo_otras',                 label: 'Consumo de Otras Drogas',           icd10Hint: 'F11-F19' },
  { name: 'epoc',                          label: 'EPOC',                              icd10Hint: 'J44' },
  { name: 'accidente_cerebrovascular',     label: 'Accidente Cerebrovascular',         icd10Hint: 'I63-I64' },
  { name: 'postracion',                    label: 'Postración',                        icd10Hint: 'R53' },
  { name: 'infecciones_previas',           label: 'Infecciones Previas',               icd10Hint: 'Z87.3' },
]
