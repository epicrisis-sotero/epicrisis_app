export type NodeType = 'mother' | 'leaf' | 'date' | 'select' | 'number' | 'text'

export interface FormNode {
  id: string
  key: string
  label: string
  type: NodeType
  choices?: string[]
  mutuallyExclusiveWith?: string[] // sibling keys that must be unchecked when this is checked
  dependsOnParentState?: boolean  // if true, only visible/enabled if parent state is true or not No
  children?: FormNode[]
  synonyms?: string[]
  icd10Hint?: string
  placeholder?: string
}

export const FORM_SCHEMA: FormNode[] = [
  // ── BLOQUE 1 ──
  {
    id: '1',
    key: 'hospitalizacion',
    label: 'Bloque 1. Datos de la hospitalización',
    type: 'mother',
    children: [
      { id: '1.1', key: 'hospitalizacion.fecha_ingreso', label: 'Fecha de ingreso al hospital', type: 'date', placeholder: 'DD/MM/AAAA' },
      { id: '1.2', key: 'hospitalizacion.fecha_egreso', label: 'Fecha de egreso del hospital', type: 'date', placeholder: 'DD/MM/AAAA' }
    ]
  },
  // ── BLOQUE 2 ──
  {
    id: '2',
    key: 'antecedentes',
    label: 'Bloque 2. Antecedentes',
    type: 'mother',
    children: [
      {
        id: '2.1',
        key: 'antecedentes.medicos',
        label: 'Antecedentes médicos',
        type: 'mother',
        children: [
          {
            id: '2.1.1',
            key: 'antecedentes.cardiovascular',
            label: 'Cardiovascular',
            type: 'mother',
            children: [
              { id: '2.1.1.1', key: 'antecedentes.cardiovascular.hipertension_arterial', label: 'Hipertensión arterial', type: 'leaf', icd10Hint: 'I10', synonyms: ['hta', 'hipertenso', 'tension'] },
              { id: '2.1.1.2', key: 'antecedentes.cardiovascular.enfermedad_coronaria', label: 'Enfermedad coronaria', type: 'leaf', icd10Hint: 'I25.9', synonyms: ['iam', 'infarto', 'angina', 'isquemia', 'bypass'] },
              { id: '2.1.1.3', key: 'antecedentes.cardiovascular.accidente_cerebrovascular_previo', label: 'Accidente cerebrovascular previo', type: 'leaf', icd10Hint: 'I63', synonyms: ['acv', 'ave', 'stroke', 'derrame', 'isquemico'] },
              { id: '2.1.1.4', key: 'antecedentes.cardiovascular.enfermedad_vascular_periferica', label: 'Enfermedad vascular periférica', type: 'leaf', icd10Hint: 'I73.9', synonyms: ['evp', 'claudicacion', 'arterial'] },
              { id: '2.1.1.5', key: 'antecedentes.cardiovascular.arritmia_cronica', label: 'Arritmia crónica', type: 'leaf', icd10Hint: 'I49', synonyms: ['fa', 'fibrilacion', 'marcapasos', 'flutter'] },
              { id: '2.1.1.6', key: 'antecedentes.cardiovascular.insuficiencia_cardiaca', label: 'Insuficiencia cardíaca', type: 'leaf', icd10Hint: 'I50', synonyms: ['ic', 'icc', 'congestiva', 'fevi'] },
              { id: '2.1.1.7', key: 'antecedentes.cardiovascular.valvulopatia_significativa', label: 'Valvulopatía significativa', type: 'leaf', icd10Hint: 'I38', synonyms: ['estenosis', 'insuficiencia mitral', 'aortica'] },
              { id: '2.1.1.8', key: 'antecedentes.cardiovascular.hipertension_pulmonar', label: 'Hipertensión pulmonar', type: 'leaf', icd10Hint: 'I27.2', synonyms: ['htp'] },
              { id: '2.1.1.9', key: 'antecedentes.cardiovascular.dispositivo_cardiaco', label: 'Dispositivo cardíaco (marcapasos, desfibrilador)', type: 'leaf', icd10Hint: 'Z95.0', synonyms: ['dai', 'marcapaso', 'resincronizador'] },
              { id: '2.1.1.10', key: 'antecedentes.cardiovascular.otra_cardiovascular', label: 'Otra cardiovascular', type: 'leaf' }
            ]
          },
          {
            id: '2.1.2',
            key: 'antecedentes.metabolico_endocrino',
            label: 'Metabólico / endocrino',
            type: 'mother',
            children: [
              {
                id: '2.1.2.1',
                key: 'antecedentes.metabolico_endocrino.diabetes_mellitus',
                label: 'Diabetes mellitus',
                type: 'leaf',
                icd10Hint: 'E10-E14',
                synonyms: ['dm', 'dm2', 'dm1', 'hiperglucemia', 'insulina'],
                children: [
                  {
                    id: '2.1.2.1.1',
                    key: 'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1',
                    label: 'Tipo 1',
                    type: 'leaf',
                    mutuallyExclusiveWith: [
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2',
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada'
                    ]
                  },
                  {
                    id: '2.1.2.1.2',
                    key: 'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2',
                    label: 'Tipo 2',
                    type: 'leaf',
                    mutuallyExclusiveWith: [
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1',
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada'
                    ]
                  },
                  {
                    id: '2.1.2.1.3',
                    key: 'antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada',
                    label: 'No especificada',
                    type: 'leaf',
                    mutuallyExclusiveWith: [
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1',
                      'antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2'
                    ]
                  },
                  { id: '2.1.2.1.4', key: 'antecedentes.metabolico_endocrino.diabetes_mellitus.complicada', label: 'Complicada', type: 'leaf', synonyms: ['cetoacidosis', 'nefropatia', 'retinopatia'] }
                ]
              },
              { id: '2.1.2.2', key: 'antecedentes.metabolico_endocrino.obesidad', label: 'Obesidad', type: 'leaf', icd10Hint: 'E66', synonyms: ['sobrepeso', 'imc', 'obeso'] },
              { id: '2.1.2.3', key: 'antecedentes.metabolico_endocrino.dislipidemia', label: 'Dislipidemia', type: 'leaf', icd10Hint: 'E78.5', synonyms: ['colesterol', 'trigliceridos', 'hipercolesterolemia'] },
              { id: '2.1.2.4', key: 'antecedentes.metabolico_endocrino.hipotiroidismo', label: 'Hipotiroidismo', type: 'leaf', icd10Hint: 'E03.9', synonyms: ['tiroides', 'levotiroxina'] },
              { id: '2.1.2.5', key: 'antecedentes.metabolico_endocrino.otra_metabolica_endocrina', label: 'Otra metabólica o endocrina', type: 'leaf' }
            ]
          },
          {
            id: '2.1.3',
            key: 'antecedentes.renal',
            label: 'Renal',
            type: 'mother',
            children: [
              { id: '2.1.3.1', key: 'antecedentes.renal.enfermedad_renal_cronica', label: 'Enfermedad renal crónica', type: 'leaf', icd10Hint: 'N18', synonyms: ['erc', 'irc', 'creatinina', 'insuficiencia renal'] },
              { id: '2.1.3.2', key: 'antecedentes.renal.terapia_dialitica_cronica', label: 'Terapia dialítica crónica', type: 'leaf', icd10Hint: 'Z99.2', synonyms: ['dialisis', 'hemodialisis', 'peritoneodialisis'] },
              { id: '2.1.3.3', key: 'antecedentes.renal.trasplante_renal_previo', label: 'Trasplante renal previo', type: 'leaf', icd10Hint: 'Z94.0', synonyms: ['injerto renal'] },
              { id: '2.1.3.4', key: 'antecedentes.renal.otra_renal', label: 'Otra renal', type: 'leaf' }
            ]
          },
          {
            id: '2.1.4',
            key: 'antecedentes.pulmonar',
            label: 'Pulmonar',
            type: 'mother',
            children: [
              { id: '2.1.4.1', key: 'antecedentes.pulmonar.epoc', label: 'Enfermedad pulmonar obstructiva crónica (EPOC)', type: 'leaf', icd10Hint: 'J44', synonyms: ['enfisema', 'bronquitis cronica'] },
              { id: '2.1.4.2', key: 'antecedentes.pulmonar.asma', label: 'Asma', type: 'leaf', icd10Hint: 'J45', synonyms: ['asmatico', 'broncoespasmo'] },
              { id: '2.1.4.3', key: 'antecedentes.pulmonar.enfermedad_pulmonar_intersticial_difusa', label: 'Enfermedad pulmonar intersticial difusa', type: 'leaf', icd10Hint: 'J84.9', synonyms: ['epid', 'fibrosis pulmonar'] },
              { id: '2.1.4.4', key: 'antecedentes.pulmonar.sindrome_apnea_hipopnea_obstructiva', label: 'Síndrome de apnea-hipopnea obstructiva del sueño', type: 'leaf', icd10Hint: 'G47.3', synonyms: ['sahos', 'cpap', 'apnea'] },
              { id: '2.1.4.5', key: 'antecedentes.pulmonar.oxigeno_domiciliario', label: 'Oxígeno domiciliario', type: 'leaf', icd10Hint: 'Z99.8', synonyms: ['ocd', 'oxigenoterapia'] },
              { id: '2.1.4.6', key: 'antecedentes.pulmonar.otra_respiratoria', label: 'Otra respiratoria', type: 'leaf' }
            ]
          },
          {
            id: '2.1.5',
            key: 'antecedentes.hepatico_digestivo',
            label: 'Hepático / digestivo',
            type: 'mother',
            children: [
              {
                id: '2.1.5.1',
                key: 'antecedentes.hepatico_digestivo.cirrosis',
                label: 'Daño hepático crónico o cirrosis',
                type: 'leaf',
                icd10Hint: 'K74.6',
                synonyms: ['dhc', 'hepatopatia', 'alcoholica', 'ascitis', 'varices esofagicas'],
                children: [
                  { id: '2.1.5.1.1', key: 'antecedentes.hepatico_digestivo.cirrosis.complicada', label: 'Complicada', type: 'leaf', synonyms: ['encefalopatia', 'hemorragia digestiva', 'varicosa', 'sindrome hepatorrenal'] }
                ]
              },
              { id: '2.1.5.2', key: 'antecedentes.hepatico_digestivo.trasplante_hepatico', label: 'Trasplante hepático', type: 'leaf', icd10Hint: 'Z94.4' },
              { id: '2.1.5.3', key: 'antecedentes.hepatico_digestivo.enfermedad_inflamatoria_intestinal', label: 'Enfermedad inflamatoria intestinal', type: 'leaf', icd10Hint: 'K50/K51', synonyms: ['eii', 'crohn', 'colitis ulcerosa'] },
              { id: '2.1.5.4', key: 'antecedentes.hepatico_digestivo.otra_hepatica_digestiva', label: 'Otra hepática o digestiva', type: 'leaf' }
            ]
          },
          {
            id: '2.1.6',
            key: 'antecedentes.oncologico_hematologico',
            label: 'Oncológico / hematológico',
            type: 'mother',
            children: [
              { id: '2.1.6.1', key: 'antecedentes.oncologico_hematologico.neoplasia_solida_activa', label: 'Neoplasia sólida activa', type: 'leaf', icd10Hint: 'C00-C75', synonyms: ['cancer', 'tumor', 'quimioterapia', 'radioterapia'] },
              { id: '2.1.6.2', key: 'antecedentes.oncologico_hematologico.neoplasia_hematologica_activa', label: 'Neoplasia hematológica activa', type: 'leaf', icd10Hint: 'C81-C96', synonyms: ['leucemia', 'linfoma', 'mieloma'] },
              { id: '2.1.6.3', key: 'antecedentes.oncologico_hematologico.trasplante_progenitores_previo', label: 'Trasplante de progenitores hematopoyéticos previo', type: 'leaf', icd10Hint: 'Z94.8', synonyms: ['tph', 'medula osea'] },
              { id: '2.1.6.4', key: 'antecedentes.oncologico_hematologico.enfermedad_tromboembolica', label: 'Enfermedad tromboembólica previa o actual', type: 'leaf', icd10Hint: 'I82.9', synonyms: ['etv', 'tvp', 'tep', 'trombosis', 'embolia'] },
              { id: '2.1.6.5', key: 'antecedentes.oncologico_hematologico.otra_oncologica_hematologica', label: 'Otra oncológica o hematológica', type: 'leaf' }
            ]
          },
          {
            id: '2.1.7',
            key: 'antecedentes.inmunologico_reumatologico',
            label: 'Inmunológico / reumatológico',
            type: 'mother',
            children: [
              { id: '2.1.7.1', key: 'antecedentes.inmunologico_reumatologico.autoinmune_tratamiento', label: 'Enfermedad autoinmune en tratamiento', type: 'leaf', icd10Hint: 'M35.9', synonyms: ['lupus', 'les', 'artritis reumatoide', 'ar', 'esclerosis'] },
              { id: '2.1.7.2', key: 'antecedentes.inmunologico_reumatologico.trasplante_organo_solido_otro', label: 'Trasplante de órgano sólido distinto del renal y hepático', type: 'leaf', icd10Hint: 'Z94', synonyms: ['trasplante cardiaco', 'trasplante pulmonar'] },
              { id: '2.1.7.3', key: 'antecedentes.inmunologico_reumatologico.inmunosupresion_cronica', label: 'Inmunosupresión crónica no relacionada a infección ni a trasplante', type: 'leaf', icd10Hint: 'D84.9', synonyms: ['prednisona cronica', 'inmunosupresores'] },
              { id: '2.1.7.4', key: 'antecedentes.inmunologico_reumatologico.otra_inmunologica_reumatologica', label: 'Otra inmunológica o reumatológica', type: 'leaf' }
            ]
          },
          {
            id: '2.1.8',
            key: 'antecedentes.infeccioso',
            label: 'Infeccioso',
            type: 'mother',
            children: [
              { id: '2.1.8.1', key: 'antecedentes.infeccioso.vih', label: 'VIH', type: 'leaf', icd10Hint: 'B20', synonyms: ['sida', 'virus inmunodeficiencia'] },
              {
                id: '2.1.8.2',
                key: 'antecedentes.infeccioso.tuberculosis',
                label: 'Tuberculosis',
                type: 'leaf',
                icd10Hint: 'A15',
                synonyms: ['tbc', 'baciloscopia', 'koch'],
                children: [
                  { id: '2.1.8.2.1', key: 'antecedentes.infeccioso.tuberculosis.activa', label: 'Activa', type: 'leaf' }
                ]
              },
              { id: '2.1.8.3', key: 'antecedentes.infeccioso.hepatitis_viral_cronica', label: 'Hepatitis viral crónica, B o C', type: 'leaf', icd10Hint: 'B18', synonyms: ['vhb', 'vhc'] },
              { id: '2.1.8.4', key: 'antecedentes.infeccioso.otra_infeccion_cronica', label: 'Otra infección crónica relevante', type: 'leaf' }
            ]
          },
          {
            id: '2.1.9',
            key: 'antecedentes.neurologico',
            label: 'Neurológico',
            type: 'mother',
            children: [
              { id: '2.1.9.1', key: 'antecedentes.neurologico.demencia', label: 'Demencia o deterioro cognitivo mayor', type: 'leaf', icd10Hint: 'F03', synonyms: ['alzheimer', 'cognitivo', 'senil'] },
              { id: '2.1.9.2', key: 'antecedentes.neurologico.epilepsia', label: 'Epilepsia', type: 'leaf', icd10Hint: 'G40', synonyms: ['convulsiones', 'crisis convulsiva'] },
              { id: '2.1.9.3', key: 'antecedentes.neurologico.parkinson', label: 'Parkinson o parkinsonismo', type: 'leaf', icd10Hint: 'G20' },
              { id: '2.1.9.4', key: 'antecedentes.neurologico.secuela_neurologica', label: 'Secuela neurológica crónica', type: 'leaf', icd10Hint: 'G98', synonyms: ['post-infarto cerebral', 'hemiplejia', 'paralisis'] },
              { id: '2.1.9.5', key: 'antecedentes.neurologico.otra_neurologica', label: 'Otra neurológica', type: 'leaf' }
            ]
          },
          { id: '2.1.10', key: 'antecedentes.otro_antecedente_medico', label: 'Otro antecedente médico', type: 'leaf' }
        ]
      },
      { id: '2.2', key: 'antecedentes.quirurgicos', label: 'Antecedentes quirúrgicos', type: 'leaf', synonyms: ['operaciones previas', 'cirugias', 'quirurgico'] },
      { id: '2.3', key: 'antecedentes.alergias', label: 'Alergias', type: 'leaf', synonyms: ['alergeno', 'ram', 'hipersensibilidad'] },
      {
        id: '2.4',
        key: 'antecedentes.habitos',
        label: 'Hábitos',
        type: 'mother',
        children: [
          {
            id: '2.4.1',
            key: 'antecedentes.habitos.tabaquismo',
            label: 'Tabaquismo',
            type: 'leaf',
            synonyms: ['tabaco', 'fumar', 'cigarrillo', 'fumador'],
            children: [
              { id: '2.4.1.1', key: 'antecedentes.habitos.tabaquismo.carga', label: 'Carga tabáquica (Cigarrillos al día / Años de consumo)', type: 'leaf' }
            ]
          },
          {
            id: '2.4.2',
            key: 'antecedentes.habitos.alcohol',
            label: 'Alcohol',
            type: 'leaf',
            synonyms: ['etanol', 'bebidas alcoholicas', 'bebedor', 'etilico'],
            children: [
              { id: '2.4.2.1', key: 'antecedentes.habitos.alcohol.carga', label: 'Carga alcohólica', type: 'leaf' }
            ]
          },
          { id: '2.4.3', key: 'antecedentes.habitos.otras_sustancias', label: 'Otras sustancias', type: 'leaf', synonyms: ['drogas', 'cocaina', 'marihuana', 'abuso'] }
        ]
      },
      { id: '2.5', key: 'antecedentes.dependencia_funcional', label: 'Dependencia funcional', type: 'leaf', synonyms: ['postrado', 'karnofsky', 'barthel', 'postracion'] }
    ]
  },
  // ── BLOQUE 3 ──
  {
    id: '3',
    key: 'ingreso',
    label: 'Bloque 3. Ingreso',
    type: 'mother',
    children: [
      { id: '3.1', key: 'ingreso.fecha_ingreso_upc', label: 'Fecha de ingreso a UPC', type: 'leaf' },
      { id: '3.2', key: 'ingreso.unidad_origen', label: 'Unidad de origen', type: 'leaf', synonyms: ['procedencia', 'urgencia', 'pabellon'] },
      {
        id: '3.3',
        key: 'ingreso.diagnostico',
        label: 'Diagnóstico de ingreso',
        type: 'mother',
        children: [
          { id: '3.3.1', key: 'ingreso.diagnostico.principal', label: 'Diagnóstico principal', type: 'leaf' },
          { id: '3.3.2', key: 'ingreso.diagnostico.otros', label: 'Otros diagnósticos de ingreso', type: 'leaf' }
        ]
      }
    ]
  },
  // ── BLOQUE 4 ──
  {
    id: '4',
    key: 'soporte',
    label: 'Bloque 4. Soporte / intervenciones',
    type: 'mother',
    children: [
      {
        id: '4.1',
        key: 'soporte.reanimacion',
        label: 'Reanimación cardiopulmonar',
        type: 'leaf',
        synonyms: ['rcp', 'paro cardiaco', 'parada', 'reanimado'],
        children: [
          { id: '4.1.1', key: 'soporte.reanimacion.fecha_disponible', label: 'Fecha disponible', type: 'leaf' },
          { id: '4.1.2', key: 'soporte.reanimacion.ritmo_inicial', label: 'Ritmo inicial (Desfibrilable/No desfibrilable)', type: 'leaf' },
          { id: '4.1.3', key: 'soporte.reanimacion.causa_paro', label: 'Causa del paro', type: 'leaf' },
          { id: '4.1.4', key: 'soporte.reanimacion.duracion_ciclos', label: 'Duración o número de ciclos', type: 'leaf' },
          { id: '4.1.5', key: 'soporte.reanimacion.requirio_desfibrilacion', label: 'Requirió desfibrilación', type: 'leaf' },
          { id: '4.1.7', key: 'soporte.reanimacion.retorno_circulacion', label: 'Retorno a circulación espontánea (ROSC)', type: 'leaf' }
        ]
      },
      {
        id: '4.2',
        key: 'soporte.hemodinamico',
        label: 'Hemodinámico',
        type: 'leaf',
        children: [
          { id: '4.2.1', key: 'soporte.hemodinamico.drogas_vasoactivas', label: 'Drogas vasoactivas', type: 'leaf', synonyms: ['dva', 'noradrenalina', 'norepinefrina', 'adrenalina', 'vasopresor'] },
          { id: '4.2.2', key: 'soporte.hemodinamico.inotropicos', label: 'Inotrópicos', type: 'leaf', synonyms: ['dobutamina', 'milrinona'] },
          { id: '4.2.3', key: 'soporte.hemodinamico.corticoides_shock', label: 'Corticoides en dosis de estrés o por shock refractario', type: 'leaf', synonyms: ['hidrocortisona'] },
          { id: '4.2.4', key: 'soporte.hemodinamico.soporte_circulatorio_mecanico', label: 'Dispositivo de soporte circulatorio mecánico', type: 'leaf', synonyms: ['balon de contrapulsacion', 'bcpiac', 'impella'] },
          { id: '4.2.5', key: 'soporte.hemodinamico.otro', label: 'Otro soporte hemodinámico', type: 'leaf' }
        ]
      },
      {
        id: '4.3',
        key: 'soporte.respiratorio',
        label: 'Respiratorio',
        type: 'leaf',
        children: [
          {
            id: '4.3.1',
            key: 'soporte.respiratorio.vmni',
            label: 'Ventilación mecánica no invasiva o nivel de soporte menor',
            type: 'leaf',
            synonyms: ['vmni', 'bipap', 'cpap', 'cafy', 'naricera de alto flujo'],
            mutuallyExclusiveWith: [
              'soporte.respiratorio.vmi',
              'soporte.respiratorio.bloqueo_neuromuscular',
              'soporte.respiratorio.prono',
              'soporte.respiratorio.traqueostomia'
            ]
          },
          {
            id: '4.3.2',
            key: 'soporte.respiratorio.vmi',
            label: 'Ventilación mecánica invasiva',
            type: 'leaf',
            synonyms: ['vmi', 'tubo endotraqueal', 'tet', 'intubacion', 'intubado', 'acople', 'ventilado'],
            mutuallyExclusiveWith: ['soporte.respiratorio.vmni'],
            children: [
              { id: '4.3.2.1', key: 'soporte.respiratorio.vmi.fecha_inicio', label: 'Fecha de inicio', type: 'leaf' },
              { id: '4.3.2.2', key: 'soporte.respiratorio.vmi.fecha_termino', label: 'Fecha de término', type: 'leaf' },
              { id: '4.3.2.3', key: 'soporte.respiratorio.vmi.motivo', label: 'Motivo', type: 'leaf' },
              { id: '4.3.2.4', key: 'soporte.respiratorio.vmi.mas_de_un_ciclo', label: 'Requirió más de un ciclo de VMI', type: 'leaf' }
            ]
          },
          {
            id: '4.3.3',
            key: 'soporte.respiratorio.bloqueo_neuromuscular',
            label: 'Bloqueo neuromuscular',
            type: 'leaf',
            synonyms: ['bnm', 'cisatracurio', 'relajante', 'paralisis'],
            mutuallyExclusiveWith: ['soporte.respiratorio.vmni'],
            children: [
              { id: '4.3.3.1', key: 'soporte.respiratorio.bloqueo_neuromuscular.fecha_inicio', label: 'Fecha de inicio', type: 'leaf' },
              { id: '4.3.3.2', key: 'soporte.respiratorio.bloqueo_neuromuscular.fecha_termino', label: 'Fecha de término', type: 'leaf' },
              { id: '4.3.3.3', key: 'soporte.respiratorio.bloqueo_neuromuscular.mas_de_un_ciclo', label: 'Requirió más de un ciclo de bloqueo neuromuscular', type: 'leaf' }
            ]
          },
          {
            id: '4.3.4',
            key: 'soporte.respiratorio.prono',
            label: 'Posición prono',
            type: 'leaf',
            synonyms: ['pronacion', 'decubito prono', 'boca abajo'],
            mutuallyExclusiveWith: ['soporte.respiratorio.vmni'],
            children: [
              { id: '4.3.4.1', key: 'soporte.respiratorio.prono.fecha_inicio', label: 'Fecha de inicio', type: 'leaf' },
              { id: '4.3.4.2', key: 'soporte.respiratorio.prono.fecha_termino', label: 'Fecha de término', type: 'leaf' },
              { id: '4.3.4.3', key: 'soporte.respiratorio.prono.mas_de_un_ciclo', label: 'Requirió más de un ciclo de prono', type: 'leaf' }
            ]
          },
          {
            id: '4.3.5',
            key: 'soporte.respiratorio.traqueostomia',
            label: 'Traqueostomía',
            type: 'leaf',
            synonyms: ['tqt', 'traqueo'],
            mutuallyExclusiveWith: ['soporte.respiratorio.vmni'],
            children: [
              { id: '4.3.5.1', key: 'soporte.respiratorio.traqueostomia.fecha_realizacion', label: 'Fecha de realización', type: 'leaf' },
              { id: '4.3.5.2', key: 'soporte.respiratorio.traqueostomia.motivo', label: 'Motivo', type: 'leaf' }
            ]
          }
        ]
      },
      { id: '4.4', key: 'soporte.circulacion_extracorporea', label: 'Circulación extracorpórea', type: 'leaf', synonyms: ['ecmo', 'extracorporeo', 'va-ecmo', 'vv-ecmo'] },
      { id: '4.5', key: 'soporte.sedoanalgesia_continua', label: 'Sedoanalgesia continua', type: 'leaf', synonyms: ['sedacion', 'fentanilo', 'propofol', 'midazolam', 'analgesia'] },
      {
        id: '4.6',
        key: 'soporte.renal',
        label: 'Renal',
        type: 'leaf',
        children: [
          { id: '4.6.1', key: 'soporte.renal.hemodialisis_aguda', label: 'Hemodiálisis aguda', type: 'leaf', synonyms: ['hdi', 'hemodialisis intermitente'] },
          { id: '4.6.2', key: 'soporte.renal.trr_continua', label: 'Terapia de reemplazo renal continua', type: 'leaf', synonyms: ['trrc', 'crrt', 'hemofiltracion continua', 'cvvhdf'] },
          { id: '4.6.3', key: 'soporte.renal.ultrafiltracion_aislada', label: 'Ultrafiltración aislada', type: 'leaf', synonyms: ['scuf'] },
          { id: '4.6.4', key: 'soporte.renal.dialisis_peritoneal_aguda', label: 'Diálisis peritoneal aguda', type: 'leaf', synonyms: ['dp'] },
          { id: '4.6.5', key: 'soporte.renal.otro', label: 'Otro soporte renal', type: 'leaf' }
        ]
      },
      {
        id: '4.7',
        key: 'soporte.hfav',
        label: 'Hemofiltración de alto volumen',
        type: 'leaf',
        synonyms: ['hfav'],
        children: [
          { id: '4.7.1', key: 'soporte.hfav.motivo', label: 'Motivo', type: 'leaf' }
        ]
      },
      {
        id: '4.8',
        key: 'soporte.transfusion',
        label: 'Transfusión de hemoderivados',
        type: 'leaf',
        synonyms: ['transfundido', 'globulos rojos', 'plaquetas', 'plasma', 'ufh'],
        children: [
          { id: '4.8.1', key: 'soporte.transfusion.tipo', label: 'Tipo de hemoderivado', type: 'leaf' },
          { id: '4.8.2', key: 'soporte.transfusion.masiva', label: 'Protocolo de transfusión masiva', type: 'leaf', synonyms: ['ptm'] }
        ]
      },
      {
        id: '4.9',
        key: 'soporte.otros_avanzados',
        label: 'Otros soportes avanzados',
        type: 'leaf',
        children: [
          { id: '4.9.1', key: 'soporte.otros_avanzados.recambio_plasmatico', label: 'Recambio plasmático terapéutico', type: 'leaf', synonyms: ['plasmaferesis', 'rpt'] },
          { id: '4.9.2', key: 'soporte.otros_avanzados.hemoadsorcion', label: 'Hemoadsorción', type: 'leaf', synonyms: ['cytosorb', 'filtro'] },
          { id: '4.9.3', key: 'soporte.otros_avanzados.hipotermia_terapeutica', label: 'Hipotermia terapéutica', type: 'leaf', synonyms: ['enfriamiento', 'control de temperatura'] },
          { id: '4.9.4', key: 'soporte.otros_avanzados.soporte_hepatico', label: 'Soporte hepático extracorpóreo', type: 'leaf', synonyms: ['mars', 'prometheus'] },
          { id: '4.9.5', key: 'soporte.otros_avanzados.insulina_infusion', label: 'Insulina en infusión continua', type: 'leaf', synonyms: ['bic insulina', 'infusion de insulina'] },
          { id: '4.9.6', key: 'soporte.otros_avanzados.otro', label: 'Otro soporte avanzado', type: 'leaf' }
        ]
      },
      {
        id: '4.10',
        key: 'soporte.intervenciones',
        label: 'Intervenciones terapéuticas',
        type: 'leaf',
        children: [
          { id: '4.10.1', key: 'soporte.intervenciones.quirurgico', label: 'Quirúrgico', type: 'leaf', synonyms: ['cirugia', 'pabellon', 'operado'] },
          { id: '4.10.2', key: 'soporte.intervenciones.endoscopico', label: 'Endoscópico', type: 'leaf', synonyms: ['endoscopia', 'eda', 'colonoscopia'] },
          { id: '4.10.3', key: 'soporte.intervenciones.cardiologico', label: 'Cardiológico', type: 'leaf', synonyms: ['coronariografia', 'angioplastia', 'cateterismo'] },
          { id: '4.10.4', key: 'soporte.intervenciones.reperfusion', label: 'Reperfusión', type: 'leaf', synonyms: ['trombolisis', 'actp'] },
          { id: '4.10.5', key: 'soporte.intervenciones.otro', label: 'Otro tipo de intervención', type: 'leaf' }
        ]
      }
    ]
  },
  // ── BLOQUE 5 ──
  {
    id: '5',
    key: 'falla',
    label: 'Bloque 5. Falla orgánica',
    type: 'mother',
    children: [
      { id: '5.1', key: 'falla.puntaje_gravedad', label: 'Puntaje de gravedad o disfunción orgánica (SOFA, APACHE…)', type: 'leaf', synonyms: ['sofa', 'apache', 'saps'] },
      { id: '5.2', key: 'falla.respiratoria', label: 'Falla respiratoria', type: 'leaf', synonyms: ['insuficiencia respiratoria', 'sdra', 'paafi'] },
      { id: '5.3', key: 'falla.hemodinamica', label: 'Falla hemodinámica', type: 'leaf', synonyms: ['shock septico', 'shock cardiogenico', 'hipotension shock'] },
      { id: '5.4', key: 'falla.renal_aguda', label: 'Falla renal aguda', type: 'leaf', synonyms: ['aki', 'ira', 'creatinina alza', 'oligurico'] },
      { id: '5.5', key: 'falla.neurologica', label: 'Falla neurológica', type: 'leaf', synonyms: ['encefalopatia', 'delirio hipoactivo', 'compromiso de conciencia', 'coma'] },
      { id: '5.6', key: 'falla.hepatica', label: 'Falla hepática', type: 'leaf', synonyms: ['insuficiencia hepatica', 'bilirrubina alta', 'coagulopatia'] },
      { id: '5.7', key: 'falla.hematologica', label: 'Falla hematológica', type: 'leaf', synonyms: ['trombocitopenia', 'plaquetopenia', 'cid'] },
      { id: '5.8', key: 'falla.otra', label: 'Otra falla', type: 'leaf' },
      { id: '5.9', key: 'falla.multiorganica', label: 'Falla multiorgánica', type: 'leaf', synonyms: ['fmo', 'disfuncion multiorganica', 'fallas multiples'] }
    ]
  },
  // ── BLOQUE 6 ──
  {
    id: '6',
    key: 'infecciones',
    label: 'Bloque 6. Infecciones',
    type: 'mother',
    children: [
      {
        id: '6.1',
        key: 'infecciones.estadia_upc',
        label: 'Infección/es durante la estadía en UPC',
        type: 'leaf',
        children: [
          { id: '6.1.1', key: 'infecciones.sepsis', label: 'Sepsis o shock séptico', type: 'leaf', synonyms: ['septicemia', 'foco septico'] },
          {
            id: '6.1.2',
            key: 'infecciones.focos',
            label: 'Focos infecciosos',
            type: 'mother',
            children: [
              {
                id: '6.1.2.1',
                key: 'infecciones.focos.urinario',
                label: 'Urinario',
                type: 'leaf',
                synonyms: ['itu', 'cistitis', 'pielonefritis', 'orina', 'cup'],
                children: [
                  { id: '6.1.2.1.1', key: 'infecciones.focos.urinario.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf', synonyms: ['itu-cup', 'asociado a sonda'] },
                  { id: '6.1.2.1.2', key: 'infecciones.focos.urinario.agente', label: 'Agente microbiológico', type: 'leaf', synonyms: ['uropatogeno', 'cultivo orina'] },
                  { id: '6.1.2.1.3', key: 'infecciones.focos.urinario.tratamiento', label: 'Tratamiento para este foco', type: 'leaf', synonyms: ['antibiotico', 'urocultivo tto'] }
                ]
              },
              {
                id: '6.1.2.2',
                key: 'infecciones.focos.respiratorio',
                label: 'Respiratorio',
                type: 'leaf',
                synonyms: ['neumonia', 'nav', 'aspirativa', 'esputo', 'traqueal'],
                children: [
                  { id: '6.1.2.2.1', key: 'infecciones.focos.respiratorio.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf', synonyms: ['navm', 'asociada a ventilacion'] },
                  { id: '6.1.2.2.2', key: 'infecciones.focos.respiratorio.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.2.3', key: 'infecciones.focos.respiratorio.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.3',
                key: 'infecciones.focos.digestivo_biliar',
                label: 'Digestivo o biliar',
                type: 'leaf',
                synonyms: ['peritonitis', 'colecistitis', 'colangitis', 'clostridium'],
                children: [
                  { id: '6.1.2.3.1', key: 'infecciones.focos.digestivo_biliar.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.3.2', key: 'infecciones.focos.digestivo_biliar.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.4',
                key: 'infecciones.focos.cateter',
                label: 'Catéter o dispositivo intravascular',
                type: 'leaf',
                synonyms: ['itsac', 'cvc', 'infeccion cateter', 'retrocultivo'],
                children: [
                  { id: '6.1.2.4.1', key: 'infecciones.focos.cateter.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf' },
                  { id: '6.1.2.4.2', key: 'infecciones.focos.cateter.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.4.3', key: 'infecciones.focos.cateter.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.5',
                key: 'infecciones.focos.piel_blandas',
                label: 'Piel y partes blandas',
                type: 'leaf',
                synonyms: ['celulitis', 'erisipela', 'fascitis', 'escaras infectadas'],
                children: [
                  { id: '6.1.2.5.1', key: 'infecciones.focos.piel_blandas.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf' },
                  { id: '6.1.2.5.2', key: 'infecciones.focos.piel_blandas.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.5.3', key: 'infecciones.focos.piel_blandas.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.6',
                key: 'infecciones.focos.herida_sitio_quirurgico',
                label: 'Herida operatoria o sitio quirúrgico',
                type: 'leaf',
                synonyms: ['isq', 'dehiscencia', 'infeccion operatoria'],
                children: [
                  { id: '6.1.2.6.1', key: 'infecciones.focos.herida_sitio_quirurgico.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.6.2', key: 'infecciones.focos.herida_sitio_quirurgico.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.7',
                key: 'infecciones.focos.sistema_nervioso',
                label: 'Sistema nervioso central',
                type: 'leaf',
                synonyms: ['meningitis', 'encefalitis', 'ventriculitis', 'lcr'],
                children: [
                  { id: '6.1.2.7.1', key: 'infecciones.focos.sistema_nervioso.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.7.2', key: 'infecciones.focos.sistema_nervioso.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.8',
                key: 'infecciones.focos.osteoarticular',
                label: 'Osteoarticular',
                type: 'leaf',
                synonyms: ['osteomielitis', 'artritis septica'],
                children: [
                  { id: '6.1.2.8.1', key: 'infecciones.focos.osteoarticular.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.8.2', key: 'infecciones.focos.osteoarticular.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.9',
                key: 'infecciones.focos.cardiovascular_endocarditis',
                label: 'Cardiovascular o endocarditis',
                type: 'leaf',
                synonyms: ['endocarditis infecciosa', 'bacteriemia asociada a linea', 'vegetacion valvular'],
                children: [
                  { id: '6.1.2.9.1', key: 'infecciones.focos.cardiovascular_endocarditis.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf' },
                  { id: '6.1.2.9.2', key: 'infecciones.focos.cardiovascular_endocarditis.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.9.3', key: 'infecciones.focos.cardiovascular_endocarditis.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.10',
                key: 'infecciones.focos.otro',
                label: 'Otro foco',
                type: 'leaf',
                children: [
                  { id: '6.1.2.10.1', key: 'infecciones.focos.otro.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf' },
                  { id: '6.1.2.10.2', key: 'infecciones.focos.otro.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.10.3', key: 'infecciones.focos.otro.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              },
              {
                id: '6.1.2.11',
                key: 'infecciones.focos.no_identificado',
                label: 'No identificado',
                type: 'leaf',
                synonyms: ['origen desconocido', 'sepsis sin foco'],
                children: [
                  { id: '6.1.2.11.1', key: 'infecciones.focos.no_identificado.iaas', label: 'Asociado a dispositivo o a la atención en salud (IAAS)', type: 'leaf' },
                  { id: '6.1.2.11.2', key: 'infecciones.focos.no_identificado.agente', label: 'Agente microbiológico', type: 'leaf' },
                  { id: '6.1.2.11.3', key: 'infecciones.focos.no_identificado.tratamiento', label: 'Tratamiento para este foco', type: 'leaf' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  // ── BLOQUE 7 ──
  {
    id: '7',
    key: 'complicaciones',
    label: 'Bloque 7. Complicaciones',
    type: 'mother',
    children: [
      { id: '7.1', key: 'complicaciones.delirium', label: 'Delirium', type: 'leaf', synonyms: ['delirio', 'agitacion', 'cam-icu'] },
      { id: '7.2', key: 'complicaciones.debilidad_adquirida', label: 'Debilidad adquirida', type: 'leaf', synonyms: ['dapc', 'neuropatia critico', 'miopatia critico', 'paresia'] },
      { id: '7.3', key: 'complicaciones.lesiones_presion', label: 'Lesiones por presión', type: 'leaf', synonyms: ['lpp', 'escaras', 'ulceras por presion', 'upp'] },
      { id: '7.4', key: 'complicaciones.desnutricion', label: 'Desnutricion o soporte nutricional intensivo', type: 'leaf', synonyms: ['desnutrido', 'sng', 'nutricion enteral', 'nutricion parenteral', 'bic enteral'] },
      { id: '7.5', key: 'complicaciones.disfagia', label: 'Disfagia o trastorno deglutorio', type: 'leaf', synonyms: ['problema deglucion', 'aspiracion', 'evaluacion fonoaudiologica'] },
      { id: '7.6', key: 'complicaciones.paciente_critico_cronico', label: 'Paciente crítico crónico', type: 'leaf', synonyms: ['pcc', 'estadia prolongada'] },
      { id: '7.7', key: 'complicaciones.otra', label: 'Otra complicación', type: 'leaf' }
    ]
  },
  // ── BLOQUE 8 ──
  {
    id: '8',
    key: 'egreso',
    label: 'Bloque 8. Egreso',
    type: 'mother',
    children: [
      { id: '8.1', key: 'egreso.fecha_egreso_upc', label: 'Fecha de egreso de UPC', type: 'leaf' },
      { id: '8.2', key: 'egreso.estado_vital', label: 'Estado vital al egreso de UPC', type: 'leaf', synonyms: ['vivo', 'fallecido', 'muerto', 'deceso', 'mortalidad'] },
      { id: '8.3', key: 'egreso.destino', label: 'Destino de egreso de UPC', type: 'leaf', synonyms: ['sala comun', 'alta a domicilio', 'derivado', 'traslado'] },
      { id: '8.4', key: 'egreso.diagnostico', label: 'Diagnóstico de egreso de UPC', type: 'leaf' },
      { id: '8.5', key: 'egreso.reingreso_upc', label: 'Reingreso a UPC durante la hospitalización', type: 'leaf', synonyms: ['reingresado'] }
    ]
  },
  // ── BLOQUE 9 ──
  {
    id: '9',
    key: 'calidad',
    label: 'Bloque 9. Calidad global de la epicrisis',
    type: 'mother',
    children: [
      { id: '9.1', key: 'calidad.global', label: 'Calidad global de la epicrisis', type: 'select', choices: ['confiable', 'parcial', 'deficiente'] },
      { id: '9.2', key: 'calidad.comentario', label: 'Comentario final (opcional)', type: 'text' }
    ]
  }
]

// Helper to recursively retrieve all leaf variables (nodes with no children of type leaf/mother, or node types that act as variables)
export function getLeafNodes(nodes: FormNode[] = FORM_SCHEMA): FormNode[] {
  const leaves: FormNode[] = []
  
  function traverse(node: FormNode) {
    if (node.type === 'leaf' || node.type === 'date' || node.type === 'select' || node.type === 'number' || node.type === 'text') {
      leaves.push(node)
    }
    if (node.children) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  for (const node of nodes) {
    traverse(node)
  }
  return leaves
}

// Map leaf nodes into COMORBIDITIES format to preserve compatibility
export const V3_LEAF_VARIABLES = getLeafNodes()
export const COMORBIDITIES = V3_LEAF_VARIABLES.map(node => ({
  name: node.key,
  label: node.label,
  icd10Hint: node.icd10Hint
}))
