// Archivo generado automáticamente. No editar manualmente.
// Fuente: epicrisis_documentacion/guias/glosario-anotacion.md

export interface GlosarioEntry {
  key: string;
  term: string;
  definitionMarkdown: string;
  definitionHtml: string;
}

export interface GlosarioSection {
  id: string;
  key: string;
  label: string;
  type: 'mother' | 'leaf' | 'date' | 'select' | 'number' | 'text';
  children?: GlosarioSection[];
  definitionMarkdown?: string;
  definitionHtml?: string;
}

export const GLOSARIO_DEFINICIONES: Record<string, GlosarioEntry> = {
  "hospitalizacion.fecha_ingreso": {
    "key": "hospitalizacion.fecha_ingreso",
    "term": "Fecha de ingreso al hospital",
    "definitionMarkdown": "Fecha de admisión al hospital (DD/MM/AAAA). Puede ser distinta de la fecha de ingreso a la UPC.",
    "definitionHtml": "<p>Fecha de admisión al hospital (DD/MM/AAAA). Puede ser distinta de la fecha de ingreso a la UPC.</p>"
  },
  "hospitalizacion.fecha_egreso": {
    "key": "hospitalizacion.fecha_egreso",
    "term": "Fecha de egreso del hospital",
    "definitionMarkdown": "Fecha de alta hospitalaria (DD/MM/AAAA). Puede ser posterior a la fecha de egreso de la UPC.\n\n---",
    "definitionHtml": "<p>Fecha de alta hospitalaria (DD/MM/AAAA). Puede ser posterior a la fecha de egreso de la UPC.</p>\n<hr>"
  },
  "antecedentes.cardiovascular.hipertension_arterial": {
    "key": "antecedentes.cardiovascular.hipertension_arterial",
    "term": "Hipertensión arterial",
    "definitionMarkdown": "Presión arterial crónicamente elevada (generalmente ≥ 140/90 mmHg o en tratamiento con antihipertensivos).",
    "definitionHtml": "<p>Presión arterial crónicamente elevada (generalmente ≥ 140/90 mmHg o en tratamiento con antihipertensivos).</p>"
  },
  "antecedentes.cardiovascular.enfermedad_coronaria": {
    "key": "antecedentes.cardiovascular.enfermedad_coronaria",
    "term": "Enfermedad coronaria",
    "definitionMarkdown": "Antecedente de cardiopatía isquémica: infarto, angina, revascularización (angioplastía/stent o bypass) o enfermedad coronaria conocida.",
    "definitionHtml": "<p>Antecedente de cardiopatía isquémica: infarto, angina, revascularización (angioplastía/stent o bypass) o enfermedad coronaria conocida.</p>"
  },
  "antecedentes.cardiovascular.accidente_cerebrovascular_previo": {
    "key": "antecedentes.cardiovascular.accidente_cerebrovascular_previo",
    "term": "Accidente cerebrovascular previo",
    "definitionMarkdown": "Antecedente de evento cerebrovascular isquémico o hemorrágico (ictus, derrame, ACV) antes del ingreso actual.\n* **Nota de desambiguación:** El evento cerebrovascular previo va en *Cardiovascular*, no en *Neurológico*.",
    "definitionHtml": "<p>Antecedente de evento cerebrovascular isquémico o hemorrágico (ictus, derrame, ACV) antes del ingreso actual.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El evento cerebrovascular previo va en <em>Cardiovascular</em>, no en <em>Neurológico</em>.</li>\n</ul>"
  },
  "antecedentes.cardiovascular.enfermedad_vascular_periferica": {
    "key": "antecedentes.cardiovascular.enfermedad_vascular_periferica",
    "term": "Enfermedad vascular periférica",
    "definitionMarkdown": "Enfermedad arterial periférica (claudicación, isquemia arterial, revascularización de extremidades).",
    "definitionHtml": "<p>Enfermedad arterial periférica (claudicación, isquemia arterial, revascularización de extremidades).</p>"
  },
  "antecedentes.cardiovascular.arritmia_cronica": {
    "key": "antecedentes.cardiovascular.arritmia_cronica",
    "term": "Arritmia crónica",
    "definitionMarkdown": "Arritmia previa conocida (fibrilación/flutter auricular, portador de marcapasos por arritmia, etc.).",
    "definitionHtml": "<p>Arritmia previa conocida (fibrilación/flutter auricular, portador de marcapasos por arritmia, etc.).</p>"
  },
  "antecedentes.cardiovascular.insuficiencia_cardiaca": {
    "key": "antecedentes.cardiovascular.insuficiencia_cardiaca",
    "term": "Insuficiencia cardíaca",
    "definitionMarkdown": "Antecedente de insuficiencia cardíaca (ICC, disfunción ventricular, FEVI reducida).",
    "definitionHtml": "<p>Antecedente de insuficiencia cardíaca (ICC, disfunción ventricular, FEVI reducida).</p>"
  },
  "antecedentes.cardiovascular.valvulopatia_significativa": {
    "key": "antecedentes.cardiovascular.valvulopatia_significativa",
    "term": "Valvulopatía significativa",
    "definitionMarkdown": "Enfermedad valvular relevante (estenosis o insuficiencia significativa, prótesis valvular).",
    "definitionHtml": "<p>Enfermedad valvular relevante (estenosis o insuficiencia significativa, prótesis valvular).</p>"
  },
  "antecedentes.cardiovascular.hipertension_pulmonar": {
    "key": "antecedentes.cardiovascular.hipertension_pulmonar",
    "term": "Hipertensión pulmonar",
    "definitionMarkdown": "Hipertensión pulmonar (HTP) documentada.",
    "definitionHtml": "<p>Hipertensión pulmonar (HTP) documentada.</p>"
  },
  "antecedentes.cardiovascular.dispositivo_cardiaco": {
    "key": "antecedentes.cardiovascular.dispositivo_cardiaco",
    "term": "Dispositivo cardíaco (marcapasos, desfibrilador)",
    "definitionMarkdown": "Portador de dispositivo cardíaco implantable: marcapasos, desfibrilador automático implantable (DAI) o resincronizador.",
    "definitionHtml": "<p>Portador de dispositivo cardíaco implantable: marcapasos, desfibrilador automático implantable (DAI) o resincronizador.</p>"
  },
  "antecedentes.cardiovascular.otra_cardiovascular": {
    "key": "antecedentes.cardiovascular.otra_cardiovascular",
    "term": "Otra cardiovascular",
    "definitionMarkdown": "Otro antecedente cardiovascular relevante no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro antecedente cardiovascular relevante no cubierto por los campos anteriores.</p>"
  },
  "antecedentes.metabolico_endocrino.diabetes_mellitus": {
    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus",
    "term": "Diabetes mellitus",
    "definitionMarkdown": "Diabetes mellitus conocida. Se especifica el subtipo (Tipo 1, Tipo 2 o No especificada) y si está Complicada o No complicada.",
    "definitionHtml": "<p>Diabetes mellitus conocida. Se especifica el subtipo (Tipo 1, Tipo 2 o No especificada) y si está Complicada o No complicada.</p>"
  },
  "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1": {
    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1",
    "term": "Tipo 1",
    "definitionMarkdown": "Diabetes mellitus tipo 1.",
    "definitionHtml": "<p>Diabetes mellitus tipo 1.</p>"
  },
  "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2": {
    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2",
    "term": "Tipo 2",
    "definitionMarkdown": "Diabetes mellitus tipo 2.",
    "definitionHtml": "<p>Diabetes mellitus tipo 2.</p>"
  },
  "antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada": {
    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada",
    "term": "No especificada",
    "definitionMarkdown": "Diabetes mellitus sin subtipo especificado en el texto.",
    "definitionHtml": "<p>Diabetes mellitus sin subtipo especificado en el texto.</p>"
  },
  "antecedentes.metabolico_endocrino.diabetes_mellitus.complicada": {
    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.complicada",
    "term": "Complicada",
    "definitionMarkdown": "La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.",
    "definitionHtml": "<p>La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.</p>"
  },
  "antecedentes.hepatico_digestivo.cirrosis.complicada": {
    "key": "antecedentes.hepatico_digestivo.cirrosis.complicada",
    "term": "Complicada",
    "definitionMarkdown": "La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.",
    "definitionHtml": "<p>La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.</p>"
  },
  "antecedentes.metabolico_endocrino.obesidad": {
    "key": "antecedentes.metabolico_endocrino.obesidad",
    "term": "Obesidad",
    "definitionMarkdown": "Obesidad documentada (diagnóstico, IMC elevado o mención explícita).",
    "definitionHtml": "<p>Obesidad documentada (diagnóstico, IMC elevado o mención explícita).</p>"
  },
  "antecedentes.metabolico_endocrino.dislipidemia": {
    "key": "antecedentes.metabolico_endocrino.dislipidemia",
    "term": "Dislipidemia",
    "definitionMarkdown": "Alteración de lípidos (hipercolesterolemia, hipertrigliceridemia) o en tratamiento hipolipemiante.",
    "definitionHtml": "<p>Alteración de lípidos (hipercolesterolemia, hipertrigliceridemia) o en tratamiento hipolipemiante.</p>"
  },
  "antecedentes.metabolico_endocrino.hipotiroidismo": {
    "key": "antecedentes.metabolico_endocrino.hipotiroidismo",
    "term": "Hipotiroidismo",
    "definitionMarkdown": "Hipotiroidismo conocido o en tratamiento con levotiroxina.",
    "definitionHtml": "<p>Hipotiroidismo conocido o en tratamiento con levotiroxina.</p>"
  },
  "antecedentes.metabolico_endocrino.otra_metabolica_endocrina": {
    "key": "antecedentes.metabolico_endocrino.otra_metabolica_endocrina",
    "term": "Otra metabólica o endocrina",
    "definitionMarkdown": "Otro antecedente metabólico o endocrino relevante no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro antecedente metabólico o endocrino relevante no cubierto por los campos anteriores.</p>"
  },
  "antecedentes.renal.enfermedad_renal_cronica": {
    "key": "antecedentes.renal.enfermedad_renal_cronica",
    "term": "Enfermedad renal crónica",
    "definitionMarkdown": "Enfermedad renal crónica (ERC) conocida, con deterioro estable de la función renal.\n* **Nota de desambiguación:** No confundir con la falla renal *aguda* de la estadía, que va en *Falla orgánica*.",
    "definitionHtml": "<p>Enfermedad renal crónica (ERC) conocida, con deterioro estable de la función renal.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No confundir con la falla renal <em>aguda</em> de la estadía, que va en <em>Falla orgánica</em>.</li>\n</ul>"
  },
  "antecedentes.renal.terapia_dialitica_cronica": {
    "key": "antecedentes.renal.terapia_dialitica_cronica",
    "term": "Terapia dialítica crónica",
    "definitionMarkdown": "Paciente en diálisis crónica (hemodiálisis o peritoneal) previa al ingreso.",
    "definitionHtml": "<p>Paciente en diálisis crónica (hemodiálisis o peritoneal) previa al ingreso.</p>"
  },
  "antecedentes.renal.trasplante_renal_previo": {
    "key": "antecedentes.renal.trasplante_renal_previo",
    "term": "Trasplante renal previo",
    "definitionMarkdown": "Antecedente de trasplante renal.",
    "definitionHtml": "<p>Antecedente de trasplante renal.</p>"
  },
  "antecedentes.renal.otra_renal": {
    "key": "antecedentes.renal.otra_renal",
    "term": "Otra renal",
    "definitionMarkdown": "Otro antecedente renal relevante no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro antecedente renal relevante no cubierto por los campos anteriores.</p>"
  },
  "antecedentes.pulmonar.epoc": {
    "key": "antecedentes.pulmonar.epoc",
    "term": "Enfermedad pulmonar obstructiva crónica (EPOC)",
    "definitionMarkdown": "EPOC conocida.",
    "definitionHtml": "<p>EPOC conocida.</p>"
  },
  "antecedentes.pulmonar.asma": {
    "key": "antecedentes.pulmonar.asma",
    "term": "Asma",
    "definitionMarkdown": "Asma bronquial conocida.",
    "definitionHtml": "<p>Asma bronquial conocida.</p>"
  },
  "antecedentes.pulmonar.enfermedad_pulmonar_intersticial_difusa": {
    "key": "antecedentes.pulmonar.enfermedad_pulmonar_intersticial_difusa",
    "term": "Enfermedad pulmonar intersticial difusa",
    "definitionMarkdown": "Enfermedad pulmonar intersticial difusa (fibrosis pulmonar, EPID).",
    "definitionHtml": "<p>Enfermedad pulmonar intersticial difusa (fibrosis pulmonar, EPID).</p>"
  },
  "antecedentes.pulmonar.sindrome_apnea_hipopnea_obstructiva": {
    "key": "antecedentes.pulmonar.sindrome_apnea_hipopnea_obstructiva",
    "term": "Síndrome de apnea-hipopnea obstructiva del sueño",
    "definitionMarkdown": "SAHOS conocido, con o sin uso de CPAP.",
    "definitionHtml": "<p>SAHOS conocido, con o sin uso de CPAP.</p>"
  },
  "antecedentes.pulmonar.oxigeno_domiciliario": {
    "key": "antecedentes.pulmonar.oxigeno_domiciliario",
    "term": "Oxígeno domiciliario",
    "definitionMarkdown": "Uso crónico de oxígeno domiciliario previo al ingreso.",
    "definitionHtml": "<p>Uso crónico de oxígeno domiciliario previo al ingreso.</p>"
  },
  "antecedentes.pulmonar.otra_respiratoria": {
    "key": "antecedentes.pulmonar.otra_respiratoria",
    "term": "Otra respiratoria",
    "definitionMarkdown": "Otro antecedente respiratorio relevante (incluye bronquiectasias).",
    "definitionHtml": "<p>Otro antecedente respiratorio relevante (incluye bronquiectasias).</p>"
  },
  "antecedentes.hepatico_digestivo.cirrosis": {
    "key": "antecedentes.hepatico_digestivo.cirrosis",
    "term": "Daño hepático crónico o cirrosis",
    "definitionMarkdown": "Daño hepático crónico diagnosticado o sospecha clínica altamente probable (cirrosis, daño hepático por alcohol, etc.). Se especifica si está Complicada o No complicada.",
    "definitionHtml": "<p>Daño hepático crónico diagnosticado o sospecha clínica altamente probable (cirrosis, daño hepático por alcohol, etc.). Se especifica si está Complicada o No complicada.</p>"
  },
  "antecedentes.hepatico_digestivo.trasplante_hepatico": {
    "key": "antecedentes.hepatico_digestivo.trasplante_hepatico",
    "term": "Trasplante hepático",
    "definitionMarkdown": "Antecedente de trasplante hepático.",
    "definitionHtml": "<p>Antecedente de trasplante hepático.</p>"
  },
  "antecedentes.hepatico_digestivo.enfermedad_inflamatoria_intestinal": {
    "key": "antecedentes.hepatico_digestivo.enfermedad_inflamatoria_intestinal",
    "term": "Enfermedad inflamatoria intestinal",
    "definitionMarkdown": "Enfermedad inflamatoria intestinal (colitis ulcerosa, enfermedad de Crohn).",
    "definitionHtml": "<p>Enfermedad inflamatoria intestinal (colitis ulcerosa, enfermedad de Crohn).</p>"
  },
  "antecedentes.hepatico_digestivo.otra_hepatica_digestiva": {
    "key": "antecedentes.hepatico_digestivo.otra_hepatica_digestiva",
    "term": "Otra hepática o digestiva",
    "definitionMarkdown": "Otro antecedente hepático o digestivo relevante no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro antecedente hepático o digestivo relevante no cubierto por los campos anteriores.</p>"
  },
  "antecedentes.oncologico_hematologico.neoplasia_solida_activa": {
    "key": "antecedentes.oncologico_hematologico.neoplasia_solida_activa",
    "term": "Neoplasia sólida activa",
    "definitionMarkdown": "Cáncer de órgano sólido en actividad o en tratamiento oncológico activo.",
    "definitionHtml": "<p>Cáncer de órgano sólido en actividad o en tratamiento oncológico activo.</p>"
  },
  "antecedentes.oncologico_hematologico.neoplasia_hematologica_activa": {
    "key": "antecedentes.oncologico_hematologico.neoplasia_hematologica_activa",
    "term": "Neoplasia hematológica activa",
    "definitionMarkdown": "Neoplasia hematológica en actividad (leucemia, linfoma, mieloma) o en tratamiento activo.",
    "definitionHtml": "<p>Neoplasia hematológica en actividad (leucemia, linfoma, mieloma) o en tratamiento activo.</p>"
  },
  "antecedentes.oncologico_hematologico.trasplante_progenitores_previo": {
    "key": "antecedentes.oncologico_hematologico.trasplante_progenitores_previo",
    "term": "Trasplante de progenitores hematopoyéticos previo",
    "definitionMarkdown": "Antecedente de trasplante de médula ósea / progenitores hematopoyéticos.",
    "definitionHtml": "<p>Antecedente de trasplante de médula ósea / progenitores hematopoyéticos.</p>"
  },
  "antecedentes.oncologico_hematologico.enfermedad_tromboembolica": {
    "key": "antecedentes.oncologico_hematologico.enfermedad_tromboembolica",
    "term": "Enfermedad tromboembólica previa o actual",
    "definitionMarkdown": "Antecedente o presencia de enfermedad tromboembólica (TVP, TEP).",
    "definitionHtml": "<p>Antecedente o presencia de enfermedad tromboembólica (TVP, TEP).</p>"
  },
  "antecedentes.oncologico_hematologico.otra_oncologica_hematologica": {
    "key": "antecedentes.oncologico_hematologico.otra_oncologica_hematologica",
    "term": "Otra oncológica o hematológica",
    "definitionMarkdown": "Otro antecedente oncológico o hematológico relevante (incluye neoplasia previa sin actividad).",
    "definitionHtml": "<p>Otro antecedente oncológico o hematológico relevante (incluye neoplasia previa sin actividad).</p>"
  },
  "antecedentes.inmunologico_reumatologico.autoinmune_tratamiento": {
    "key": "antecedentes.inmunologico_reumatologico.autoinmune_tratamiento",
    "term": "Enfermedad autoinmune en tratamiento",
    "definitionMarkdown": "Enfermedad autoinmune o reumatológica en tratamiento activo (inmunosupresor o inmunomodulador).",
    "definitionHtml": "<p>Enfermedad autoinmune o reumatológica en tratamiento activo (inmunosupresor o inmunomodulador).</p>"
  },
  "antecedentes.inmunologico_reumatologico.trasplante_organo_solido_otro": {
    "key": "antecedentes.inmunologico_reumatologico.trasplante_organo_solido_otro",
    "term": "Trasplante de órgano sólido distinto del renal y hepático",
    "definitionMarkdown": "Antecedente de trasplante de órgano sólido distinto de riñón e hígado (corazón, pulmón, páncreas).",
    "definitionHtml": "<p>Antecedente de trasplante de órgano sólido distinto de riñón e hígado (corazón, pulmón, páncreas).</p>"
  },
  "antecedentes.inmunologico_reumatologico.inmunosupresion_cronica": {
    "key": "antecedentes.inmunologico_reumatologico.inmunosupresion_cronica",
    "term": "Inmunosupresión crónica no relacionada a infección ni a trasplante",
    "definitionMarkdown": "Estado de inmunosupresión crónica no asociado a infección ni a trasplante (corticoterapia prolongada, biológicos, etc.).",
    "definitionHtml": "<p>Estado de inmunosupresión crónica no asociado a infección ni a trasplante (corticoterapia prolongada, biológicos, etc.).</p>"
  },
  "antecedentes.inmunologico_reumatologico.otra_inmunologica_reumatologica": {
    "key": "antecedentes.inmunologico_reumatologico.otra_inmunologica_reumatologica",
    "term": "Otra inmunológica o reumatológica",
    "definitionMarkdown": "Otro antecedente inmunológico o reumatológico relevante no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro antecedente inmunológico o reumatológico relevante no cubierto por los campos anteriores.</p>"
  },
  "antecedentes.infeccioso.vih": {
    "key": "antecedentes.infeccioso.vih",
    "term": "VIH",
    "definitionMarkdown": "Infección por VIH conocida.",
    "definitionHtml": "<p>Infección por VIH conocida.</p>"
  },
  "antecedentes.infeccioso.tuberculosis": {
    "key": "antecedentes.infeccioso.tuberculosis",
    "term": "Tuberculosis",
    "definitionMarkdown": "Antecedente de tuberculosis. Se especifica si está Activa.",
    "definitionHtml": "<p>Antecedente de tuberculosis. Se especifica si está Activa.</p>"
  },
  "antecedentes.infeccioso.tuberculosis.activa": {
    "key": "antecedentes.infeccioso.tuberculosis.activa",
    "term": "Activa",
    "definitionMarkdown": "La condición infecciosa está en actividad durante la estadía (p. ej. tuberculosis activa), no solo como antecedente.",
    "definitionHtml": "<p>La condición infecciosa está en actividad durante la estadía (p. ej. tuberculosis activa), no solo como antecedente.</p>"
  },
  "antecedentes.infeccioso.hepatitis_viral_cronica": {
    "key": "antecedentes.infeccioso.hepatitis_viral_cronica",
    "term": "Hepatitis viral crónica, B o C",
    "definitionMarkdown": "Hepatitis viral crónica B o C conocida.",
    "definitionHtml": "<p>Hepatitis viral crónica B o C conocida.</p>"
  },
  "antecedentes.infeccioso.otra_infeccion_cronica": {
    "key": "antecedentes.infeccioso.otra_infeccion_cronica",
    "term": "Otra infección crónica relevante",
    "definitionMarkdown": "Otra infección crónica relevante no cubierta por los campos anteriores.",
    "definitionHtml": "<p>Otra infección crónica relevante no cubierta por los campos anteriores.</p>"
  },
  "antecedentes.neurologico.demencia": {
    "key": "antecedentes.neurologico.demencia",
    "term": "Demencia o deterioro cognitivo mayor",
    "definitionMarkdown": "Demencia o deterioro cognitivo mayor previo al ingreso.",
    "definitionHtml": "<p>Demencia o deterioro cognitivo mayor previo al ingreso.</p>"
  },
  "antecedentes.neurologico.epilepsia": {
    "key": "antecedentes.neurologico.epilepsia",
    "term": "Epilepsia",
    "definitionMarkdown": "Epilepsia o trastorno convulsivo crónico conocido.",
    "definitionHtml": "<p>Epilepsia o trastorno convulsivo crónico conocido.</p>"
  },
  "antecedentes.neurologico.parkinson": {
    "key": "antecedentes.neurologico.parkinson",
    "term": "Parkinson o parkinsonismo",
    "definitionMarkdown": "Enfermedad de Parkinson o síndrome parkinsoniano.",
    "definitionHtml": "<p>Enfermedad de Parkinson o síndrome parkinsoniano.</p>"
  },
  "antecedentes.neurologico.secuela_neurologica": {
    "key": "antecedentes.neurologico.secuela_neurologica",
    "term": "Secuela neurológica crónica",
    "definitionMarkdown": "Secuela neurológica establecida (hemiparesia, secuela de ACV, etc.).",
    "definitionHtml": "<p>Secuela neurológica establecida (hemiparesia, secuela de ACV, etc.).</p>"
  },
  "antecedentes.neurologico.otra_neurologica": {
    "key": "antecedentes.neurologico.otra_neurologica",
    "term": "Otra neurológica",
    "definitionMarkdown": "Otro antecedente neurológico relevante no cubierto por los campos anteriores.\n* **Nota de desambiguación:** El evento cerebrovascular previo va en *Cardiovascular*, no aquí.",
    "definitionHtml": "<p>Otro antecedente neurológico relevante no cubierto por los campos anteriores.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El evento cerebrovascular previo va en <em>Cardiovascular</em>, no aquí.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.depresion": {
    "key": "antecedentes.psiquiatrico.depresion",
    "term": "Trastorno depresivo",
    "definitionMarkdown": "Diagnóstico previo de depresión o distimia, o tratamiento antidepresivo en curso.\n* **Nota de desambiguación:** Un ánimo bajo mencionado al pasar, sin diagnóstico ni tratamiento, se marca `[?]`, no `[Sí]`.",
    "definitionHtml": "<p>Diagnóstico previo de depresión o distimia, o tratamiento antidepresivo en curso.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Un ánimo bajo mencionado al pasar, sin diagnóstico ni tratamiento, se marca <code>[?]</code>, no <code>[Sí]</code>.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.ansiedad": {
    "key": "antecedentes.psiquiatrico.ansiedad",
    "term": "Trastorno de ansiedad",
    "definitionMarkdown": "Trastorno ansioso diagnosticado (ansiedad generalizada, crisis de pánico, fobias) o en tratamiento ansiolítico.",
    "definitionHtml": "<p>Trastorno ansioso diagnosticado (ansiedad generalizada, crisis de pánico, fobias) o en tratamiento ansiolítico.</p>"
  },
  "antecedentes.psiquiatrico.trastorno_bipolar": {
    "key": "antecedentes.psiquiatrico.trastorno_bipolar",
    "term": "Trastorno bipolar",
    "definitionMarkdown": "Trastorno afectivo bipolar diagnosticado, o tratamiento con estabilizadores del ánimo (litio, ácido valproico) por esa indicación.",
    "definitionHtml": "<p>Trastorno afectivo bipolar diagnosticado, o tratamiento con estabilizadores del ánimo (litio, ácido valproico) por esa indicación.</p>"
  },
  "antecedentes.psiquiatrico.esquizofrenia_otro_psicotico": {
    "key": "antecedentes.psiquiatrico.esquizofrenia_otro_psicotico",
    "term": "Esquizofrenia u otro trastorno psicótico",
    "definitionMarkdown": "Esquizofrenia, trastorno esquizoafectivo, trastorno delirante u otra psicosis crónica diagnosticada, o tratamiento antipsicótico por esa indicación.\n* **Nota de desambiguación:** Un episodio psicótico atribuido a sustancias va también en *Trastorno por consumo de sustancias*.",
    "definitionHtml": "<p>Esquizofrenia, trastorno esquizoafectivo, trastorno delirante u otra psicosis crónica diagnosticada, o tratamiento antipsicótico por esa indicación.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Un episodio psicótico atribuido a sustancias va también en <em>Trastorno por consumo de sustancias</em>.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.trastorno_consumo_sustancias": {
    "key": "antecedentes.psiquiatrico.trastorno_consumo_sustancias",
    "term": "Trastorno por consumo de sustancias",
    "definitionMarkdown": "Dependencia o abuso de sustancias documentado: alcohol, drogas ilícitas o fármacos. Incluye antecedente de síndrome de abstinencia y tratamiento de deshabituación.\n* **Nota de desambiguación:** El consumo como hábito va en *Hábitos* (Tabaquismo, Alcohol, Otras sustancias). Aquí se marca solo cuando hay trastorno documentado: dependencia, abstinencia previa, tratamiento de deshabituación o diagnóstico explícito. Un mismo paciente puede tener ambas marcadas.",
    "definitionHtml": "<p>Dependencia o abuso de sustancias documentado: alcohol, drogas ilícitas o fármacos. Incluye antecedente de síndrome de abstinencia y tratamiento de deshabituación.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El consumo como hábito va en <em>Hábitos</em> (Tabaquismo, Alcohol, Otras sustancias). Aquí se marca solo cuando hay trastorno documentado: dependencia, abstinencia previa, tratamiento de deshabituación o diagnóstico explícito. Un mismo paciente puede tener ambas marcadas.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.intento_suicidio_previo": {
    "key": "antecedentes.psiquiatrico.intento_suicidio_previo",
    "term": "Intento de suicidio o autolesión previa",
    "definitionMarkdown": "Antecedente de intento de suicidio, autoagresión o intoxicación voluntaria.\n* **Nota de desambiguación:** Se marca también cuando el intento es la causa del ingreso actual; la evidencia capturada debe dejar claro si es previo o corresponde a esta hospitalización.",
    "definitionHtml": "<p>Antecedente de intento de suicidio, autoagresión o intoxicación voluntaria.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Se marca también cuando el intento es la causa del ingreso actual; la evidencia capturada debe dejar claro si es previo o corresponde a esta hospitalización.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.trastorno_personalidad": {
    "key": "antecedentes.psiquiatrico.trastorno_personalidad",
    "term": "Trastorno de personalidad",
    "definitionMarkdown": "Trastorno de personalidad diagnosticado (limítrofe, antisocial u otro).",
    "definitionHtml": "<p>Trastorno de personalidad diagnosticado (limítrofe, antisocial u otro).</p>"
  },
  "antecedentes.psiquiatrico.uso_cronico_psicofarmacos": {
    "key": "antecedentes.psiquiatrico.uso_cronico_psicofarmacos",
    "term": "Uso crónico de psicofármacos",
    "definitionMarkdown": "Uso habitual y mantenido de psicofármacos antes del ingreso: benzodiazepinas, antipsicóticos, antidepresivos, estabilizadores del ánimo. Es relevante por el riesgo de abstinencia al suspenderlos en la unidad.\n* **Nota de desambiguación:** Es una exposición, no un diagnóstico. Se marca aunque no haya un trastorno psiquiátrico consignado.",
    "definitionHtml": "<p>Uso habitual y mantenido de psicofármacos antes del ingreso: benzodiazepinas, antipsicóticos, antidepresivos, estabilizadores del ánimo. Es relevante por el riesgo de abstinencia al suspenderlos en la unidad.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Es una exposición, no un diagnóstico. Se marca aunque no haya un trastorno psiquiátrico consignado.</li>\n</ul>"
  },
  "antecedentes.psiquiatrico.otra_psiquiatrica": {
    "key": "antecedentes.psiquiatrico.otra_psiquiatrica",
    "term": "Otra psiquiátrica",
    "definitionMarkdown": "Otro antecedente psiquiátrico relevante no cubierto por los campos anteriores (trastorno de conducta alimentaria, discapacidad intelectual, insomnio crónico, etc.).\n* **Nota de desambiguación:** La demencia y el deterioro cognitivo mayor van en *Neurológico*. El delirium del episodio actual no es antecedente y no se anota en este bloque.",
    "definitionHtml": "<p>Otro antecedente psiquiátrico relevante no cubierto por los campos anteriores (trastorno de conducta alimentaria, discapacidad intelectual, insomnio crónico, etc.).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La demencia y el deterioro cognitivo mayor van en <em>Neurológico</em>. El delirium del episodio actual no es antecedente y no se anota en este bloque.</li>\n</ul>"
  },
  "antecedentes.habitos.tabaquismo": {
    "key": "antecedentes.habitos.tabaquismo",
    "term": "Tabaquismo",
    "definitionMarkdown": "Consumo de tabaco documentado (activo o pasado). Se registra la carga tabáquica si está cuantificada.",
    "definitionHtml": "<p>Consumo de tabaco documentado (activo o pasado). Se registra la carga tabáquica si está cuantificada.</p>"
  },
  "antecedentes.habitos.tabaquismo.carga": {
    "key": "antecedentes.habitos.tabaquismo.carga",
    "term": "Carga tabáquica (Cigarrillos al día / Años de consumo)",
    "definitionMarkdown": "Cuantificación del consumo de tabaco (p. ej. cigarrillos/día, años de consumo o paquetes-año), cuando el texto la documenta.",
    "definitionHtml": "<p>Cuantificación del consumo de tabaco (p. ej. cigarrillos/día, años de consumo o paquetes-año), cuando el texto la documenta.</p>"
  },
  "antecedentes.habitos.alcohol": {
    "key": "antecedentes.habitos.alcohol",
    "term": "Alcohol",
    "definitionMarkdown": "Consumo de alcohol documentado. Se registra la carga alcohólica si está cuantificada.",
    "definitionHtml": "<p>Consumo de alcohol documentado. Se registra la carga alcohólica si está cuantificada.</p>"
  },
  "antecedentes.habitos.alcohol.carga": {
    "key": "antecedentes.habitos.alcohol.carga",
    "term": "Carga alcohólica",
    "definitionMarkdown": "Cuantificación del consumo de alcohol, cuando el texto la documenta.",
    "definitionHtml": "<p>Cuantificación del consumo de alcohol, cuando el texto la documenta.</p>"
  },
  "antecedentes.habitos.otras_sustancias": {
    "key": "antecedentes.habitos.otras_sustancias",
    "term": "Otras sustancias",
    "definitionMarkdown": "Consumo de otras sustancias (drogas ilícitas u otras) documentado.",
    "definitionHtml": "<p>Consumo de otras sustancias (drogas ilícitas u otras) documentado.</p>"
  },
  "antecedentes.otro_antecedente_medico": {
    "key": "antecedentes.otro_antecedente_medico",
    "term": "Otro antecedente médico",
    "definitionMarkdown": "Cualquier antecedente relevante que no encaje en las categorías anteriores.",
    "definitionHtml": "<p>Cualquier antecedente relevante que no encaje en las categorías anteriores.</p>"
  },
  "antecedentes.quirurgicos": {
    "key": "antecedentes.quirurgicos",
    "term": "Antecedentes quirúrgicos",
    "definitionMarkdown": "Cirugías previas relevantes documentadas.\n\nEjemplos acordados con el equipo clínico: una cesárea cuenta como antecedente quirúrgico; un parto normal no cuenta como antecedente quirúrgico. Estos ejemplos no reemplazan la definición operativa completa, que el equipo aún debe precisar.",
    "definitionHtml": "<p>Cirugías previas relevantes documentadas.</p>\n<p>Ejemplos acordados con el equipo clínico: una cesárea cuenta como antecedente quirúrgico; un parto normal no cuenta como antecedente quirúrgico. Estos ejemplos no reemplazan la definición operativa completa, que el equipo aún debe precisar.</p>"
  },
  "antecedentes.alergias": {
    "key": "antecedentes.alergias",
    "term": "Alergias",
    "definitionMarkdown": "Alergias documentadas (medicamentos u otras).",
    "definitionHtml": "<p>Alergias documentadas (medicamentos u otras).</p>"
  },
  "antecedentes.dependencia_funcional": {
    "key": "antecedentes.dependencia_funcional",
    "term": "Dependencia funcional",
    "definitionMarkdown": "Dependencia funcional previa al ingreso (para actividades de la vida diaria).\n\n---",
    "definitionHtml": "<p>Dependencia funcional previa al ingreso (para actividades de la vida diaria).</p>\n<hr>"
  },
  "ingreso.fecha_ingreso_upc": {
    "key": "ingreso.fecha_ingreso_upc",
    "term": "Fecha de ingreso a UPC",
    "definitionMarkdown": "Fecha de ingreso a la Unidad de Paciente Crítico (DD/MM/AAAA).",
    "definitionHtml": "<p>Fecha de ingreso a la Unidad de Paciente Crítico (DD/MM/AAAA).</p>"
  },
  "ingreso.unidad_origen": {
    "key": "ingreso.unidad_origen",
    "term": "Unidad de origen",
    "definitionMarkdown": "Lugar desde donde ingresa el paciente a la UPC (urgencias, sala, pabellón, otro centro, etc.).",
    "definitionHtml": "<p>Lugar desde donde ingresa el paciente a la UPC (urgencias, sala, pabellón, otro centro, etc.).</p>"
  },
  "ingreso.diagnostico.principal": {
    "key": "ingreso.diagnostico.principal",
    "term": "Diagnóstico principal",
    "definitionMarkdown": "Diagnóstico que motivó el ingreso a la UPC.\n* **Nota de desambiguación:** No repitas aquí las enfermedades de base, salvo que hayan llegado descompensadas.",
    "definitionHtml": "<p>Diagnóstico que motivó el ingreso a la UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No repitas aquí las enfermedades de base, salvo que hayan llegado descompensadas.</li>\n</ul>"
  },
  "ingreso.diagnostico.otros": {
    "key": "ingreso.diagnostico.otros",
    "term": "Otros diagnósticos de ingreso",
    "definitionMarkdown": "Diagnósticos secundarios presentes al ingreso, distintos del principal.\n\n---",
    "definitionHtml": "<p>Diagnósticos secundarios presentes al ingreso, distintos del principal.</p>\n<hr>"
  },
  "soporte.reanimacion": {
    "key": "soporte.reanimacion",
    "term": "Reanimación cardiopulmonar",
    "definitionMarkdown": "Maniobras de reanimación cardiopulmonar (RCP) por paro cardiorrespiratorio durante la estadía.",
    "definitionHtml": "<p>Maniobras de reanimación cardiopulmonar (RCP) por paro cardiorrespiratorio durante la estadía.</p>"
  },
  "soporte.reanimacion.causa_paro": {
    "key": "soporte.reanimacion.causa_paro",
    "term": "Causa del paro",
    "definitionMarkdown": "Causa documentada del paro cardiorrespiratorio.",
    "definitionHtml": "<p>Causa documentada del paro cardiorrespiratorio.</p>"
  },
  "soporte.reanimacion.ritmo_inicial": {
    "key": "soporte.reanimacion.ritmo_inicial",
    "term": "Ritmo inicial (Desfibrilable/No desfibrilable)",
    "definitionMarkdown": "Ritmo al inicio del paro: desfibrilable (fibrilación ventricular / taquicardia ventricular sin pulso) o no desfibrilable (asistolia / actividad eléctrica sin pulso).",
    "definitionHtml": "<p>Ritmo al inicio del paro: desfibrilable (fibrilación ventricular / taquicardia ventricular sin pulso) o no desfibrilable (asistolia / actividad eléctrica sin pulso).</p>"
  },
  "soporte.reanimacion.requirio_desfibrilacion": {
    "key": "soporte.reanimacion.requirio_desfibrilacion",
    "term": "Requirió desfibrilación",
    "definitionMarkdown": "Marca si se aplicó desfibrilación durante la reanimación.",
    "definitionHtml": "<p>Marca si se aplicó desfibrilación durante la reanimación.</p>"
  },
  "soporte.reanimacion.retorno_circulacion": {
    "key": "soporte.reanimacion.retorno_circulacion",
    "term": "Retorno a circulación espontánea (ROSC)",
    "definitionMarkdown": "Marca si el paciente recuperó circulación espontánea tras la reanimación.",
    "definitionHtml": "<p>Marca si el paciente recuperó circulación espontánea tras la reanimación.</p>"
  },
  "soporte.hemodinamico": {
    "key": "soporte.hemodinamico",
    "term": "Hemodinámico",
    "definitionMarkdown": "Bloque de soportes hemodinámicos utilizados durante la estadía.",
    "definitionHtml": "<p>Bloque de soportes hemodinámicos utilizados durante la estadía.</p>"
  },
  "soporte.hemodinamico.drogas_vasoactivas": {
    "key": "soporte.hemodinamico.drogas_vasoactivas",
    "term": "Drogas vasoactivas",
    "definitionMarkdown": "Uso de vasopresores (noradrenalina, adrenalina, vasopresina, entre otros).\n* **Nota de desambiguación:** Su uso en dosis baja secundario a hipotensión por sedoanalgesia **no** equivale a shock ni a falla hemodinámica.",
    "definitionHtml": "<p>Uso de vasopresores (noradrenalina, adrenalina, vasopresina, entre otros).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Su uso en dosis baja secundario a hipotensión por sedoanalgesia <strong>no</strong> equivale a shock ni a falla hemodinámica.</li>\n</ul>"
  },
  "soporte.hemodinamico.inotropicos": {
    "key": "soporte.hemodinamico.inotropicos",
    "term": "Inotrópicos",
    "definitionMarkdown": "Uso de drogas inotrópicas (dobutamina, milrinona, levosimendán).",
    "definitionHtml": "<p>Uso de drogas inotrópicas (dobutamina, milrinona, levosimendán).</p>"
  },
  "soporte.hemodinamico.corticoides_shock": {
    "key": "soporte.hemodinamico.corticoides_shock",
    "term": "Corticoides en dosis de estrés o por shock refractario",
    "definitionMarkdown": "Uso de corticoides (hidrocortisona) por shock refractario o en dosis de estrés.\n* **Nota de desambiguación:** Marcar solo cuando el texto indique explícitamente su uso por shock refractario o dosis de estrés, no por otra causa.",
    "definitionHtml": "<p>Uso de corticoides (hidrocortisona) por shock refractario o en dosis de estrés.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Marcar solo cuando el texto indique explícitamente su uso por shock refractario o dosis de estrés, no por otra causa.</li>\n</ul>"
  },
  "soporte.hemodinamico.soporte_circulatorio_mecanico": {
    "key": "soporte.hemodinamico.soporte_circulatorio_mecanico",
    "term": "Dispositivo de soporte circulatorio mecánico",
    "definitionMarkdown": "Soporte circulatorio mecánico (balón de contrapulsación aórtica, entre otros).\n* **Nota de desambiguación:** La ECMO veno-arterial no se registra aquí, sino en *Circulación extracorpórea*.",
    "definitionHtml": "<p>Soporte circulatorio mecánico (balón de contrapulsación aórtica, entre otros).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La ECMO veno-arterial no se registra aquí, sino en <em>Circulación extracorpórea</em>.</li>\n</ul>"
  },
  "soporte.hemodinamico.otro": {
    "key": "soporte.hemodinamico.otro",
    "term": "Otro soporte hemodinámico",
    "definitionMarkdown": "Otro soporte hemodinámico no cubierto (p. ej. azul de metileno).",
    "definitionHtml": "<p>Otro soporte hemodinámico no cubierto (p. ej. azul de metileno).</p>"
  },
  "soporte.respiratorio.vmi": {
    "key": "soporte.respiratorio.vmi",
    "term": "Ventilación mecánica invasiva",
    "definitionMarkdown": "Soporte ventilatorio mediante tubo endotraqueal (TET) o traqueostomía conectado a ventilador mecánico; la extubación también evidencia un episodio previo.\n* **Nota de desambiguación:** La ECMO veno-venosa no se registra aquí, sino en *Circulación extracorpórea*.",
    "definitionHtml": "<p>Soporte ventilatorio mediante tubo endotraqueal (TET) o traqueostomía conectado a ventilador mecánico; la extubación también evidencia un episodio previo.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La ECMO veno-venosa no se registra aquí, sino en <em>Circulación extracorpórea</em>.</li>\n</ul>"
  },
  "soporte.respiratorio.vmi.fecha_inicio": {
    "key": "soporte.respiratorio.vmi.fecha_inicio",
    "term": "Fecha de inicio",
    "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.bloqueo_neuromuscular.fecha_inicio": {
    "key": "soporte.respiratorio.bloqueo_neuromuscular.fecha_inicio",
    "term": "Fecha de inicio",
    "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.prono.fecha_inicio": {
    "key": "soporte.respiratorio.prono.fecha_inicio",
    "term": "Fecha de inicio",
    "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.vmi.fecha_termino": {
    "key": "soporte.respiratorio.vmi.fecha_termino",
    "term": "Fecha de término",
    "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.bloqueo_neuromuscular.fecha_termino": {
    "key": "soporte.respiratorio.bloqueo_neuromuscular.fecha_termino",
    "term": "Fecha de término",
    "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.prono.fecha_termino": {
    "key": "soporte.respiratorio.prono.fecha_termino",
    "term": "Fecha de término",
    "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.respiratorio.vmi.mas_de_un_ciclo": {
    "key": "soporte.respiratorio.vmi.mas_de_un_ciclo",
    "term": "Requirió más de un ciclo de VMI",
    "definitionMarkdown": "Marca si la ventilación mecánica invasiva se aplicó en más de un episodio (p. ej. reintubación).",
    "definitionHtml": "<p>Marca si la ventilación mecánica invasiva se aplicó en más de un episodio (p. ej. reintubación).</p>"
  },
  "soporte.respiratorio.bloqueo_neuromuscular": {
    "key": "soporte.respiratorio.bloqueo_neuromuscular",
    "term": "Bloqueo neuromuscular",
    "definitionMarkdown": "Uso de bloqueadores neuromusculares durante la VMI (rocuronio, vecuronio, cisatracurio, atracurio).",
    "definitionHtml": "<p>Uso de bloqueadores neuromusculares durante la VMI (rocuronio, vecuronio, cisatracurio, atracurio).</p>"
  },
  "soporte.respiratorio.bloqueo_neuromuscular.mas_de_un_ciclo": {
    "key": "soporte.respiratorio.bloqueo_neuromuscular.mas_de_un_ciclo",
    "term": "Requirió más de un ciclo de bloqueo neuromuscular",
    "definitionMarkdown": "Marca si el bloqueo neuromuscular se administró en más de un ciclo.",
    "definitionHtml": "<p>Marca si el bloqueo neuromuscular se administró en más de un ciclo.</p>"
  },
  "soporte.respiratorio.prono": {
    "key": "soporte.respiratorio.prono",
    "term": "Posición prono",
    "definitionMarkdown": "Ventilación en decúbito prono.\n* **Nota de desambiguación:** No incluye cambios posturales generales, solo la posición prono propiamente tal.",
    "definitionHtml": "<p>Ventilación en decúbito prono.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye cambios posturales generales, solo la posición prono propiamente tal.</li>\n</ul>"
  },
  "soporte.respiratorio.prono.mas_de_un_ciclo": {
    "key": "soporte.respiratorio.prono.mas_de_un_ciclo",
    "term": "Requirió más de un ciclo de prono",
    "definitionMarkdown": "Marca si la posición prono se aplicó en más de un ciclo.",
    "definitionHtml": "<p>Marca si la posición prono se aplicó en más de un ciclo.</p>"
  },
  "soporte.respiratorio.traqueostomia": {
    "key": "soporte.respiratorio.traqueostomia",
    "term": "Traqueostomía",
    "definitionMarkdown": "Procedimiento para crear una abertura en la tráquea (TQT) para soporte respiratorio prolongado. Se distingue si fue realizada en UPC, previa al ingreso, o no documentada.\n* **Nota de desambiguación:** La traqueostomía va en *Soporte respiratorio*, no en *Complicaciones*.",
    "definitionHtml": "<p>Procedimiento para crear una abertura en la tráquea (TQT) para soporte respiratorio prolongado. Se distingue si fue realizada en UPC, previa al ingreso, o no documentada.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La traqueostomía va en <em>Soporte respiratorio</em>, no en <em>Complicaciones</em>.</li>\n</ul>"
  },
  "soporte.respiratorio.vmni": {
    "key": "soporte.respiratorio.vmni",
    "term": "Ventilación mecánica no invasiva o nivel de soporte menor",
    "definitionMarkdown": "Ventilación no invasiva (VMNI), cánula nasal de alto flujo u oxigenoterapia convencional relevante.",
    "definitionHtml": "<p>Ventilación no invasiva (VMNI), cánula nasal de alto flujo u oxigenoterapia convencional relevante.</p>"
  },
  "soporte.circulacion_extracorporea": {
    "key": "soporte.circulacion_extracorporea",
    "term": "Circulación extracorpórea",
    "definitionMarkdown": "ECMO, CEC (circulación extracorpórea) u oxigenación por membrana extracorpórea en general.\n* **Nota de desambiguación:** Es independiente de *Hemodinámico* y de *Respiratorio*; no se registra en esas categorías.",
    "definitionHtml": "<p>ECMO, CEC (circulación extracorpórea) u oxigenación por membrana extracorpórea en general.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Es independiente de <em>Hemodinámico</em> y de <em>Respiratorio</em>; no se registra en esas categorías.</li>\n</ul>"
  },
  "soporte.respiratorio.vmi.motivo": {
    "key": "soporte.respiratorio.vmi.motivo",
    "term": "Motivo",
    "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
    "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
  },
  "soporte.respiratorio.traqueostomia.motivo": {
    "key": "soporte.respiratorio.traqueostomia.motivo",
    "term": "Motivo",
    "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
    "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
  },
  "soporte.hfav.motivo": {
    "key": "soporte.hfav.motivo",
    "term": "Motivo",
    "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
    "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
  },
  "soporte.sedoanalgesia_continua": {
    "key": "soporte.sedoanalgesia_continua",
    "term": "Sedoanalgesia continua",
    "definitionMarkdown": "Sedación/analgesia continua (propofol, midazolam, fentanilo, dexmedetomidina, entre otros).",
    "definitionHtml": "<p>Sedación/analgesia continua (propofol, midazolam, fentanilo, dexmedetomidina, entre otros).</p>"
  },
  "soporte.renal": {
    "key": "soporte.renal",
    "term": "Renal",
    "definitionMarkdown": "Bloque de soportes renales utilizados durante la estadía.",
    "definitionHtml": "<p>Bloque de soportes renales utilizados durante la estadía.</p>"
  },
  "soporte.renal.hemodialisis_aguda": {
    "key": "soporte.renal.hemodialisis_aguda",
    "term": "Hemodiálisis aguda",
    "definitionMarkdown": "Hemodiálisis intermitente iniciada de forma aguda durante la estadía.",
    "definitionHtml": "<p>Hemodiálisis intermitente iniciada de forma aguda durante la estadía.</p>"
  },
  "soporte.renal.trr_continua": {
    "key": "soporte.renal.trr_continua",
    "term": "Terapia de reemplazo renal continua",
    "definitionMarkdown": "Terapia de reemplazo renal continua (hemofiltración o hemodiafiltración continua).",
    "definitionHtml": "<p>Terapia de reemplazo renal continua (hemofiltración o hemodiafiltración continua).</p>"
  },
  "soporte.renal.ultrafiltracion_aislada": {
    "key": "soporte.renal.ultrafiltracion_aislada",
    "term": "Ultrafiltración aislada",
    "definitionMarkdown": "Ultrafiltración aislada para manejo de volumen.",
    "definitionHtml": "<p>Ultrafiltración aislada para manejo de volumen.</p>"
  },
  "soporte.renal.dialisis_peritoneal_aguda": {
    "key": "soporte.renal.dialisis_peritoneal_aguda",
    "term": "Diálisis peritoneal aguda",
    "definitionMarkdown": "Diálisis peritoneal iniciada de forma aguda durante la estadía.",
    "definitionHtml": "<p>Diálisis peritoneal iniciada de forma aguda durante la estadía.</p>"
  },
  "soporte.renal.otro": {
    "key": "soporte.renal.otro",
    "term": "Otro soporte renal",
    "definitionMarkdown": "Otro soporte renal no cubierto por los campos anteriores.\n* **Nota de desambiguación:** No se registra la diálisis crónica habitual sin cambios; sí se registra si el cuadro obliga a modificar o intensificar la modalidad.",
    "definitionHtml": "<p>Otro soporte renal no cubierto por los campos anteriores.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No se registra la diálisis crónica habitual sin cambios; sí se registra si el cuadro obliga a modificar o intensificar la modalidad.</li>\n</ul>"
  },
  "soporte.otros_avanzados": {
    "key": "soporte.otros_avanzados",
    "term": "Otros soportes avanzados",
    "definitionMarkdown": "Bloque de soportes avanzados adicionales utilizados durante la estadía.",
    "definitionHtml": "<p>Bloque de soportes avanzados adicionales utilizados durante la estadía.</p>"
  },
  "soporte.hfav": {
    "key": "soporte.hfav",
    "term": "Hemofiltración de alto volumen",
    "definitionMarkdown": "Hemofiltración de alto volumen, independiente del soporte renal habitual. Se especifica su indicación (renal/depurativa, inmunomodulación/remoción de citoquinas, mixta o no especificada).",
    "definitionHtml": "<p>Hemofiltración de alto volumen, independiente del soporte renal habitual. Se especifica su indicación (renal/depurativa, inmunomodulación/remoción de citoquinas, mixta o no especificada).</p>"
  },
  "soporte.transfusion": {
    "key": "soporte.transfusion",
    "term": "Transfusión de hemoderivados",
    "definitionMarkdown": "Transfusión de glóbulos rojos, plaquetas, plasma fresco congelado o crioprecipitado.",
    "definitionHtml": "<p>Transfusión de glóbulos rojos, plaquetas, plasma fresco congelado o crioprecipitado.</p>"
  },
  "soporte.transfusion.tipo": {
    "key": "soporte.transfusion.tipo",
    "term": "Tipo de hemoderivado",
    "definitionMarkdown": "Tipo de hemoderivado transfundido (glóbulos rojos, plaquetas, plasma, crioprecipitado).",
    "definitionHtml": "<p>Tipo de hemoderivado transfundido (glóbulos rojos, plaquetas, plasma, crioprecipitado).</p>"
  },
  "soporte.transfusion.masiva": {
    "key": "soporte.transfusion.masiva",
    "term": "Protocolo de transfusión masiva",
    "definitionMarkdown": "Marca si la transfusión correspondió a un protocolo de transfusión masiva.",
    "definitionHtml": "<p>Marca si la transfusión correspondió a un protocolo de transfusión masiva.</p>"
  },
  "soporte.otros_avanzados.recambio_plasmatico": {
    "key": "soporte.otros_avanzados.recambio_plasmatico",
    "term": "Recambio plasmático terapéutico",
    "definitionMarkdown": "Plasmaféresis o recambio plasmático terapéutico.",
    "definitionHtml": "<p>Plasmaféresis o recambio plasmático terapéutico.</p>"
  },
  "soporte.otros_avanzados.hemoadsorcion": {
    "key": "soporte.otros_avanzados.hemoadsorcion",
    "term": "Hemoadsorción",
    "definitionMarkdown": "Terapia de hemoadsorción.",
    "definitionHtml": "<p>Terapia de hemoadsorción.</p>"
  },
  "soporte.otros_avanzados.hipotermia_terapeutica": {
    "key": "soporte.otros_avanzados.hipotermia_terapeutica",
    "term": "Hipotermia terapéutica",
    "definitionMarkdown": "Manejo con hipotermia terapéutica / control dirigido de temperatura.",
    "definitionHtml": "<p>Manejo con hipotermia terapéutica / control dirigido de temperatura.</p>"
  },
  "soporte.otros_avanzados.soporte_hepatico": {
    "key": "soporte.otros_avanzados.soporte_hepatico",
    "term": "Soporte hepático extracorpóreo",
    "definitionMarkdown": "Soporte hepático extracorpóreo (p. ej. sistemas de diálisis hepática).",
    "definitionHtml": "<p>Soporte hepático extracorpóreo (p. ej. sistemas de diálisis hepática).</p>"
  },
  "soporte.otros_avanzados.insulina_infusion": {
    "key": "soporte.otros_avanzados.insulina_infusion",
    "term": "Insulina en infusión continua",
    "definitionMarkdown": "Administración de insulina en infusión continua como soporte.\n* **Nota de desambiguación:** No incluye la insulina subcutánea de corrección habitual.",
    "definitionHtml": "<p>Administración de insulina en infusión continua como soporte.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la insulina subcutánea de corrección habitual.</li>\n</ul>"
  },
  "soporte.otros_avanzados.otro": {
    "key": "soporte.otros_avanzados.otro",
    "term": "Otro soporte avanzado",
    "definitionMarkdown": "Otro soporte avanzado no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro soporte avanzado no cubierto por los campos anteriores.</p>"
  },
  "soporte.intervenciones": {
    "key": "soporte.intervenciones",
    "term": "Intervenciones terapéuticas",
    "definitionMarkdown": "Procedimientos terapéuticos realizados durante la estadía en UPC.\n* **Nota de desambiguación:** Se registran los procedimientos realizados durante la estadía en UPC, no los que motivaron el ingreso.",
    "definitionHtml": "<p>Procedimientos terapéuticos realizados durante la estadía en UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Se registran los procedimientos realizados durante la estadía en UPC, no los que motivaron el ingreso.</li>\n</ul>"
  },
  "soporte.intervenciones.quirurgico": {
    "key": "soporte.intervenciones.quirurgico",
    "term": "Quirúrgico",
    "definitionMarkdown": "Procedimiento quirúrgico realizado durante la estadía.",
    "definitionHtml": "<p>Procedimiento quirúrgico realizado durante la estadía.</p>"
  },
  "soporte.intervenciones.endoscopico": {
    "key": "soporte.intervenciones.endoscopico",
    "term": "Endoscópico",
    "definitionMarkdown": "Procedimiento endoscópico (endoscopía digestiva con hemostasia, colangiopancreatografía retrógrada endoscópica, broncoscopía terapéutica, entre otros).",
    "definitionHtml": "<p>Procedimiento endoscópico (endoscopía digestiva con hemostasia, colangiopancreatografía retrógrada endoscópica, broncoscopía terapéutica, entre otros).</p>"
  },
  "soporte.intervenciones.cardiologico": {
    "key": "soporte.intervenciones.cardiologico",
    "term": "Cardiológico",
    "definitionMarkdown": "Procedimiento cardiológico (marcapasos transitorio, cardioversión eléctrica o desfibrilación, entre otros).",
    "definitionHtml": "<p>Procedimiento cardiológico (marcapasos transitorio, cardioversión eléctrica o desfibrilación, entre otros).</p>"
  },
  "soporte.intervenciones.reperfusion": {
    "key": "soporte.intervenciones.reperfusion",
    "term": "Reperfusión",
    "definitionMarkdown": "Terapia de reperfusión (intervención coronaria percutánea, trombólisis, trombectomía, u otro).",
    "definitionHtml": "<p>Terapia de reperfusión (intervención coronaria percutánea, trombólisis, trombectomía, u otro).</p>"
  },
  "soporte.intervenciones.otro": {
    "key": "soporte.intervenciones.otro",
    "term": "Otro tipo de intervención",
    "definitionMarkdown": "Otra intervención (toracocentesis, pericardiocentesis, paracentesis, entre otros).",
    "definitionHtml": "<p>Otra intervención (toracocentesis, pericardiocentesis, paracentesis, entre otros).</p>"
  },
  "soporte.respiratorio.traqueostomia.fecha_realizacion": {
    "key": "soporte.respiratorio.traqueostomia.fecha_realizacion",
    "term": "Fecha de realización",
    "definitionMarkdown": "Fecha en que se realizó el procedimiento (DD/MM/AAAA), cuando el texto la consigna.",
    "definitionHtml": "<p>Fecha en que se realizó el procedimiento (DD/MM/AAAA), cuando el texto la consigna.</p>"
  },
  "soporte.reanimacion.duracion_ciclos": {
    "key": "soporte.reanimacion.duracion_ciclos",
    "term": "Duración o número de ciclos",
    "definitionMarkdown": "Duración del soporte o número de ciclos, cuando el texto lo especifica.",
    "definitionHtml": "<p>Duración del soporte o número de ciclos, cuando el texto lo especifica.</p>"
  },
  "soporte.reanimacion.fecha_disponible": {
    "key": "soporte.reanimacion.fecha_disponible",
    "term": "Fecha disponible",
    "definitionMarkdown": "Marca si en el texto hay una fecha explícita disponible para este ítem.\n\n---",
    "definitionHtml": "<p>Marca si en el texto hay una fecha explícita disponible para este ítem.</p>\n<hr>"
  },
  "falla.puntaje_gravedad": {
    "key": "falla.puntaje_gravedad",
    "term": "Puntaje de gravedad o disfunción orgánica (SOFA, APACHE…)",
    "definitionMarkdown": "Puntaje de gravedad o disfunción orgánica. Se registra solo si el texto lo menciona explícitamente (SOFA, qSOFA, APACHE II o IV, KDIGO, MELD, CLIF-SOFA o CLIF-C, entre otros).",
    "definitionHtml": "<p>Puntaje de gravedad o disfunción orgánica. Se registra solo si el texto lo menciona explícitamente (SOFA, qSOFA, APACHE II o IV, KDIGO, MELD, CLIF-SOFA o CLIF-C, entre otros).</p>"
  },
  "falla.respiratoria": {
    "key": "falla.respiratoria",
    "term": "Falla respiratoria",
    "definitionMarkdown": "Insuficiencia respiratoria, síndrome de distrés respiratorio agudo (SDRA) o hipoxemia grave.",
    "definitionHtml": "<p>Insuficiencia respiratoria, síndrome de distrés respiratorio agudo (SDRA) o hipoxemia grave.</p>"
  },
  "falla.hemodinamica": {
    "key": "falla.hemodinamica",
    "term": "Falla hemodinámica",
    "definitionMarkdown": "Shock, hipotensión persistente pese a volumen, o inestabilidad hemodinámica relevante.",
    "definitionHtml": "<p>Shock, hipotensión persistente pese a volumen, o inestabilidad hemodinámica relevante.</p>"
  },
  "falla.renal_aguda": {
    "key": "falla.renal_aguda",
    "term": "Falla renal aguda",
    "definitionMarkdown": "Injuria renal aguda o aguda sobre crónica.\n* **Nota de desambiguación:** No incluye la enfermedad renal crónica estable (esa es un antecedente).",
    "definitionHtml": "<p>Injuria renal aguda o aguda sobre crónica.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la enfermedad renal crónica estable (esa es un antecedente).</li>\n</ul>"
  },
  "falla.neurologica": {
    "key": "falla.neurologica",
    "term": "Falla neurológica",
    "definitionMarkdown": "Compromiso de conciencia severo, encefalopatía grave, convulsiones o estado epiléptico, o evento cerebrovascular agudo.\n* **Nota de desambiguación:** El delirium se registra aquí solo si es severo; el delirium leve va en *Complicaciones*.",
    "definitionHtml": "<p>Compromiso de conciencia severo, encefalopatía grave, convulsiones o estado epiléptico, o evento cerebrovascular agudo.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El delirium se registra aquí solo si es severo; el delirium leve va en <em>Complicaciones</em>.</li>\n</ul>"
  },
  "falla.hepatica": {
    "key": "falla.hepatica",
    "term": "Falla hepática",
    "definitionMarkdown": "Falla hepática aguda, aguda sobre crónica o descompensación aguda.\n* **Nota de desambiguación:** No incluye la cirrosis estable (esa es un antecedente).",
    "definitionHtml": "<p>Falla hepática aguda, aguda sobre crónica o descompensación aguda.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la cirrosis estable (esa es un antecedente).</li>\n</ul>"
  },
  "falla.hematologica": {
    "key": "falla.hematologica",
    "term": "Falla hematológica",
    "definitionMarkdown": "Trombocitopenia severa, coagulopatía o coagulación intravascular diseminada, hemorragia significativa, trombosis con repercusión, microangiopatía trombótica o hemólisis.\n* **Nota de desambiguación:** Las citopenias crónicas solo se registran si variaron durante la estadía.",
    "definitionHtml": "<p>Trombocitopenia severa, coagulopatía o coagulación intravascular diseminada, hemorragia significativa, trombosis con repercusión, microangiopatía trombótica o hemólisis.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Las citopenias crónicas solo se registran si variaron durante la estadía.</li>\n</ul>"
  },
  "falla.otra": {
    "key": "falla.otra",
    "term": "Otra falla",
    "definitionMarkdown": "Otra falla orgánica no cubierta por los campos anteriores.",
    "definitionHtml": "<p>Otra falla orgánica no cubierta por los campos anteriores.</p>"
  },
  "falla.multiorganica": {
    "key": "falla.multiorganica",
    "term": "Falla multiorgánica",
    "definitionMarkdown": "Falla multiorgánica. Se marca solo si el texto lo menciona explícitamente como tal o equivalente.\n\n---",
    "definitionHtml": "<p>Falla multiorgánica. Se marca solo si el texto lo menciona explícitamente como tal o equivalente.</p>\n<hr>"
  },
  "infecciones.estadia_upc": {
    "key": "infecciones.estadia_upc",
    "term": "Infección/es durante la estadía en UPC",
    "definitionMarkdown": "Infección diagnosticada durante la estadía en la UPC.\n* **Nota de desambiguación:** No se registra por fiebre, leucocitosis, marcadores aislados, cultivos sin diagnóstico, profilaxis, o sospecha descartada.",
    "definitionHtml": "<p>Infección diagnosticada durante la estadía en la UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No se registra por fiebre, leucocitosis, marcadores aislados, cultivos sin diagnóstico, profilaxis, o sospecha descartada.</li>\n</ul>"
  },
  "infecciones.sepsis": {
    "key": "infecciones.sepsis",
    "term": "Sepsis o shock séptico",
    "definitionMarkdown": "Infección con disfunción orgánica asociada. Se distingue entre sepsis y shock séptico.",
    "definitionHtml": "<p>Infección con disfunción orgánica asociada. Se distingue entre sepsis y shock séptico.</p>"
  },
  "infecciones.focos.urinario": {
    "key": "infecciones.focos.urinario",
    "term": "Urinario",
    "definitionMarkdown": "Foco infeccioso urinario (infección del tracto urinario, pielonefritis).",
    "definitionHtml": "<p>Foco infeccioso urinario (infección del tracto urinario, pielonefritis).</p>"
  },
  "soporte.respiratorio": {
    "key": "soporte.respiratorio",
    "term": "Respiratorio",
    "definitionMarkdown": "Foco infeccioso respiratorio (neumonía, traqueobronquitis).",
    "definitionHtml": "<p>Foco infeccioso respiratorio (neumonía, traqueobronquitis).</p>"
  },
  "infecciones.focos.respiratorio": {
    "key": "infecciones.focos.respiratorio",
    "term": "Respiratorio",
    "definitionMarkdown": "Foco infeccioso respiratorio (neumonía, traqueobronquitis).",
    "definitionHtml": "<p>Foco infeccioso respiratorio (neumonía, traqueobronquitis).</p>"
  },
  "infecciones.focos.digestivo_biliar": {
    "key": "infecciones.focos.digestivo_biliar",
    "term": "Digestivo o biliar",
    "definitionMarkdown": "Foco infeccioso digestivo o biliar (colangitis, peritonitis, absceso intraabdominal).",
    "definitionHtml": "<p>Foco infeccioso digestivo o biliar (colangitis, peritonitis, absceso intraabdominal).</p>"
  },
  "infecciones.focos.cateter": {
    "key": "infecciones.focos.cateter",
    "term": "Catéter o dispositivo intravascular",
    "definitionMarkdown": "Infección asociada a catéter o dispositivo intravascular.",
    "definitionHtml": "<p>Infección asociada a catéter o dispositivo intravascular.</p>"
  },
  "infecciones.focos.piel_blandas": {
    "key": "infecciones.focos.piel_blandas",
    "term": "Piel y partes blandas",
    "definitionMarkdown": "Foco en piel y partes blandas (celulitis, fascitis, absceso).",
    "definitionHtml": "<p>Foco en piel y partes blandas (celulitis, fascitis, absceso).</p>"
  },
  "infecciones.focos.sistema_nervioso": {
    "key": "infecciones.focos.sistema_nervioso",
    "term": "Sistema nervioso central",
    "definitionMarkdown": "Foco en el sistema nervioso central (meningitis, encefalitis, absceso cerebral).",
    "definitionHtml": "<p>Foco en el sistema nervioso central (meningitis, encefalitis, absceso cerebral).</p>"
  },
  "infecciones.focos.osteoarticular": {
    "key": "infecciones.focos.osteoarticular",
    "term": "Osteoarticular",
    "definitionMarkdown": "Foco osteoarticular (osteomielitis, artritis séptica).",
    "definitionHtml": "<p>Foco osteoarticular (osteomielitis, artritis séptica).</p>"
  },
  "infecciones.focos.cardiovascular_endocarditis": {
    "key": "infecciones.focos.cardiovascular_endocarditis",
    "term": "Cardiovascular o endocarditis",
    "definitionMarkdown": "Foco cardiovascular o endocarditis.",
    "definitionHtml": "<p>Foco cardiovascular o endocarditis.</p>"
  },
  "infecciones.focos.herida_sitio_quirurgico": {
    "key": "infecciones.focos.herida_sitio_quirurgico",
    "term": "Herida operatoria o sitio quirúrgico",
    "definitionMarkdown": "Infección de herida operatoria o sitio quirúrgico.",
    "definitionHtml": "<p>Infección de herida operatoria o sitio quirúrgico.</p>"
  },
  "infecciones.focos.otro": {
    "key": "infecciones.focos.otro",
    "term": "Otro foco",
    "definitionMarkdown": "Otro foco infeccioso no cubierto por los campos anteriores.",
    "definitionHtml": "<p>Otro foco infeccioso no cubierto por los campos anteriores.</p>"
  },
  "infecciones.focos.no_identificado": {
    "key": "infecciones.focos.no_identificado",
    "term": "No identificado",
    "definitionMarkdown": "Infección sin foco identificado.",
    "definitionHtml": "<p>Infección sin foco identificado.</p>"
  },
  "infecciones.focos.urinario.iaas": {
    "key": "infecciones.focos.urinario.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.respiratorio.iaas": {
    "key": "infecciones.focos.respiratorio.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.cateter.iaas": {
    "key": "infecciones.focos.cateter.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.piel_blandas.iaas": {
    "key": "infecciones.focos.piel_blandas.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.cardiovascular_endocarditis.iaas": {
    "key": "infecciones.focos.cardiovascular_endocarditis.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.otro.iaas": {
    "key": "infecciones.focos.otro.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.no_identificado.iaas": {
    "key": "infecciones.focos.no_identificado.iaas",
    "term": "Asociado a dispositivo o a la atención en salud (IAAS)",
    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
  },
  "infecciones.focos.urinario.agente": {
    "key": "infecciones.focos.urinario.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.respiratorio.agente": {
    "key": "infecciones.focos.respiratorio.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.digestivo_biliar.agente": {
    "key": "infecciones.focos.digestivo_biliar.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.cateter.agente": {
    "key": "infecciones.focos.cateter.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.piel_blandas.agente": {
    "key": "infecciones.focos.piel_blandas.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.herida_sitio_quirurgico.agente": {
    "key": "infecciones.focos.herida_sitio_quirurgico.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.sistema_nervioso.agente": {
    "key": "infecciones.focos.sistema_nervioso.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.osteoarticular.agente": {
    "key": "infecciones.focos.osteoarticular.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.cardiovascular_endocarditis.agente": {
    "key": "infecciones.focos.cardiovascular_endocarditis.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.otro.agente": {
    "key": "infecciones.focos.otro.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.no_identificado.agente": {
    "key": "infecciones.focos.no_identificado.agente",
    "term": "Agente microbiológico",
    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
  },
  "infecciones.focos.urinario.tratamiento": {
    "key": "infecciones.focos.urinario.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.respiratorio.tratamiento": {
    "key": "infecciones.focos.respiratorio.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.digestivo_biliar.tratamiento": {
    "key": "infecciones.focos.digestivo_biliar.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.cateter.tratamiento": {
    "key": "infecciones.focos.cateter.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.piel_blandas.tratamiento": {
    "key": "infecciones.focos.piel_blandas.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.herida_sitio_quirurgico.tratamiento": {
    "key": "infecciones.focos.herida_sitio_quirurgico.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.sistema_nervioso.tratamiento": {
    "key": "infecciones.focos.sistema_nervioso.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.osteoarticular.tratamiento": {
    "key": "infecciones.focos.osteoarticular.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.cardiovascular_endocarditis.tratamiento": {
    "key": "infecciones.focos.cardiovascular_endocarditis.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.otro.tratamiento": {
    "key": "infecciones.focos.otro.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "infecciones.focos.no_identificado.tratamiento": {
    "key": "infecciones.focos.no_identificado.tratamiento",
    "term": "Tratamiento para este foco",
    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
  },
  "complicaciones.delirium": {
    "key": "complicaciones.delirium",
    "term": "Delirium",
    "definitionMarkdown": "Alteración fluctuante del estado mental, la atención y el nivel de conciencia durante la estadía en UCI (agitación, confusión, CAM-ICU positivo).\n* **Nota de desambiguación:** El delirium leve va aquí; el delirium grave (encefalopatía severa, coma) va en *Falla orgánica* (neurológica).",
    "definitionHtml": "<p>Alteración fluctuante del estado mental, la atención y el nivel de conciencia durante la estadía en UCI (agitación, confusión, CAM-ICU positivo).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El delirium leve va aquí; el delirium grave (encefalopatía severa, coma) va en <em>Falla orgánica</em> (neurológica).</li>\n</ul>"
  },
  "complicaciones.debilidad_adquirida": {
    "key": "complicaciones.debilidad_adquirida",
    "term": "Debilidad adquirida",
    "definitionMarkdown": "Debilidad muscular difusa, polineuropatía o miopatía del paciente crítico, o dificultad para el destete del ventilador mecánico debido a debilidad.",
    "definitionHtml": "<p>Debilidad muscular difusa, polineuropatía o miopatía del paciente crítico, o dificultad para el destete del ventilador mecánico debido a debilidad.</p>"
  },
  "complicaciones.lesiones_presion": {
    "key": "complicaciones.lesiones_presion",
    "term": "Lesiones por presión",
    "definitionMarkdown": "Úlceras por presión o escaras desarrolladas en la UCI, especialmente si requirieron aseo quirúrgico.",
    "definitionHtml": "<p>Úlceras por presión o escaras desarrolladas en la UCI, especialmente si requirieron aseo quirúrgico.</p>"
  },
  "complicaciones.desnutricion": {
    "key": "complicaciones.desnutricion",
    "term": "Desnutricion o soporte nutricional intensivo",
    "definitionMarkdown": "Requiere diagnóstico explícito de desnutrición en la epicrisis o la administración de soporte nutricional intensivo. La sola mención de nutrición enteral o parenteral no basta por sí sola si no hay diagnóstico o soporte intensivo explícito.",
    "definitionHtml": "<p>Requiere diagnóstico explícito de desnutrición en la epicrisis o la administración de soporte nutricional intensivo. La sola mención de nutrición enteral o parenteral no basta por sí sola si no hay diagnóstico o soporte intensivo explícito.</p>"
  },
  "complicaciones.disfagia": {
    "key": "complicaciones.disfagia",
    "term": "Disfagia o trastorno deglutorio",
    "definitionMarkdown": "Requiere diagnóstico explícito de disfagia o derivación formal a fonoaudiología por sospecha de trastorno deglutorio; la sola rehabilitación fonoaudiológica sin diagnóstico no basta por sí sola.",
    "definitionHtml": "<p>Requiere diagnóstico explícito de disfagia o derivación formal a fonoaudiología por sospecha de trastorno deglutorio; la sola rehabilitación fonoaudiológica sin diagnóstico no basta por sí sola.</p>"
  },
  "complicaciones.paciente_critico_cronico": {
    "key": "complicaciones.paciente_critico_cronico",
    "term": "Paciente crítico crónico",
    "definitionMarkdown": "Se marca con certeza solo si el texto de la epicrisis describe explícitamente al paciente como tal (\"crítico crónico\", \"paciente crónico de UCI\").",
    "definitionHtml": "<p>Se marca con certeza solo si el texto de la epicrisis describe explícitamente al paciente como tal (&quot;crítico crónico&quot;, &quot;paciente crónico de UCI&quot;).</p>"
  },
  "complicaciones.otra": {
    "key": "complicaciones.otra",
    "term": "Otra complicación",
    "definitionMarkdown": "Cualquier otra complicación surgida durante la estadía en la UCI que no esté cubierta por los campos anteriores.\n\n---",
    "definitionHtml": "<p>Cualquier otra complicación surgida durante la estadía en la UCI que no esté cubierta por los campos anteriores.</p>\n<hr>"
  },
  "egreso.fecha_egreso_upc": {
    "key": "egreso.fecha_egreso_upc",
    "term": "Fecha de egreso de UPC",
    "definitionMarkdown": "Fecha de egreso de la Unidad de Paciente Crítico (DD/MM/AAAA).",
    "definitionHtml": "<p>Fecha de egreso de la Unidad de Paciente Crítico (DD/MM/AAAA).</p>"
  },
  "egreso.estado_vital": {
    "key": "egreso.estado_vital",
    "term": "Estado vital al egreso de UPC",
    "definitionMarkdown": "Condición del paciente al egreso de la UPC: vivo o fallecido.",
    "definitionHtml": "<p>Condición del paciente al egreso de la UPC: vivo o fallecido.</p>"
  },
  "egreso.destino": {
    "key": "egreso.destino",
    "term": "Destino de egreso de UPC",
    "definitionMarkdown": "Lugar al que se traslada el paciente al salir de la UPC (sala, otro centro, domicilio, etc.). Solo aplica si egresó vivo.",
    "definitionHtml": "<p>Lugar al que se traslada el paciente al salir de la UPC (sala, otro centro, domicilio, etc.). Solo aplica si egresó vivo.</p>"
  },
  "egreso.diagnostico": {
    "key": "egreso.diagnostico",
    "term": "Diagnóstico de egreso de UPC",
    "definitionMarkdown": "Diagnóstico principal al egreso de la UPC.",
    "definitionHtml": "<p>Diagnóstico principal al egreso de la UPC.</p>"
  },
  "egreso.reingreso_upc": {
    "key": "egreso.reingreso_upc",
    "term": "Reingreso a UPC durante la hospitalización",
    "definitionMarkdown": "Marca si el paciente reingresó a la UPC durante la misma hospitalización.\n* **Nota de desambiguación:** Por ahora solo se registra la primera estadía; menciona en comentarios si hay información relevante en otra estadía.\n\n---",
    "definitionHtml": "<p>Marca si el paciente reingresó a la UPC durante la misma hospitalización.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Por ahora solo se registra la primera estadía; menciona en comentarios si hay información relevante en otra estadía.</li>\n</ul>\n<hr>"
  },
  "calidad.global": {
    "key": "calidad.global",
    "term": "Calidad global de la epicrisis",
    "definitionMarkdown": "Juicio del anotador sobre qué tan completa y confiable venía la epicrisis para la extracción: confiable, parcial o deficiente.",
    "definitionHtml": "<p>Juicio del anotador sobre qué tan completa y confiable venía la epicrisis para la extracción: confiable, parcial o deficiente.</p>"
  },
  "calidad.comentario": {
    "key": "calidad.comentario",
    "term": "Comentario final (opcional)",
    "definitionMarkdown": "Comentario libre para describir con más detalle la calidad de la epicrisis o del proceso de anotación.",
    "definitionHtml": "<p>Comentario libre para describir con más detalle la calidad de la epicrisis o del proceso de anotación.</p>"
  }
};

export const GLOSARIO_ESTRUCTURA: GlosarioSection[] = [
  {
    "id": "1",
    "key": "hospitalizacion",
    "label": "Bloque 1. Datos de la hospitalización",
    "type": "mother",
    "children": [
      {
        "id": "1.1",
        "key": "hospitalizacion.fecha_ingreso",
        "label": "Fecha de ingreso al hospital",
        "type": "date",
        "definitionMarkdown": "Fecha de admisión al hospital (DD/MM/AAAA). Puede ser distinta de la fecha de ingreso a la UPC.",
        "definitionHtml": "<p>Fecha de admisión al hospital (DD/MM/AAAA). Puede ser distinta de la fecha de ingreso a la UPC.</p>"
      },
      {
        "id": "1.2",
        "key": "hospitalizacion.fecha_egreso",
        "label": "Fecha de egreso del hospital",
        "type": "date",
        "definitionMarkdown": "Fecha de alta hospitalaria (DD/MM/AAAA). Puede ser posterior a la fecha de egreso de la UPC.\n\n---",
        "definitionHtml": "<p>Fecha de alta hospitalaria (DD/MM/AAAA). Puede ser posterior a la fecha de egreso de la UPC.</p>\n<hr>"
      }
    ]
  },
  {
    "id": "2",
    "key": "antecedentes",
    "label": "Bloque 2. Antecedentes",
    "type": "mother",
    "children": [
      {
        "id": "2.1",
        "key": "antecedentes.medicos",
        "label": "Antecedentes médicos",
        "type": "mother",
        "children": [
          {
            "id": "2.1.1",
            "key": "antecedentes.cardiovascular",
            "label": "Cardiovascular",
            "type": "mother",
            "children": [
              {
                "id": "2.1.1.1",
                "key": "antecedentes.cardiovascular.hipertension_arterial",
                "label": "Hipertensión arterial",
                "type": "leaf",
                "definitionMarkdown": "Presión arterial crónicamente elevada (generalmente ≥ 140/90 mmHg o en tratamiento con antihipertensivos).",
                "definitionHtml": "<p>Presión arterial crónicamente elevada (generalmente ≥ 140/90 mmHg o en tratamiento con antihipertensivos).</p>"
              },
              {
                "id": "2.1.1.2",
                "key": "antecedentes.cardiovascular.enfermedad_coronaria",
                "label": "Enfermedad coronaria",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de cardiopatía isquémica: infarto, angina, revascularización (angioplastía/stent o bypass) o enfermedad coronaria conocida.",
                "definitionHtml": "<p>Antecedente de cardiopatía isquémica: infarto, angina, revascularización (angioplastía/stent o bypass) o enfermedad coronaria conocida.</p>"
              },
              {
                "id": "2.1.1.3",
                "key": "antecedentes.cardiovascular.accidente_cerebrovascular_previo",
                "label": "Accidente cerebrovascular previo",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de evento cerebrovascular isquémico o hemorrágico (ictus, derrame, ACV) antes del ingreso actual.\n* **Nota de desambiguación:** El evento cerebrovascular previo va en *Cardiovascular*, no en *Neurológico*.",
                "definitionHtml": "<p>Antecedente de evento cerebrovascular isquémico o hemorrágico (ictus, derrame, ACV) antes del ingreso actual.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El evento cerebrovascular previo va en <em>Cardiovascular</em>, no en <em>Neurológico</em>.</li>\n</ul>"
              },
              {
                "id": "2.1.1.4",
                "key": "antecedentes.cardiovascular.enfermedad_vascular_periferica",
                "label": "Enfermedad vascular periférica",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad arterial periférica (claudicación, isquemia arterial, revascularización de extremidades).",
                "definitionHtml": "<p>Enfermedad arterial periférica (claudicación, isquemia arterial, revascularización de extremidades).</p>"
              },
              {
                "id": "2.1.1.5",
                "key": "antecedentes.cardiovascular.arritmia_cronica",
                "label": "Arritmia crónica",
                "type": "leaf",
                "definitionMarkdown": "Arritmia previa conocida (fibrilación/flutter auricular, portador de marcapasos por arritmia, etc.).",
                "definitionHtml": "<p>Arritmia previa conocida (fibrilación/flutter auricular, portador de marcapasos por arritmia, etc.).</p>"
              },
              {
                "id": "2.1.1.6",
                "key": "antecedentes.cardiovascular.insuficiencia_cardiaca",
                "label": "Insuficiencia cardíaca",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de insuficiencia cardíaca (ICC, disfunción ventricular, FEVI reducida).",
                "definitionHtml": "<p>Antecedente de insuficiencia cardíaca (ICC, disfunción ventricular, FEVI reducida).</p>"
              },
              {
                "id": "2.1.1.7",
                "key": "antecedentes.cardiovascular.valvulopatia_significativa",
                "label": "Valvulopatía significativa",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad valvular relevante (estenosis o insuficiencia significativa, prótesis valvular).",
                "definitionHtml": "<p>Enfermedad valvular relevante (estenosis o insuficiencia significativa, prótesis valvular).</p>"
              },
              {
                "id": "2.1.1.8",
                "key": "antecedentes.cardiovascular.hipertension_pulmonar",
                "label": "Hipertensión pulmonar",
                "type": "leaf",
                "definitionMarkdown": "Hipertensión pulmonar (HTP) documentada.",
                "definitionHtml": "<p>Hipertensión pulmonar (HTP) documentada.</p>"
              },
              {
                "id": "2.1.1.9",
                "key": "antecedentes.cardiovascular.dispositivo_cardiaco",
                "label": "Dispositivo cardíaco (marcapasos, desfibrilador)",
                "type": "leaf",
                "definitionMarkdown": "Portador de dispositivo cardíaco implantable: marcapasos, desfibrilador automático implantable (DAI) o resincronizador.",
                "definitionHtml": "<p>Portador de dispositivo cardíaco implantable: marcapasos, desfibrilador automático implantable (DAI) o resincronizador.</p>"
              },
              {
                "id": "2.1.1.10",
                "key": "antecedentes.cardiovascular.otra_cardiovascular",
                "label": "Otra cardiovascular",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente cardiovascular relevante no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro antecedente cardiovascular relevante no cubierto por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.2",
            "key": "antecedentes.metabolico_endocrino",
            "label": "Metabólico / endocrino",
            "type": "mother",
            "children": [
              {
                "id": "2.1.2.1",
                "key": "antecedentes.metabolico_endocrino.diabetes_mellitus",
                "label": "Diabetes mellitus",
                "type": "leaf",
                "definitionMarkdown": "Diabetes mellitus conocida. Se especifica el subtipo (Tipo 1, Tipo 2 o No especificada) y si está Complicada o No complicada.",
                "definitionHtml": "<p>Diabetes mellitus conocida. Se especifica el subtipo (Tipo 1, Tipo 2 o No especificada) y si está Complicada o No complicada.</p>",
                "children": [
                  {
                    "id": "2.1.2.1.1",
                    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_1",
                    "label": "Tipo 1",
                    "type": "leaf",
                    "definitionMarkdown": "Diabetes mellitus tipo 1.",
                    "definitionHtml": "<p>Diabetes mellitus tipo 1.</p>"
                  },
                  {
                    "id": "2.1.2.1.2",
                    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.tipo_2",
                    "label": "Tipo 2",
                    "type": "leaf",
                    "definitionMarkdown": "Diabetes mellitus tipo 2.",
                    "definitionHtml": "<p>Diabetes mellitus tipo 2.</p>"
                  },
                  {
                    "id": "2.1.2.1.3",
                    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.no_especificada",
                    "label": "No especificada",
                    "type": "leaf",
                    "definitionMarkdown": "Diabetes mellitus sin subtipo especificado en el texto.",
                    "definitionHtml": "<p>Diabetes mellitus sin subtipo especificado en el texto.</p>"
                  },
                  {
                    "id": "2.1.2.1.4",
                    "key": "antecedentes.metabolico_endocrino.diabetes_mellitus.complicada",
                    "label": "Complicada",
                    "type": "leaf",
                    "definitionMarkdown": "La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.",
                    "definitionHtml": "<p>La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.</p>"
                  }
                ]
              },
              {
                "id": "2.1.2.2",
                "key": "antecedentes.metabolico_endocrino.obesidad",
                "label": "Obesidad",
                "type": "leaf",
                "definitionMarkdown": "Obesidad documentada (diagnóstico, IMC elevado o mención explícita).",
                "definitionHtml": "<p>Obesidad documentada (diagnóstico, IMC elevado o mención explícita).</p>"
              },
              {
                "id": "2.1.2.3",
                "key": "antecedentes.metabolico_endocrino.dislipidemia",
                "label": "Dislipidemia",
                "type": "leaf",
                "definitionMarkdown": "Alteración de lípidos (hipercolesterolemia, hipertrigliceridemia) o en tratamiento hipolipemiante.",
                "definitionHtml": "<p>Alteración de lípidos (hipercolesterolemia, hipertrigliceridemia) o en tratamiento hipolipemiante.</p>"
              },
              {
                "id": "2.1.2.4",
                "key": "antecedentes.metabolico_endocrino.hipotiroidismo",
                "label": "Hipotiroidismo",
                "type": "leaf",
                "definitionMarkdown": "Hipotiroidismo conocido o en tratamiento con levotiroxina.",
                "definitionHtml": "<p>Hipotiroidismo conocido o en tratamiento con levotiroxina.</p>"
              },
              {
                "id": "2.1.2.5",
                "key": "antecedentes.metabolico_endocrino.otra_metabolica_endocrina",
                "label": "Otra metabólica o endocrina",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente metabólico o endocrino relevante no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro antecedente metabólico o endocrino relevante no cubierto por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.3",
            "key": "antecedentes.renal",
            "label": "Renal",
            "type": "mother",
            "children": [
              {
                "id": "2.1.3.1",
                "key": "antecedentes.renal.enfermedad_renal_cronica",
                "label": "Enfermedad renal crónica",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad renal crónica (ERC) conocida, con deterioro estable de la función renal.\n* **Nota de desambiguación:** No confundir con la falla renal *aguda* de la estadía, que va en *Falla orgánica*.",
                "definitionHtml": "<p>Enfermedad renal crónica (ERC) conocida, con deterioro estable de la función renal.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No confundir con la falla renal <em>aguda</em> de la estadía, que va en <em>Falla orgánica</em>.</li>\n</ul>"
              },
              {
                "id": "2.1.3.2",
                "key": "antecedentes.renal.terapia_dialitica_cronica",
                "label": "Terapia dialítica crónica",
                "type": "leaf",
                "definitionMarkdown": "Paciente en diálisis crónica (hemodiálisis o peritoneal) previa al ingreso.",
                "definitionHtml": "<p>Paciente en diálisis crónica (hemodiálisis o peritoneal) previa al ingreso.</p>"
              },
              {
                "id": "2.1.3.3",
                "key": "antecedentes.renal.trasplante_renal_previo",
                "label": "Trasplante renal previo",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de trasplante renal.",
                "definitionHtml": "<p>Antecedente de trasplante renal.</p>"
              },
              {
                "id": "2.1.3.4",
                "key": "antecedentes.renal.otra_renal",
                "label": "Otra renal",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente renal relevante no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro antecedente renal relevante no cubierto por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.4",
            "key": "antecedentes.pulmonar",
            "label": "Pulmonar",
            "type": "mother",
            "children": [
              {
                "id": "2.1.4.1",
                "key": "antecedentes.pulmonar.epoc",
                "label": "Enfermedad pulmonar obstructiva crónica (EPOC)",
                "type": "leaf",
                "definitionMarkdown": "EPOC conocida.",
                "definitionHtml": "<p>EPOC conocida.</p>"
              },
              {
                "id": "2.1.4.2",
                "key": "antecedentes.pulmonar.asma",
                "label": "Asma",
                "type": "leaf",
                "definitionMarkdown": "Asma bronquial conocida.",
                "definitionHtml": "<p>Asma bronquial conocida.</p>"
              },
              {
                "id": "2.1.4.3",
                "key": "antecedentes.pulmonar.enfermedad_pulmonar_intersticial_difusa",
                "label": "Enfermedad pulmonar intersticial difusa",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad pulmonar intersticial difusa (fibrosis pulmonar, EPID).",
                "definitionHtml": "<p>Enfermedad pulmonar intersticial difusa (fibrosis pulmonar, EPID).</p>"
              },
              {
                "id": "2.1.4.4",
                "key": "antecedentes.pulmonar.sindrome_apnea_hipopnea_obstructiva",
                "label": "Síndrome de apnea-hipopnea obstructiva del sueño",
                "type": "leaf",
                "definitionMarkdown": "SAHOS conocido, con o sin uso de CPAP.",
                "definitionHtml": "<p>SAHOS conocido, con o sin uso de CPAP.</p>"
              },
              {
                "id": "2.1.4.5",
                "key": "antecedentes.pulmonar.oxigeno_domiciliario",
                "label": "Oxígeno domiciliario",
                "type": "leaf",
                "definitionMarkdown": "Uso crónico de oxígeno domiciliario previo al ingreso.",
                "definitionHtml": "<p>Uso crónico de oxígeno domiciliario previo al ingreso.</p>"
              },
              {
                "id": "2.1.4.6",
                "key": "antecedentes.pulmonar.otra_respiratoria",
                "label": "Otra respiratoria",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente respiratorio relevante (incluye bronquiectasias).",
                "definitionHtml": "<p>Otro antecedente respiratorio relevante (incluye bronquiectasias).</p>"
              }
            ]
          },
          {
            "id": "2.1.5",
            "key": "antecedentes.hepatico_digestivo",
            "label": "Hepático / digestivo",
            "type": "mother",
            "children": [
              {
                "id": "2.1.5.1",
                "key": "antecedentes.hepatico_digestivo.cirrosis",
                "label": "Daño hepático crónico o cirrosis",
                "type": "leaf",
                "definitionMarkdown": "Daño hepático crónico diagnosticado o sospecha clínica altamente probable (cirrosis, daño hepático por alcohol, etc.). Se especifica si está Complicada o No complicada.",
                "definitionHtml": "<p>Daño hepático crónico diagnosticado o sospecha clínica altamente probable (cirrosis, daño hepático por alcohol, etc.). Se especifica si está Complicada o No complicada.</p>",
                "children": [
                  {
                    "id": "2.1.5.1.1",
                    "key": "antecedentes.hepatico_digestivo.cirrosis.complicada",
                    "label": "Complicada",
                    "type": "leaf",
                    "definitionMarkdown": "La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.",
                    "definitionHtml": "<p>La condición de base tiene complicaciones documentadas (p. ej. diabetes con nefropatía, retinopatía o cetoacidosis; daño hepático descompensado). Si no hay complicaciones, se marca como No complicada.</p>"
                  }
                ]
              },
              {
                "id": "2.1.5.2",
                "key": "antecedentes.hepatico_digestivo.trasplante_hepatico",
                "label": "Trasplante hepático",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de trasplante hepático.",
                "definitionHtml": "<p>Antecedente de trasplante hepático.</p>"
              },
              {
                "id": "2.1.5.3",
                "key": "antecedentes.hepatico_digestivo.enfermedad_inflamatoria_intestinal",
                "label": "Enfermedad inflamatoria intestinal",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad inflamatoria intestinal (colitis ulcerosa, enfermedad de Crohn).",
                "definitionHtml": "<p>Enfermedad inflamatoria intestinal (colitis ulcerosa, enfermedad de Crohn).</p>"
              },
              {
                "id": "2.1.5.4",
                "key": "antecedentes.hepatico_digestivo.otra_hepatica_digestiva",
                "label": "Otra hepática o digestiva",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente hepático o digestivo relevante no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro antecedente hepático o digestivo relevante no cubierto por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.6",
            "key": "antecedentes.oncologico_hematologico",
            "label": "Oncológico / hematológico",
            "type": "mother",
            "children": [
              {
                "id": "2.1.6.1",
                "key": "antecedentes.oncologico_hematologico.neoplasia_solida_activa",
                "label": "Neoplasia sólida activa",
                "type": "leaf",
                "definitionMarkdown": "Cáncer de órgano sólido en actividad o en tratamiento oncológico activo.",
                "definitionHtml": "<p>Cáncer de órgano sólido en actividad o en tratamiento oncológico activo.</p>"
              },
              {
                "id": "2.1.6.2",
                "key": "antecedentes.oncologico_hematologico.neoplasia_hematologica_activa",
                "label": "Neoplasia hematológica activa",
                "type": "leaf",
                "definitionMarkdown": "Neoplasia hematológica en actividad (leucemia, linfoma, mieloma) o en tratamiento activo.",
                "definitionHtml": "<p>Neoplasia hematológica en actividad (leucemia, linfoma, mieloma) o en tratamiento activo.</p>"
              },
              {
                "id": "2.1.6.3",
                "key": "antecedentes.oncologico_hematologico.trasplante_progenitores_previo",
                "label": "Trasplante de progenitores hematopoyéticos previo",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de trasplante de médula ósea / progenitores hematopoyéticos.",
                "definitionHtml": "<p>Antecedente de trasplante de médula ósea / progenitores hematopoyéticos.</p>"
              },
              {
                "id": "2.1.6.4",
                "key": "antecedentes.oncologico_hematologico.enfermedad_tromboembolica",
                "label": "Enfermedad tromboembólica previa o actual",
                "type": "leaf",
                "definitionMarkdown": "Antecedente o presencia de enfermedad tromboembólica (TVP, TEP).",
                "definitionHtml": "<p>Antecedente o presencia de enfermedad tromboembólica (TVP, TEP).</p>"
              },
              {
                "id": "2.1.6.5",
                "key": "antecedentes.oncologico_hematologico.otra_oncologica_hematologica",
                "label": "Otra oncológica o hematológica",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente oncológico o hematológico relevante (incluye neoplasia previa sin actividad).",
                "definitionHtml": "<p>Otro antecedente oncológico o hematológico relevante (incluye neoplasia previa sin actividad).</p>"
              }
            ]
          },
          {
            "id": "2.1.7",
            "key": "antecedentes.inmunologico_reumatologico",
            "label": "Inmunológico / reumatológico",
            "type": "mother",
            "children": [
              {
                "id": "2.1.7.1",
                "key": "antecedentes.inmunologico_reumatologico.autoinmune_tratamiento",
                "label": "Enfermedad autoinmune en tratamiento",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad autoinmune o reumatológica en tratamiento activo (inmunosupresor o inmunomodulador).",
                "definitionHtml": "<p>Enfermedad autoinmune o reumatológica en tratamiento activo (inmunosupresor o inmunomodulador).</p>"
              },
              {
                "id": "2.1.7.2",
                "key": "antecedentes.inmunologico_reumatologico.trasplante_organo_solido_otro",
                "label": "Trasplante de órgano sólido distinto del renal y hepático",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de trasplante de órgano sólido distinto de riñón e hígado (corazón, pulmón, páncreas).",
                "definitionHtml": "<p>Antecedente de trasplante de órgano sólido distinto de riñón e hígado (corazón, pulmón, páncreas).</p>"
              },
              {
                "id": "2.1.7.3",
                "key": "antecedentes.inmunologico_reumatologico.inmunosupresion_cronica",
                "label": "Inmunosupresión crónica no relacionada a infección ni a trasplante",
                "type": "leaf",
                "definitionMarkdown": "Estado de inmunosupresión crónica no asociado a infección ni a trasplante (corticoterapia prolongada, biológicos, etc.).",
                "definitionHtml": "<p>Estado de inmunosupresión crónica no asociado a infección ni a trasplante (corticoterapia prolongada, biológicos, etc.).</p>"
              },
              {
                "id": "2.1.7.4",
                "key": "antecedentes.inmunologico_reumatologico.otra_inmunologica_reumatologica",
                "label": "Otra inmunológica o reumatológica",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente inmunológico o reumatológico relevante no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro antecedente inmunológico o reumatológico relevante no cubierto por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.8",
            "key": "antecedentes.infeccioso",
            "label": "Infeccioso",
            "type": "mother",
            "children": [
              {
                "id": "2.1.8.1",
                "key": "antecedentes.infeccioso.vih",
                "label": "VIH",
                "type": "leaf",
                "definitionMarkdown": "Infección por VIH conocida.",
                "definitionHtml": "<p>Infección por VIH conocida.</p>"
              },
              {
                "id": "2.1.8.2",
                "key": "antecedentes.infeccioso.tuberculosis",
                "label": "Tuberculosis",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de tuberculosis. Se especifica si está Activa.",
                "definitionHtml": "<p>Antecedente de tuberculosis. Se especifica si está Activa.</p>",
                "children": [
                  {
                    "id": "2.1.8.2.1",
                    "key": "antecedentes.infeccioso.tuberculosis.activa",
                    "label": "Activa",
                    "type": "leaf",
                    "definitionMarkdown": "La condición infecciosa está en actividad durante la estadía (p. ej. tuberculosis activa), no solo como antecedente.",
                    "definitionHtml": "<p>La condición infecciosa está en actividad durante la estadía (p. ej. tuberculosis activa), no solo como antecedente.</p>"
                  }
                ]
              },
              {
                "id": "2.1.8.3",
                "key": "antecedentes.infeccioso.hepatitis_viral_cronica",
                "label": "Hepatitis viral crónica, B o C",
                "type": "leaf",
                "definitionMarkdown": "Hepatitis viral crónica B o C conocida.",
                "definitionHtml": "<p>Hepatitis viral crónica B o C conocida.</p>"
              },
              {
                "id": "2.1.8.4",
                "key": "antecedentes.infeccioso.otra_infeccion_cronica",
                "label": "Otra infección crónica relevante",
                "type": "leaf",
                "definitionMarkdown": "Otra infección crónica relevante no cubierta por los campos anteriores.",
                "definitionHtml": "<p>Otra infección crónica relevante no cubierta por los campos anteriores.</p>"
              }
            ]
          },
          {
            "id": "2.1.9",
            "key": "antecedentes.neurologico",
            "label": "Neurológico",
            "type": "mother",
            "children": [
              {
                "id": "2.1.9.1",
                "key": "antecedentes.neurologico.demencia",
                "label": "Demencia o deterioro cognitivo mayor",
                "type": "leaf",
                "definitionMarkdown": "Demencia o deterioro cognitivo mayor previo al ingreso.",
                "definitionHtml": "<p>Demencia o deterioro cognitivo mayor previo al ingreso.</p>"
              },
              {
                "id": "2.1.9.2",
                "key": "antecedentes.neurologico.epilepsia",
                "label": "Epilepsia",
                "type": "leaf",
                "definitionMarkdown": "Epilepsia o trastorno convulsivo crónico conocido.",
                "definitionHtml": "<p>Epilepsia o trastorno convulsivo crónico conocido.</p>"
              },
              {
                "id": "2.1.9.3",
                "key": "antecedentes.neurologico.parkinson",
                "label": "Parkinson o parkinsonismo",
                "type": "leaf",
                "definitionMarkdown": "Enfermedad de Parkinson o síndrome parkinsoniano.",
                "definitionHtml": "<p>Enfermedad de Parkinson o síndrome parkinsoniano.</p>"
              },
              {
                "id": "2.1.9.4",
                "key": "antecedentes.neurologico.secuela_neurologica",
                "label": "Secuela neurológica crónica",
                "type": "leaf",
                "definitionMarkdown": "Secuela neurológica establecida (hemiparesia, secuela de ACV, etc.).",
                "definitionHtml": "<p>Secuela neurológica establecida (hemiparesia, secuela de ACV, etc.).</p>"
              },
              {
                "id": "2.1.9.5",
                "key": "antecedentes.neurologico.otra_neurologica",
                "label": "Otra neurológica",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente neurológico relevante no cubierto por los campos anteriores.\n* **Nota de desambiguación:** El evento cerebrovascular previo va en *Cardiovascular*, no aquí.",
                "definitionHtml": "<p>Otro antecedente neurológico relevante no cubierto por los campos anteriores.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El evento cerebrovascular previo va en <em>Cardiovascular</em>, no aquí.</li>\n</ul>"
              }
            ]
          },
          {
            "id": "2.1.10",
            "key": "antecedentes.psiquiatrico",
            "label": "Psiquiátrico",
            "type": "mother",
            "children": [
              {
                "id": "2.1.10.1",
                "key": "antecedentes.psiquiatrico.depresion",
                "label": "Trastorno depresivo",
                "type": "leaf",
                "definitionMarkdown": "Diagnóstico previo de depresión o distimia, o tratamiento antidepresivo en curso.\n* **Nota de desambiguación:** Un ánimo bajo mencionado al pasar, sin diagnóstico ni tratamiento, se marca `[?]`, no `[Sí]`.",
                "definitionHtml": "<p>Diagnóstico previo de depresión o distimia, o tratamiento antidepresivo en curso.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Un ánimo bajo mencionado al pasar, sin diagnóstico ni tratamiento, se marca <code>[?]</code>, no <code>[Sí]</code>.</li>\n</ul>"
              },
              {
                "id": "2.1.10.2",
                "key": "antecedentes.psiquiatrico.ansiedad",
                "label": "Trastorno de ansiedad",
                "type": "leaf",
                "definitionMarkdown": "Trastorno ansioso diagnosticado (ansiedad generalizada, crisis de pánico, fobias) o en tratamiento ansiolítico.",
                "definitionHtml": "<p>Trastorno ansioso diagnosticado (ansiedad generalizada, crisis de pánico, fobias) o en tratamiento ansiolítico.</p>"
              },
              {
                "id": "2.1.10.3",
                "key": "antecedentes.psiquiatrico.trastorno_bipolar",
                "label": "Trastorno bipolar",
                "type": "leaf",
                "definitionMarkdown": "Trastorno afectivo bipolar diagnosticado, o tratamiento con estabilizadores del ánimo (litio, ácido valproico) por esa indicación.",
                "definitionHtml": "<p>Trastorno afectivo bipolar diagnosticado, o tratamiento con estabilizadores del ánimo (litio, ácido valproico) por esa indicación.</p>"
              },
              {
                "id": "2.1.10.4",
                "key": "antecedentes.psiquiatrico.esquizofrenia_otro_psicotico",
                "label": "Esquizofrenia u otro trastorno psicótico",
                "type": "leaf",
                "definitionMarkdown": "Esquizofrenia, trastorno esquizoafectivo, trastorno delirante u otra psicosis crónica diagnosticada, o tratamiento antipsicótico por esa indicación.\n* **Nota de desambiguación:** Un episodio psicótico atribuido a sustancias va también en *Trastorno por consumo de sustancias*.",
                "definitionHtml": "<p>Esquizofrenia, trastorno esquizoafectivo, trastorno delirante u otra psicosis crónica diagnosticada, o tratamiento antipsicótico por esa indicación.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Un episodio psicótico atribuido a sustancias va también en <em>Trastorno por consumo de sustancias</em>.</li>\n</ul>"
              },
              {
                "id": "2.1.10.5",
                "key": "antecedentes.psiquiatrico.trastorno_consumo_sustancias",
                "label": "Trastorno por consumo de sustancias",
                "type": "leaf",
                "definitionMarkdown": "Dependencia o abuso de sustancias documentado: alcohol, drogas ilícitas o fármacos. Incluye antecedente de síndrome de abstinencia y tratamiento de deshabituación.\n* **Nota de desambiguación:** El consumo como hábito va en *Hábitos* (Tabaquismo, Alcohol, Otras sustancias). Aquí se marca solo cuando hay trastorno documentado: dependencia, abstinencia previa, tratamiento de deshabituación o diagnóstico explícito. Un mismo paciente puede tener ambas marcadas.",
                "definitionHtml": "<p>Dependencia o abuso de sustancias documentado: alcohol, drogas ilícitas o fármacos. Incluye antecedente de síndrome de abstinencia y tratamiento de deshabituación.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El consumo como hábito va en <em>Hábitos</em> (Tabaquismo, Alcohol, Otras sustancias). Aquí se marca solo cuando hay trastorno documentado: dependencia, abstinencia previa, tratamiento de deshabituación o diagnóstico explícito. Un mismo paciente puede tener ambas marcadas.</li>\n</ul>"
              },
              {
                "id": "2.1.10.6",
                "key": "antecedentes.psiquiatrico.intento_suicidio_previo",
                "label": "Intento de suicidio o autolesión previa",
                "type": "leaf",
                "definitionMarkdown": "Antecedente de intento de suicidio, autoagresión o intoxicación voluntaria.\n* **Nota de desambiguación:** Se marca también cuando el intento es la causa del ingreso actual; la evidencia capturada debe dejar claro si es previo o corresponde a esta hospitalización.",
                "definitionHtml": "<p>Antecedente de intento de suicidio, autoagresión o intoxicación voluntaria.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Se marca también cuando el intento es la causa del ingreso actual; la evidencia capturada debe dejar claro si es previo o corresponde a esta hospitalización.</li>\n</ul>"
              },
              {
                "id": "2.1.10.7",
                "key": "antecedentes.psiquiatrico.trastorno_personalidad",
                "label": "Trastorno de personalidad",
                "type": "leaf",
                "definitionMarkdown": "Trastorno de personalidad diagnosticado (limítrofe, antisocial u otro).",
                "definitionHtml": "<p>Trastorno de personalidad diagnosticado (limítrofe, antisocial u otro).</p>"
              },
              {
                "id": "2.1.10.8",
                "key": "antecedentes.psiquiatrico.uso_cronico_psicofarmacos",
                "label": "Uso crónico de psicofármacos",
                "type": "leaf",
                "definitionMarkdown": "Uso habitual y mantenido de psicofármacos antes del ingreso: benzodiazepinas, antipsicóticos, antidepresivos, estabilizadores del ánimo. Es relevante por el riesgo de abstinencia al suspenderlos en la unidad.\n* **Nota de desambiguación:** Es una exposición, no un diagnóstico. Se marca aunque no haya un trastorno psiquiátrico consignado.",
                "definitionHtml": "<p>Uso habitual y mantenido de psicofármacos antes del ingreso: benzodiazepinas, antipsicóticos, antidepresivos, estabilizadores del ánimo. Es relevante por el riesgo de abstinencia al suspenderlos en la unidad.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Es una exposición, no un diagnóstico. Se marca aunque no haya un trastorno psiquiátrico consignado.</li>\n</ul>"
              },
              {
                "id": "2.1.10.9",
                "key": "antecedentes.psiquiatrico.otra_psiquiatrica",
                "label": "Otra psiquiátrica",
                "type": "leaf",
                "definitionMarkdown": "Otro antecedente psiquiátrico relevante no cubierto por los campos anteriores (trastorno de conducta alimentaria, discapacidad intelectual, insomnio crónico, etc.).\n* **Nota de desambiguación:** La demencia y el deterioro cognitivo mayor van en *Neurológico*. El delirium del episodio actual no es antecedente y no se anota en este bloque.",
                "definitionHtml": "<p>Otro antecedente psiquiátrico relevante no cubierto por los campos anteriores (trastorno de conducta alimentaria, discapacidad intelectual, insomnio crónico, etc.).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La demencia y el deterioro cognitivo mayor van en <em>Neurológico</em>. El delirium del episodio actual no es antecedente y no se anota en este bloque.</li>\n</ul>"
              }
            ]
          },
          {
            "id": "2.1.11",
            "key": "antecedentes.otro_antecedente_medico",
            "label": "Otro antecedente médico",
            "type": "leaf",
            "definitionMarkdown": "Cualquier antecedente relevante que no encaje en las categorías anteriores.",
            "definitionHtml": "<p>Cualquier antecedente relevante que no encaje en las categorías anteriores.</p>"
          }
        ]
      },
      {
        "id": "2.2",
        "key": "antecedentes.quirurgicos",
        "label": "Antecedentes quirúrgicos",
        "type": "leaf",
        "definitionMarkdown": "Cirugías previas relevantes documentadas.\n\nEjemplos acordados con el equipo clínico: una cesárea cuenta como antecedente quirúrgico; un parto normal no cuenta como antecedente quirúrgico. Estos ejemplos no reemplazan la definición operativa completa, que el equipo aún debe precisar.",
        "definitionHtml": "<p>Cirugías previas relevantes documentadas.</p>\n<p>Ejemplos acordados con el equipo clínico: una cesárea cuenta como antecedente quirúrgico; un parto normal no cuenta como antecedente quirúrgico. Estos ejemplos no reemplazan la definición operativa completa, que el equipo aún debe precisar.</p>"
      },
      {
        "id": "2.3",
        "key": "antecedentes.alergias",
        "label": "Alergias",
        "type": "leaf",
        "definitionMarkdown": "Alergias documentadas (medicamentos u otras).",
        "definitionHtml": "<p>Alergias documentadas (medicamentos u otras).</p>"
      },
      {
        "id": "2.4",
        "key": "antecedentes.habitos",
        "label": "Hábitos",
        "type": "mother",
        "children": [
          {
            "id": "2.4.1",
            "key": "antecedentes.habitos.tabaquismo",
            "label": "Tabaquismo",
            "type": "leaf",
            "definitionMarkdown": "Consumo de tabaco documentado (activo o pasado). Se registra la carga tabáquica si está cuantificada.",
            "definitionHtml": "<p>Consumo de tabaco documentado (activo o pasado). Se registra la carga tabáquica si está cuantificada.</p>",
            "children": [
              {
                "id": "2.4.1.1",
                "key": "antecedentes.habitos.tabaquismo.carga",
                "label": "Carga tabáquica (Cigarrillos al día / Años de consumo)",
                "type": "leaf",
                "definitionMarkdown": "Cuantificación del consumo de tabaco (p. ej. cigarrillos/día, años de consumo o paquetes-año), cuando el texto la documenta.",
                "definitionHtml": "<p>Cuantificación del consumo de tabaco (p. ej. cigarrillos/día, años de consumo o paquetes-año), cuando el texto la documenta.</p>"
              }
            ]
          },
          {
            "id": "2.4.2",
            "key": "antecedentes.habitos.alcohol",
            "label": "Alcohol",
            "type": "leaf",
            "definitionMarkdown": "Consumo de alcohol documentado. Se registra la carga alcohólica si está cuantificada.",
            "definitionHtml": "<p>Consumo de alcohol documentado. Se registra la carga alcohólica si está cuantificada.</p>",
            "children": [
              {
                "id": "2.4.2.1",
                "key": "antecedentes.habitos.alcohol.carga",
                "label": "Carga alcohólica",
                "type": "leaf",
                "definitionMarkdown": "Cuantificación del consumo de alcohol, cuando el texto la documenta.",
                "definitionHtml": "<p>Cuantificación del consumo de alcohol, cuando el texto la documenta.</p>"
              }
            ]
          },
          {
            "id": "2.4.3",
            "key": "antecedentes.habitos.otras_sustancias",
            "label": "Otras sustancias",
            "type": "leaf",
            "definitionMarkdown": "Consumo de otras sustancias (drogas ilícitas u otras) documentado.",
            "definitionHtml": "<p>Consumo de otras sustancias (drogas ilícitas u otras) documentado.</p>"
          }
        ]
      },
      {
        "id": "2.5",
        "key": "antecedentes.dependencia_funcional",
        "label": "Dependencia funcional",
        "type": "leaf",
        "definitionMarkdown": "Dependencia funcional previa al ingreso (para actividades de la vida diaria).\n\n---",
        "definitionHtml": "<p>Dependencia funcional previa al ingreso (para actividades de la vida diaria).</p>\n<hr>"
      }
    ]
  },
  {
    "id": "3",
    "key": "ingreso",
    "label": "Bloque 3. Ingreso",
    "type": "mother",
    "children": [
      {
        "id": "3.1",
        "key": "ingreso.fecha_ingreso_upc",
        "label": "Fecha de ingreso a UPC",
        "type": "date",
        "definitionMarkdown": "Fecha de ingreso a la Unidad de Paciente Crítico (DD/MM/AAAA).",
        "definitionHtml": "<p>Fecha de ingreso a la Unidad de Paciente Crítico (DD/MM/AAAA).</p>"
      },
      {
        "id": "3.2",
        "key": "ingreso.unidad_origen",
        "label": "Unidad de origen",
        "type": "select",
        "definitionMarkdown": "Lugar desde donde ingresa el paciente a la UPC (urgencias, sala, pabellón, otro centro, etc.).",
        "definitionHtml": "<p>Lugar desde donde ingresa el paciente a la UPC (urgencias, sala, pabellón, otro centro, etc.).</p>"
      },
      {
        "id": "3.3",
        "key": "ingreso.diagnostico",
        "label": "Diagnóstico de ingreso",
        "type": "mother",
        "children": [
          {
            "id": "3.3.1",
            "key": "ingreso.diagnostico.principal",
            "label": "Diagnóstico principal",
            "type": "text",
            "definitionMarkdown": "Diagnóstico que motivó el ingreso a la UPC.\n* **Nota de desambiguación:** No repitas aquí las enfermedades de base, salvo que hayan llegado descompensadas.",
            "definitionHtml": "<p>Diagnóstico que motivó el ingreso a la UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No repitas aquí las enfermedades de base, salvo que hayan llegado descompensadas.</li>\n</ul>"
          },
          {
            "id": "3.3.2",
            "key": "ingreso.diagnostico.otros",
            "label": "Otros diagnósticos de ingreso",
            "type": "text",
            "definitionMarkdown": "Diagnósticos secundarios presentes al ingreso, distintos del principal.\n\n---",
            "definitionHtml": "<p>Diagnósticos secundarios presentes al ingreso, distintos del principal.</p>\n<hr>"
          }
        ]
      }
    ]
  },
  {
    "id": "4",
    "key": "soporte",
    "label": "Bloque 4. Soporte / intervenciones",
    "type": "mother",
    "children": [
      {
        "id": "4.1",
        "key": "soporte.reanimacion",
        "label": "Reanimación cardiopulmonar",
        "type": "leaf",
        "definitionMarkdown": "Maniobras de reanimación cardiopulmonar (RCP) por paro cardiorrespiratorio durante la estadía.",
        "definitionHtml": "<p>Maniobras de reanimación cardiopulmonar (RCP) por paro cardiorrespiratorio durante la estadía.</p>",
        "children": [
          {
            "id": "4.1.1",
            "key": "soporte.reanimacion.fecha_disponible",
            "label": "Fecha disponible",
            "type": "leaf",
            "definitionMarkdown": "Marca si en el texto hay una fecha explícita disponible para este ítem.\n\n---",
            "definitionHtml": "<p>Marca si en el texto hay una fecha explícita disponible para este ítem.</p>\n<hr>"
          },
          {
            "id": "4.1.2",
            "key": "soporte.reanimacion.ritmo_inicial",
            "label": "Ritmo inicial (Desfibrilable/No desfibrilable)",
            "type": "select",
            "definitionMarkdown": "Ritmo al inicio del paro: desfibrilable (fibrilación ventricular / taquicardia ventricular sin pulso) o no desfibrilable (asistolia / actividad eléctrica sin pulso).",
            "definitionHtml": "<p>Ritmo al inicio del paro: desfibrilable (fibrilación ventricular / taquicardia ventricular sin pulso) o no desfibrilable (asistolia / actividad eléctrica sin pulso).</p>"
          },
          {
            "id": "4.1.3",
            "key": "soporte.reanimacion.causa_paro",
            "label": "Causa del paro",
            "type": "text",
            "definitionMarkdown": "Causa documentada del paro cardiorrespiratorio.",
            "definitionHtml": "<p>Causa documentada del paro cardiorrespiratorio.</p>"
          },
          {
            "id": "4.1.4",
            "key": "soporte.reanimacion.duracion_ciclos",
            "label": "Duración o número de ciclos",
            "type": "text",
            "definitionMarkdown": "Duración del soporte o número de ciclos, cuando el texto lo especifica.",
            "definitionHtml": "<p>Duración del soporte o número de ciclos, cuando el texto lo especifica.</p>"
          },
          {
            "id": "4.1.5",
            "key": "soporte.reanimacion.requirio_desfibrilacion",
            "label": "Requirió desfibrilación",
            "type": "leaf",
            "definitionMarkdown": "Marca si se aplicó desfibrilación durante la reanimación.",
            "definitionHtml": "<p>Marca si se aplicó desfibrilación durante la reanimación.</p>"
          },
          {
            "id": "4.1.7",
            "key": "soporte.reanimacion.retorno_circulacion",
            "label": "Retorno a circulación espontánea (ROSC)",
            "type": "leaf",
            "definitionMarkdown": "Marca si el paciente recuperó circulación espontánea tras la reanimación.",
            "definitionHtml": "<p>Marca si el paciente recuperó circulación espontánea tras la reanimación.</p>"
          }
        ]
      },
      {
        "id": "4.2",
        "key": "soporte.hemodinamico",
        "label": "Hemodinámico",
        "type": "leaf",
        "definitionMarkdown": "Bloque de soportes hemodinámicos utilizados durante la estadía.",
        "definitionHtml": "<p>Bloque de soportes hemodinámicos utilizados durante la estadía.</p>",
        "children": [
          {
            "id": "4.2.1",
            "key": "soporte.hemodinamico.drogas_vasoactivas",
            "label": "Drogas vasoactivas",
            "type": "leaf",
            "definitionMarkdown": "Uso de vasopresores (noradrenalina, adrenalina, vasopresina, entre otros).\n* **Nota de desambiguación:** Su uso en dosis baja secundario a hipotensión por sedoanalgesia **no** equivale a shock ni a falla hemodinámica.",
            "definitionHtml": "<p>Uso de vasopresores (noradrenalina, adrenalina, vasopresina, entre otros).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Su uso en dosis baja secundario a hipotensión por sedoanalgesia <strong>no</strong> equivale a shock ni a falla hemodinámica.</li>\n</ul>"
          },
          {
            "id": "4.2.2",
            "key": "soporte.hemodinamico.inotropicos",
            "label": "Inotrópicos",
            "type": "leaf",
            "definitionMarkdown": "Uso de drogas inotrópicas (dobutamina, milrinona, levosimendán).",
            "definitionHtml": "<p>Uso de drogas inotrópicas (dobutamina, milrinona, levosimendán).</p>"
          },
          {
            "id": "4.2.3",
            "key": "soporte.hemodinamico.corticoides_shock",
            "label": "Corticoides en dosis de estrés o por shock refractario",
            "type": "leaf",
            "definitionMarkdown": "Uso de corticoides (hidrocortisona) por shock refractario o en dosis de estrés.\n* **Nota de desambiguación:** Marcar solo cuando el texto indique explícitamente su uso por shock refractario o dosis de estrés, no por otra causa.",
            "definitionHtml": "<p>Uso de corticoides (hidrocortisona) por shock refractario o en dosis de estrés.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Marcar solo cuando el texto indique explícitamente su uso por shock refractario o dosis de estrés, no por otra causa.</li>\n</ul>"
          },
          {
            "id": "4.2.4",
            "key": "soporte.hemodinamico.soporte_circulatorio_mecanico",
            "label": "Dispositivo de soporte circulatorio mecánico",
            "type": "leaf",
            "definitionMarkdown": "Soporte circulatorio mecánico (balón de contrapulsación aórtica, entre otros).\n* **Nota de desambiguación:** La ECMO veno-arterial no se registra aquí, sino en *Circulación extracorpórea*.",
            "definitionHtml": "<p>Soporte circulatorio mecánico (balón de contrapulsación aórtica, entre otros).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La ECMO veno-arterial no se registra aquí, sino en <em>Circulación extracorpórea</em>.</li>\n</ul>"
          },
          {
            "id": "4.2.5",
            "key": "soporte.hemodinamico.otro",
            "label": "Otro soporte hemodinámico",
            "type": "leaf",
            "definitionMarkdown": "Otro soporte hemodinámico no cubierto (p. ej. azul de metileno).",
            "definitionHtml": "<p>Otro soporte hemodinámico no cubierto (p. ej. azul de metileno).</p>"
          }
        ]
      },
      {
        "id": "4.3",
        "key": "soporte.respiratorio",
        "label": "Respiratorio",
        "type": "leaf",
        "definitionMarkdown": "Foco infeccioso respiratorio (neumonía, traqueobronquitis).",
        "definitionHtml": "<p>Foco infeccioso respiratorio (neumonía, traqueobronquitis).</p>",
        "children": [
          {
            "id": "4.3.1",
            "key": "soporte.respiratorio.vmni",
            "label": "Ventilación mecánica no invasiva o nivel de soporte menor",
            "type": "leaf",
            "definitionMarkdown": "Ventilación no invasiva (VMNI), cánula nasal de alto flujo u oxigenoterapia convencional relevante.",
            "definitionHtml": "<p>Ventilación no invasiva (VMNI), cánula nasal de alto flujo u oxigenoterapia convencional relevante.</p>"
          },
          {
            "id": "4.3.2",
            "key": "soporte.respiratorio.vmi",
            "label": "Ventilación mecánica invasiva",
            "type": "leaf",
            "definitionMarkdown": "Soporte ventilatorio mediante tubo endotraqueal (TET) o traqueostomía conectado a ventilador mecánico; la extubación también evidencia un episodio previo.\n* **Nota de desambiguación:** La ECMO veno-venosa no se registra aquí, sino en *Circulación extracorpórea*.",
            "definitionHtml": "<p>Soporte ventilatorio mediante tubo endotraqueal (TET) o traqueostomía conectado a ventilador mecánico; la extubación también evidencia un episodio previo.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La ECMO veno-venosa no se registra aquí, sino en <em>Circulación extracorpórea</em>.</li>\n</ul>",
            "children": [
              {
                "id": "4.3.2.1",
                "key": "soporte.respiratorio.vmi.fecha_inicio",
                "label": "Fecha de inicio",
                "type": "date",
                "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.2.2",
                "key": "soporte.respiratorio.vmi.fecha_termino",
                "label": "Fecha de término",
                "type": "date",
                "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.2.3",
                "key": "soporte.respiratorio.vmi.motivo",
                "label": "Motivo",
                "type": "text",
                "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
                "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
              },
              {
                "id": "4.3.2.4",
                "key": "soporte.respiratorio.vmi.mas_de_un_ciclo",
                "label": "Requirió más de un ciclo de VMI",
                "type": "leaf",
                "definitionMarkdown": "Marca si la ventilación mecánica invasiva se aplicó en más de un episodio (p. ej. reintubación).",
                "definitionHtml": "<p>Marca si la ventilación mecánica invasiva se aplicó en más de un episodio (p. ej. reintubación).</p>"
              }
            ]
          },
          {
            "id": "4.3.3",
            "key": "soporte.respiratorio.bloqueo_neuromuscular",
            "label": "Bloqueo neuromuscular",
            "type": "leaf",
            "definitionMarkdown": "Uso de bloqueadores neuromusculares durante la VMI (rocuronio, vecuronio, cisatracurio, atracurio).",
            "definitionHtml": "<p>Uso de bloqueadores neuromusculares durante la VMI (rocuronio, vecuronio, cisatracurio, atracurio).</p>",
            "children": [
              {
                "id": "4.3.3.1",
                "key": "soporte.respiratorio.bloqueo_neuromuscular.fecha_inicio",
                "label": "Fecha de inicio",
                "type": "date",
                "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.3.2",
                "key": "soporte.respiratorio.bloqueo_neuromuscular.fecha_termino",
                "label": "Fecha de término",
                "type": "date",
                "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.3.3",
                "key": "soporte.respiratorio.bloqueo_neuromuscular.mas_de_un_ciclo",
                "label": "Requirió más de un ciclo de bloqueo neuromuscular",
                "type": "leaf",
                "definitionMarkdown": "Marca si el bloqueo neuromuscular se administró en más de un ciclo.",
                "definitionHtml": "<p>Marca si el bloqueo neuromuscular se administró en más de un ciclo.</p>"
              }
            ]
          },
          {
            "id": "4.3.4",
            "key": "soporte.respiratorio.prono",
            "label": "Posición prono",
            "type": "leaf",
            "definitionMarkdown": "Ventilación en decúbito prono.\n* **Nota de desambiguación:** No incluye cambios posturales generales, solo la posición prono propiamente tal.",
            "definitionHtml": "<p>Ventilación en decúbito prono.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye cambios posturales generales, solo la posición prono propiamente tal.</li>\n</ul>",
            "children": [
              {
                "id": "4.3.4.1",
                "key": "soporte.respiratorio.prono.fecha_inicio",
                "label": "Fecha de inicio",
                "type": "date",
                "definitionMarkdown": "Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que comenzó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.4.2",
                "key": "soporte.respiratorio.prono.fecha_termino",
                "label": "Fecha de término",
                "type": "date",
                "definitionMarkdown": "Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que finalizó el soporte o intervención (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.4.3",
                "key": "soporte.respiratorio.prono.mas_de_un_ciclo",
                "label": "Requirió más de un ciclo de prono",
                "type": "leaf",
                "definitionMarkdown": "Marca si la posición prono se aplicó en más de un ciclo.",
                "definitionHtml": "<p>Marca si la posición prono se aplicó en más de un ciclo.</p>"
              }
            ]
          },
          {
            "id": "4.3.5",
            "key": "soporte.respiratorio.traqueostomia",
            "label": "Traqueostomía",
            "type": "leaf",
            "definitionMarkdown": "Procedimiento para crear una abertura en la tráquea (TQT) para soporte respiratorio prolongado. Se distingue si fue realizada en UPC, previa al ingreso, o no documentada.\n* **Nota de desambiguación:** La traqueostomía va en *Soporte respiratorio*, no en *Complicaciones*.",
            "definitionHtml": "<p>Procedimiento para crear una abertura en la tráquea (TQT) para soporte respiratorio prolongado. Se distingue si fue realizada en UPC, previa al ingreso, o no documentada.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La traqueostomía va en <em>Soporte respiratorio</em>, no en <em>Complicaciones</em>.</li>\n</ul>",
            "children": [
              {
                "id": "4.3.5.1",
                "key": "soporte.respiratorio.traqueostomia.fecha_realizacion",
                "label": "Fecha de realización",
                "type": "date",
                "definitionMarkdown": "Fecha en que se realizó el procedimiento (DD/MM/AAAA), cuando el texto la consigna.",
                "definitionHtml": "<p>Fecha en que se realizó el procedimiento (DD/MM/AAAA), cuando el texto la consigna.</p>"
              },
              {
                "id": "4.3.5.2",
                "key": "soporte.respiratorio.traqueostomia.motivo",
                "label": "Motivo",
                "type": "text",
                "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
                "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
              }
            ]
          }
        ]
      },
      {
        "id": "4.4",
        "key": "soporte.circulacion_extracorporea",
        "label": "Circulación extracorpórea",
        "type": "leaf",
        "definitionMarkdown": "ECMO, CEC (circulación extracorpórea) u oxigenación por membrana extracorpórea en general.\n* **Nota de desambiguación:** Es independiente de *Hemodinámico* y de *Respiratorio*; no se registra en esas categorías.",
        "definitionHtml": "<p>ECMO, CEC (circulación extracorpórea) u oxigenación por membrana extracorpórea en general.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Es independiente de <em>Hemodinámico</em> y de <em>Respiratorio</em>; no se registra en esas categorías.</li>\n</ul>"
      },
      {
        "id": "4.5",
        "key": "soporte.sedoanalgesia_continua",
        "label": "Sedoanalgesia continua",
        "type": "leaf",
        "definitionMarkdown": "Sedación/analgesia continua (propofol, midazolam, fentanilo, dexmedetomidina, entre otros).",
        "definitionHtml": "<p>Sedación/analgesia continua (propofol, midazolam, fentanilo, dexmedetomidina, entre otros).</p>"
      },
      {
        "id": "4.6",
        "key": "soporte.renal",
        "label": "Renal",
        "type": "leaf",
        "definitionMarkdown": "Bloque de soportes renales utilizados durante la estadía.",
        "definitionHtml": "<p>Bloque de soportes renales utilizados durante la estadía.</p>",
        "children": [
          {
            "id": "4.6.1",
            "key": "soporte.renal.hemodialisis_aguda",
            "label": "Hemodiálisis aguda",
            "type": "leaf",
            "definitionMarkdown": "Hemodiálisis intermitente iniciada de forma aguda durante la estadía.",
            "definitionHtml": "<p>Hemodiálisis intermitente iniciada de forma aguda durante la estadía.</p>"
          },
          {
            "id": "4.6.2",
            "key": "soporte.renal.trr_continua",
            "label": "Terapia de reemplazo renal continua",
            "type": "leaf",
            "definitionMarkdown": "Terapia de reemplazo renal continua (hemofiltración o hemodiafiltración continua).",
            "definitionHtml": "<p>Terapia de reemplazo renal continua (hemofiltración o hemodiafiltración continua).</p>"
          },
          {
            "id": "4.6.3",
            "key": "soporte.renal.ultrafiltracion_aislada",
            "label": "Ultrafiltración aislada",
            "type": "leaf",
            "definitionMarkdown": "Ultrafiltración aislada para manejo de volumen.",
            "definitionHtml": "<p>Ultrafiltración aislada para manejo de volumen.</p>"
          },
          {
            "id": "4.6.4",
            "key": "soporte.renal.dialisis_peritoneal_aguda",
            "label": "Diálisis peritoneal aguda",
            "type": "leaf",
            "definitionMarkdown": "Diálisis peritoneal iniciada de forma aguda durante la estadía.",
            "definitionHtml": "<p>Diálisis peritoneal iniciada de forma aguda durante la estadía.</p>"
          },
          {
            "id": "4.6.5",
            "key": "soporte.renal.otro",
            "label": "Otro soporte renal",
            "type": "leaf",
            "definitionMarkdown": "Otro soporte renal no cubierto por los campos anteriores.\n* **Nota de desambiguación:** No se registra la diálisis crónica habitual sin cambios; sí se registra si el cuadro obliga a modificar o intensificar la modalidad.",
            "definitionHtml": "<p>Otro soporte renal no cubierto por los campos anteriores.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No se registra la diálisis crónica habitual sin cambios; sí se registra si el cuadro obliga a modificar o intensificar la modalidad.</li>\n</ul>"
          }
        ]
      },
      {
        "id": "4.7",
        "key": "soporte.hfav",
        "label": "Hemofiltración de alto volumen",
        "type": "leaf",
        "definitionMarkdown": "Hemofiltración de alto volumen, independiente del soporte renal habitual. Se especifica su indicación (renal/depurativa, inmunomodulación/remoción de citoquinas, mixta o no especificada).",
        "definitionHtml": "<p>Hemofiltración de alto volumen, independiente del soporte renal habitual. Se especifica su indicación (renal/depurativa, inmunomodulación/remoción de citoquinas, mixta o no especificada).</p>",
        "children": [
          {
            "id": "4.7.1",
            "key": "soporte.hfav.motivo",
            "label": "Motivo",
            "type": "text",
            "definitionMarkdown": "Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).",
            "definitionHtml": "<p>Indicación o razón documentada del soporte o intervención (p. ej. indicación de la hemofiltración o de la circulación extracorpórea).</p>"
          }
        ]
      },
      {
        "id": "4.8",
        "key": "soporte.transfusion",
        "label": "Transfusión de hemoderivados",
        "type": "leaf",
        "definitionMarkdown": "Transfusión de glóbulos rojos, plaquetas, plasma fresco congelado o crioprecipitado.",
        "definitionHtml": "<p>Transfusión de glóbulos rojos, plaquetas, plasma fresco congelado o crioprecipitado.</p>",
        "children": [
          {
            "id": "4.8.1",
            "key": "soporte.transfusion.tipo",
            "label": "Tipo de hemoderivado",
            "type": "leaf",
            "definitionMarkdown": "Tipo de hemoderivado transfundido (glóbulos rojos, plaquetas, plasma, crioprecipitado).",
            "definitionHtml": "<p>Tipo de hemoderivado transfundido (glóbulos rojos, plaquetas, plasma, crioprecipitado).</p>"
          },
          {
            "id": "4.8.2",
            "key": "soporte.transfusion.masiva",
            "label": "Protocolo de transfusión masiva",
            "type": "leaf",
            "definitionMarkdown": "Marca si la transfusión correspondió a un protocolo de transfusión masiva.",
            "definitionHtml": "<p>Marca si la transfusión correspondió a un protocolo de transfusión masiva.</p>"
          }
        ]
      },
      {
        "id": "4.9",
        "key": "soporte.otros_avanzados",
        "label": "Otros soportes avanzados",
        "type": "leaf",
        "definitionMarkdown": "Bloque de soportes avanzados adicionales utilizados durante la estadía.",
        "definitionHtml": "<p>Bloque de soportes avanzados adicionales utilizados durante la estadía.</p>",
        "children": [
          {
            "id": "4.9.1",
            "key": "soporte.otros_avanzados.recambio_plasmatico",
            "label": "Recambio plasmático terapéutico",
            "type": "leaf",
            "definitionMarkdown": "Plasmaféresis o recambio plasmático terapéutico.",
            "definitionHtml": "<p>Plasmaféresis o recambio plasmático terapéutico.</p>"
          },
          {
            "id": "4.9.2",
            "key": "soporte.otros_avanzados.hemoadsorcion",
            "label": "Hemoadsorción",
            "type": "leaf",
            "definitionMarkdown": "Terapia de hemoadsorción.",
            "definitionHtml": "<p>Terapia de hemoadsorción.</p>"
          },
          {
            "id": "4.9.3",
            "key": "soporte.otros_avanzados.hipotermia_terapeutica",
            "label": "Hipotermia terapéutica",
            "type": "leaf",
            "definitionMarkdown": "Manejo con hipotermia terapéutica / control dirigido de temperatura.",
            "definitionHtml": "<p>Manejo con hipotermia terapéutica / control dirigido de temperatura.</p>"
          },
          {
            "id": "4.9.4",
            "key": "soporte.otros_avanzados.soporte_hepatico",
            "label": "Soporte hepático extracorpóreo",
            "type": "leaf",
            "definitionMarkdown": "Soporte hepático extracorpóreo (p. ej. sistemas de diálisis hepática).",
            "definitionHtml": "<p>Soporte hepático extracorpóreo (p. ej. sistemas de diálisis hepática).</p>"
          },
          {
            "id": "4.9.5",
            "key": "soporte.otros_avanzados.insulina_infusion",
            "label": "Insulina en infusión continua",
            "type": "leaf",
            "definitionMarkdown": "Administración de insulina en infusión continua como soporte.\n* **Nota de desambiguación:** No incluye la insulina subcutánea de corrección habitual.",
            "definitionHtml": "<p>Administración de insulina en infusión continua como soporte.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la insulina subcutánea de corrección habitual.</li>\n</ul>"
          },
          {
            "id": "4.9.6",
            "key": "soporte.otros_avanzados.otro",
            "label": "Otro soporte avanzado",
            "type": "leaf",
            "definitionMarkdown": "Otro soporte avanzado no cubierto por los campos anteriores.",
            "definitionHtml": "<p>Otro soporte avanzado no cubierto por los campos anteriores.</p>"
          }
        ]
      },
      {
        "id": "4.10",
        "key": "soporte.intervenciones",
        "label": "Intervenciones terapéuticas",
        "type": "leaf",
        "definitionMarkdown": "Procedimientos terapéuticos realizados durante la estadía en UPC.\n* **Nota de desambiguación:** Se registran los procedimientos realizados durante la estadía en UPC, no los que motivaron el ingreso.",
        "definitionHtml": "<p>Procedimientos terapéuticos realizados durante la estadía en UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Se registran los procedimientos realizados durante la estadía en UPC, no los que motivaron el ingreso.</li>\n</ul>",
        "children": [
          {
            "id": "4.10.1",
            "key": "soporte.intervenciones.quirurgico",
            "label": "Quirúrgico",
            "type": "leaf",
            "definitionMarkdown": "Procedimiento quirúrgico realizado durante la estadía.",
            "definitionHtml": "<p>Procedimiento quirúrgico realizado durante la estadía.</p>"
          },
          {
            "id": "4.10.2",
            "key": "soporte.intervenciones.endoscopico",
            "label": "Endoscópico",
            "type": "leaf",
            "definitionMarkdown": "Procedimiento endoscópico (endoscopía digestiva con hemostasia, colangiopancreatografía retrógrada endoscópica, broncoscopía terapéutica, entre otros).",
            "definitionHtml": "<p>Procedimiento endoscópico (endoscopía digestiva con hemostasia, colangiopancreatografía retrógrada endoscópica, broncoscopía terapéutica, entre otros).</p>"
          },
          {
            "id": "4.10.3",
            "key": "soporte.intervenciones.cardiologico",
            "label": "Cardiológico",
            "type": "leaf",
            "definitionMarkdown": "Procedimiento cardiológico (marcapasos transitorio, cardioversión eléctrica o desfibrilación, entre otros).",
            "definitionHtml": "<p>Procedimiento cardiológico (marcapasos transitorio, cardioversión eléctrica o desfibrilación, entre otros).</p>"
          },
          {
            "id": "4.10.4",
            "key": "soporte.intervenciones.reperfusion",
            "label": "Reperfusión",
            "type": "leaf",
            "definitionMarkdown": "Terapia de reperfusión (intervención coronaria percutánea, trombólisis, trombectomía, u otro).",
            "definitionHtml": "<p>Terapia de reperfusión (intervención coronaria percutánea, trombólisis, trombectomía, u otro).</p>"
          },
          {
            "id": "4.10.5",
            "key": "soporte.intervenciones.otro",
            "label": "Otro tipo de intervención",
            "type": "leaf",
            "definitionMarkdown": "Otra intervención (toracocentesis, pericardiocentesis, paracentesis, entre otros).",
            "definitionHtml": "<p>Otra intervención (toracocentesis, pericardiocentesis, paracentesis, entre otros).</p>"
          }
        ]
      }
    ]
  },
  {
    "id": "5",
    "key": "falla",
    "label": "Bloque 5. Falla orgánica",
    "type": "mother",
    "children": [
      {
        "id": "5.1",
        "key": "falla.puntaje_gravedad",
        "label": "Puntaje de gravedad o disfunción orgánica (SOFA, APACHE…)",
        "type": "leaf",
        "definitionMarkdown": "Puntaje de gravedad o disfunción orgánica. Se registra solo si el texto lo menciona explícitamente (SOFA, qSOFA, APACHE II o IV, KDIGO, MELD, CLIF-SOFA o CLIF-C, entre otros).",
        "definitionHtml": "<p>Puntaje de gravedad o disfunción orgánica. Se registra solo si el texto lo menciona explícitamente (SOFA, qSOFA, APACHE II o IV, KDIGO, MELD, CLIF-SOFA o CLIF-C, entre otros).</p>"
      },
      {
        "id": "5.2",
        "key": "falla.respiratoria",
        "label": "Falla respiratoria",
        "type": "leaf",
        "definitionMarkdown": "Insuficiencia respiratoria, síndrome de distrés respiratorio agudo (SDRA) o hipoxemia grave.",
        "definitionHtml": "<p>Insuficiencia respiratoria, síndrome de distrés respiratorio agudo (SDRA) o hipoxemia grave.</p>"
      },
      {
        "id": "5.3",
        "key": "falla.hemodinamica",
        "label": "Falla hemodinámica",
        "type": "leaf",
        "definitionMarkdown": "Shock, hipotensión persistente pese a volumen, o inestabilidad hemodinámica relevante.",
        "definitionHtml": "<p>Shock, hipotensión persistente pese a volumen, o inestabilidad hemodinámica relevante.</p>"
      },
      {
        "id": "5.4",
        "key": "falla.renal_aguda",
        "label": "Falla renal aguda",
        "type": "leaf",
        "definitionMarkdown": "Injuria renal aguda o aguda sobre crónica.\n* **Nota de desambiguación:** No incluye la enfermedad renal crónica estable (esa es un antecedente).",
        "definitionHtml": "<p>Injuria renal aguda o aguda sobre crónica.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la enfermedad renal crónica estable (esa es un antecedente).</li>\n</ul>"
      },
      {
        "id": "5.5",
        "key": "falla.neurologica",
        "label": "Falla neurológica",
        "type": "leaf",
        "definitionMarkdown": "Compromiso de conciencia severo, encefalopatía grave, convulsiones o estado epiléptico, o evento cerebrovascular agudo.\n* **Nota de desambiguación:** El delirium se registra aquí solo si es severo; el delirium leve va en *Complicaciones*.",
        "definitionHtml": "<p>Compromiso de conciencia severo, encefalopatía grave, convulsiones o estado epiléptico, o evento cerebrovascular agudo.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El delirium se registra aquí solo si es severo; el delirium leve va en <em>Complicaciones</em>.</li>\n</ul>"
      },
      {
        "id": "5.6",
        "key": "falla.hepatica",
        "label": "Falla hepática",
        "type": "leaf",
        "definitionMarkdown": "Falla hepática aguda, aguda sobre crónica o descompensación aguda.\n* **Nota de desambiguación:** No incluye la cirrosis estable (esa es un antecedente).",
        "definitionHtml": "<p>Falla hepática aguda, aguda sobre crónica o descompensación aguda.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No incluye la cirrosis estable (esa es un antecedente).</li>\n</ul>"
      },
      {
        "id": "5.7",
        "key": "falla.hematologica",
        "label": "Falla hematológica",
        "type": "leaf",
        "definitionMarkdown": "Trombocitopenia severa, coagulopatía o coagulación intravascular diseminada, hemorragia significativa, trombosis con repercusión, microangiopatía trombótica o hemólisis.\n* **Nota de desambiguación:** Las citopenias crónicas solo se registran si variaron durante la estadía.",
        "definitionHtml": "<p>Trombocitopenia severa, coagulopatía o coagulación intravascular diseminada, hemorragia significativa, trombosis con repercusión, microangiopatía trombótica o hemólisis.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Las citopenias crónicas solo se registran si variaron durante la estadía.</li>\n</ul>"
      },
      {
        "id": "5.8",
        "key": "falla.otra",
        "label": "Otra falla",
        "type": "leaf",
        "definitionMarkdown": "Otra falla orgánica no cubierta por los campos anteriores.",
        "definitionHtml": "<p>Otra falla orgánica no cubierta por los campos anteriores.</p>"
      },
      {
        "id": "5.9",
        "key": "falla.multiorganica",
        "label": "Falla multiorgánica",
        "type": "leaf",
        "definitionMarkdown": "Falla multiorgánica. Se marca solo si el texto lo menciona explícitamente como tal o equivalente.\n\n---",
        "definitionHtml": "<p>Falla multiorgánica. Se marca solo si el texto lo menciona explícitamente como tal o equivalente.</p>\n<hr>"
      }
    ]
  },
  {
    "id": "6",
    "key": "infecciones",
    "label": "Bloque 6. Infecciones",
    "type": "mother",
    "children": [
      {
        "id": "6.1",
        "key": "infecciones.estadia_upc",
        "label": "Infección/es durante la estadía en UPC",
        "type": "leaf",
        "definitionMarkdown": "Infección diagnosticada durante la estadía en la UPC.\n* **Nota de desambiguación:** No se registra por fiebre, leucocitosis, marcadores aislados, cultivos sin diagnóstico, profilaxis, o sospecha descartada.",
        "definitionHtml": "<p>Infección diagnosticada durante la estadía en la UPC.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> No se registra por fiebre, leucocitosis, marcadores aislados, cultivos sin diagnóstico, profilaxis, o sospecha descartada.</li>\n</ul>",
        "children": [
          {
            "id": "6.1.1",
            "key": "infecciones.sepsis",
            "label": "Sepsis o shock séptico",
            "type": "leaf",
            "definitionMarkdown": "Infección con disfunción orgánica asociada. Se distingue entre sepsis y shock séptico.",
            "definitionHtml": "<p>Infección con disfunción orgánica asociada. Se distingue entre sepsis y shock séptico.</p>"
          },
          {
            "id": "6.1.2",
            "key": "infecciones.focos",
            "label": "Focos infecciosos",
            "type": "mother",
            "children": [
              {
                "id": "6.1.2.1",
                "key": "infecciones.focos.urinario",
                "label": "Urinario",
                "type": "leaf",
                "definitionMarkdown": "Foco infeccioso urinario (infección del tracto urinario, pielonefritis).",
                "definitionHtml": "<p>Foco infeccioso urinario (infección del tracto urinario, pielonefritis).</p>",
                "children": [
                  {
                    "id": "6.1.2.1.1",
                    "key": "infecciones.focos.urinario.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.1.2",
                    "key": "infecciones.focos.urinario.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.1.3",
                    "key": "infecciones.focos.urinario.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.2",
                "key": "infecciones.focos.respiratorio",
                "label": "Respiratorio",
                "type": "leaf",
                "definitionMarkdown": "Foco infeccioso respiratorio (neumonía, traqueobronquitis).",
                "definitionHtml": "<p>Foco infeccioso respiratorio (neumonía, traqueobronquitis).</p>",
                "children": [
                  {
                    "id": "6.1.2.2.1",
                    "key": "infecciones.focos.respiratorio.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.2.2",
                    "key": "infecciones.focos.respiratorio.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.2.3",
                    "key": "infecciones.focos.respiratorio.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.3",
                "key": "infecciones.focos.digestivo_biliar",
                "label": "Digestivo o biliar",
                "type": "leaf",
                "definitionMarkdown": "Foco infeccioso digestivo o biliar (colangitis, peritonitis, absceso intraabdominal).",
                "definitionHtml": "<p>Foco infeccioso digestivo o biliar (colangitis, peritonitis, absceso intraabdominal).</p>",
                "children": [
                  {
                    "id": "6.1.2.3.1",
                    "key": "infecciones.focos.digestivo_biliar.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.3.2",
                    "key": "infecciones.focos.digestivo_biliar.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.4",
                "key": "infecciones.focos.cateter",
                "label": "Catéter o dispositivo intravascular",
                "type": "leaf",
                "definitionMarkdown": "Infección asociada a catéter o dispositivo intravascular.",
                "definitionHtml": "<p>Infección asociada a catéter o dispositivo intravascular.</p>",
                "children": [
                  {
                    "id": "6.1.2.4.1",
                    "key": "infecciones.focos.cateter.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.4.2",
                    "key": "infecciones.focos.cateter.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.4.3",
                    "key": "infecciones.focos.cateter.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.5",
                "key": "infecciones.focos.piel_blandas",
                "label": "Piel y partes blandas",
                "type": "leaf",
                "definitionMarkdown": "Foco en piel y partes blandas (celulitis, fascitis, absceso).",
                "definitionHtml": "<p>Foco en piel y partes blandas (celulitis, fascitis, absceso).</p>",
                "children": [
                  {
                    "id": "6.1.2.5.1",
                    "key": "infecciones.focos.piel_blandas.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.5.2",
                    "key": "infecciones.focos.piel_blandas.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.5.3",
                    "key": "infecciones.focos.piel_blandas.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.6",
                "key": "infecciones.focos.herida_sitio_quirurgico",
                "label": "Herida operatoria o sitio quirúrgico",
                "type": "leaf",
                "definitionMarkdown": "Infección de herida operatoria o sitio quirúrgico.",
                "definitionHtml": "<p>Infección de herida operatoria o sitio quirúrgico.</p>",
                "children": [
                  {
                    "id": "6.1.2.6.1",
                    "key": "infecciones.focos.herida_sitio_quirurgico.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.6.2",
                    "key": "infecciones.focos.herida_sitio_quirurgico.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.7",
                "key": "infecciones.focos.sistema_nervioso",
                "label": "Sistema nervioso central",
                "type": "leaf",
                "definitionMarkdown": "Foco en el sistema nervioso central (meningitis, encefalitis, absceso cerebral).",
                "definitionHtml": "<p>Foco en el sistema nervioso central (meningitis, encefalitis, absceso cerebral).</p>",
                "children": [
                  {
                    "id": "6.1.2.7.1",
                    "key": "infecciones.focos.sistema_nervioso.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.7.2",
                    "key": "infecciones.focos.sistema_nervioso.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.8",
                "key": "infecciones.focos.osteoarticular",
                "label": "Osteoarticular",
                "type": "leaf",
                "definitionMarkdown": "Foco osteoarticular (osteomielitis, artritis séptica).",
                "definitionHtml": "<p>Foco osteoarticular (osteomielitis, artritis séptica).</p>",
                "children": [
                  {
                    "id": "6.1.2.8.1",
                    "key": "infecciones.focos.osteoarticular.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.8.2",
                    "key": "infecciones.focos.osteoarticular.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.9",
                "key": "infecciones.focos.cardiovascular_endocarditis",
                "label": "Cardiovascular o endocarditis",
                "type": "leaf",
                "definitionMarkdown": "Foco cardiovascular o endocarditis.",
                "definitionHtml": "<p>Foco cardiovascular o endocarditis.</p>",
                "children": [
                  {
                    "id": "6.1.2.9.1",
                    "key": "infecciones.focos.cardiovascular_endocarditis.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.9.2",
                    "key": "infecciones.focos.cardiovascular_endocarditis.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.9.3",
                    "key": "infecciones.focos.cardiovascular_endocarditis.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.10",
                "key": "infecciones.focos.otro",
                "label": "Otro foco",
                "type": "leaf",
                "definitionMarkdown": "Otro foco infeccioso no cubierto por los campos anteriores.",
                "definitionHtml": "<p>Otro foco infeccioso no cubierto por los campos anteriores.</p>",
                "children": [
                  {
                    "id": "6.1.2.10.1",
                    "key": "infecciones.focos.otro.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.10.2",
                    "key": "infecciones.focos.otro.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.10.3",
                    "key": "infecciones.focos.otro.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              },
              {
                "id": "6.1.2.11",
                "key": "infecciones.focos.no_identificado",
                "label": "No identificado",
                "type": "leaf",
                "definitionMarkdown": "Infección sin foco identificado.",
                "definitionHtml": "<p>Infección sin foco identificado.</p>",
                "children": [
                  {
                    "id": "6.1.2.11.1",
                    "key": "infecciones.focos.no_identificado.iaas",
                    "label": "Asociado a dispositivo o a la atención en salud (IAAS)",
                    "type": "leaf",
                    "definitionMarkdown": "La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).",
                    "definitionHtml": "<p>La infección corresponde a una IAAS asociada a dispositivo o a la atención en salud (infección urinaria asociada a catéter, infección asociada a catéter venoso central, neumonía asociada a ventilación mecánica invasiva, entre otras).</p>"
                  },
                  {
                    "id": "6.1.2.11.2",
                    "key": "infecciones.focos.no_identificado.agente",
                    "label": "Agente microbiológico",
                    "type": "leaf",
                    "definitionMarkdown": "Germen identificado como causante de la infección.\n* **Nota de desambiguación:** Ante candiduria en orina o *Staphylococcus* coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.",
                    "definitionHtml": "<p>Germen identificado como causante de la infección.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Ante candiduria en orina o <em>Staphylococcus</em> coagulasa negativo en sangre, evaluar si corresponde a colonización o contaminación; si no hubo tratamiento dirigido, es poco probable que se haya considerado infección real.</li>\n</ul>"
                  },
                  {
                    "id": "6.1.2.11.3",
                    "key": "infecciones.focos.no_identificado.tratamiento",
                    "label": "Tratamiento para este foco",
                    "type": "leaf",
                    "definitionMarkdown": "Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.\n* **Nota de desambiguación:** La profilaxis no se registra.\n\n---",
                    "definitionHtml": "<p>Antibiótico, antifúngico o antiviral, dirigido o empírico, para este foco.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> La profilaxis no se registra.</li>\n</ul>\n<hr>"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "7",
    "key": "complicaciones",
    "label": "Bloque 7. Complicaciones",
    "type": "mother",
    "children": [
      {
        "id": "7.1",
        "key": "complicaciones.delirium",
        "label": "Delirium",
        "type": "leaf",
        "definitionMarkdown": "Alteración fluctuante del estado mental, la atención y el nivel de conciencia durante la estadía en UCI (agitación, confusión, CAM-ICU positivo).\n* **Nota de desambiguación:** El delirium leve va aquí; el delirium grave (encefalopatía severa, coma) va en *Falla orgánica* (neurológica).",
        "definitionHtml": "<p>Alteración fluctuante del estado mental, la atención y el nivel de conciencia durante la estadía en UCI (agitación, confusión, CAM-ICU positivo).</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> El delirium leve va aquí; el delirium grave (encefalopatía severa, coma) va en <em>Falla orgánica</em> (neurológica).</li>\n</ul>"
      },
      {
        "id": "7.2",
        "key": "complicaciones.debilidad_adquirida",
        "label": "Debilidad adquirida",
        "type": "leaf",
        "definitionMarkdown": "Debilidad muscular difusa, polineuropatía o miopatía del paciente crítico, o dificultad para el destete del ventilador mecánico debido a debilidad.",
        "definitionHtml": "<p>Debilidad muscular difusa, polineuropatía o miopatía del paciente crítico, o dificultad para el destete del ventilador mecánico debido a debilidad.</p>"
      },
      {
        "id": "7.3",
        "key": "complicaciones.lesiones_presion",
        "label": "Lesiones por presión",
        "type": "leaf",
        "definitionMarkdown": "Úlceras por presión o escaras desarrolladas en la UCI, especialmente si requirieron aseo quirúrgico.",
        "definitionHtml": "<p>Úlceras por presión o escaras desarrolladas en la UCI, especialmente si requirieron aseo quirúrgico.</p>"
      },
      {
        "id": "7.4",
        "key": "complicaciones.desnutricion",
        "label": "Desnutricion o soporte nutricional intensivo",
        "type": "leaf",
        "definitionMarkdown": "Requiere diagnóstico explícito de desnutrición en la epicrisis o la administración de soporte nutricional intensivo. La sola mención de nutrición enteral o parenteral no basta por sí sola si no hay diagnóstico o soporte intensivo explícito.",
        "definitionHtml": "<p>Requiere diagnóstico explícito de desnutrición en la epicrisis o la administración de soporte nutricional intensivo. La sola mención de nutrición enteral o parenteral no basta por sí sola si no hay diagnóstico o soporte intensivo explícito.</p>"
      },
      {
        "id": "7.5",
        "key": "complicaciones.disfagia",
        "label": "Disfagia o trastorno deglutorio",
        "type": "leaf",
        "definitionMarkdown": "Requiere diagnóstico explícito de disfagia o derivación formal a fonoaudiología por sospecha de trastorno deglutorio; la sola rehabilitación fonoaudiológica sin diagnóstico no basta por sí sola.",
        "definitionHtml": "<p>Requiere diagnóstico explícito de disfagia o derivación formal a fonoaudiología por sospecha de trastorno deglutorio; la sola rehabilitación fonoaudiológica sin diagnóstico no basta por sí sola.</p>"
      },
      {
        "id": "7.6",
        "key": "complicaciones.paciente_critico_cronico",
        "label": "Paciente crítico crónico",
        "type": "leaf",
        "definitionMarkdown": "Se marca con certeza solo si el texto de la epicrisis describe explícitamente al paciente como tal (\"crítico crónico\", \"paciente crónico de UCI\").",
        "definitionHtml": "<p>Se marca con certeza solo si el texto de la epicrisis describe explícitamente al paciente como tal (&quot;crítico crónico&quot;, &quot;paciente crónico de UCI&quot;).</p>"
      },
      {
        "id": "7.7",
        "key": "complicaciones.otra",
        "label": "Otra complicación",
        "type": "leaf",
        "definitionMarkdown": "Cualquier otra complicación surgida durante la estadía en la UCI que no esté cubierta por los campos anteriores.\n\n---",
        "definitionHtml": "<p>Cualquier otra complicación surgida durante la estadía en la UCI que no esté cubierta por los campos anteriores.</p>\n<hr>"
      }
    ]
  },
  {
    "id": "8",
    "key": "egreso",
    "label": "Bloque 8. Egreso",
    "type": "mother",
    "children": [
      {
        "id": "8.1",
        "key": "egreso.fecha_egreso_upc",
        "label": "Fecha de egreso de UPC",
        "type": "date",
        "definitionMarkdown": "Fecha de egreso de la Unidad de Paciente Crítico (DD/MM/AAAA).",
        "definitionHtml": "<p>Fecha de egreso de la Unidad de Paciente Crítico (DD/MM/AAAA).</p>"
      },
      {
        "id": "8.2",
        "key": "egreso.estado_vital",
        "label": "Estado vital al egreso de UPC",
        "type": "select",
        "definitionMarkdown": "Condición del paciente al egreso de la UPC: vivo o fallecido.",
        "definitionHtml": "<p>Condición del paciente al egreso de la UPC: vivo o fallecido.</p>"
      },
      {
        "id": "8.3",
        "key": "egreso.destino",
        "label": "Destino de egreso de UPC",
        "type": "select",
        "definitionMarkdown": "Lugar al que se traslada el paciente al salir de la UPC (sala, otro centro, domicilio, etc.). Solo aplica si egresó vivo.",
        "definitionHtml": "<p>Lugar al que se traslada el paciente al salir de la UPC (sala, otro centro, domicilio, etc.). Solo aplica si egresó vivo.</p>"
      },
      {
        "id": "8.4",
        "key": "egreso.diagnostico",
        "label": "Diagnóstico de egreso de UPC",
        "type": "text",
        "definitionMarkdown": "Diagnóstico principal al egreso de la UPC.",
        "definitionHtml": "<p>Diagnóstico principal al egreso de la UPC.</p>"
      },
      {
        "id": "8.5",
        "key": "egreso.reingreso_upc",
        "label": "Reingreso a UPC durante la hospitalización",
        "type": "leaf",
        "definitionMarkdown": "Marca si el paciente reingresó a la UPC durante la misma hospitalización.\n* **Nota de desambiguación:** Por ahora solo se registra la primera estadía; menciona en comentarios si hay información relevante en otra estadía.\n\n---",
        "definitionHtml": "<p>Marca si el paciente reingresó a la UPC durante la misma hospitalización.</p>\n<ul>\n<li><strong>Nota de desambiguación:</strong> Por ahora solo se registra la primera estadía; menciona en comentarios si hay información relevante en otra estadía.</li>\n</ul>\n<hr>"
      }
    ]
  },
  {
    "id": "9",
    "key": "calidad",
    "label": "Bloque 9. Calidad global de la epicrisis",
    "type": "mother",
    "children": [
      {
        "id": "9.1",
        "key": "calidad.global",
        "label": "Calidad global de la epicrisis",
        "type": "select",
        "definitionMarkdown": "Juicio del anotador sobre qué tan completa y confiable venía la epicrisis para la extracción: confiable, parcial o deficiente.",
        "definitionHtml": "<p>Juicio del anotador sobre qué tan completa y confiable venía la epicrisis para la extracción: confiable, parcial o deficiente.</p>"
      },
      {
        "id": "9.2",
        "key": "calidad.comentario",
        "label": "Comentario final (opcional)",
        "type": "text",
        "definitionMarkdown": "Comentario libre para describir con más detalle la calidad de la epicrisis o del proceso de anotación.",
        "definitionHtml": "<p>Comentario libre para describir con más detalle la calidad de la epicrisis o del proceso de anotación.</p>"
      }
    ]
  }
];
