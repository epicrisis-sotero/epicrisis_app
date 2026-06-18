<script setup lang="ts">
import { computed } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'
import ClinicalToggle from './ClinicalToggle.vue'
import BaseClinicalVariable from './BaseClinicalVariable.vue'
import DifficultyBadge from './DifficultyBadge.vue'
import { FOCOS, ORGANOS, normalizeSearch } from '@/constants/clinicalItems'

const props = defineProps<{ isReadOnly?: boolean; searchQuery?: string }>()

const store = useAnnotationStore()

// Section visibility based on search query
const q = computed(() => normalizeSearch(props.searchQuery ?? ''))

function sectionVisible(sectionName: string, itemLabels: string[] = []): boolean {
  if (!q.value) return true
  if (normalizeSearch(sectionName).includes(q.value)) return true
  return itemLabels.some(l => normalizeSearch(l).includes(q.value))
}

const showVentilatorio  = computed(() => sectionVisible('Soporte Ventilatorio', ['Ventilación mecánica invasiva', 'VMI', 'Ventilación mecánica no invasiva', 'VMNI', 'prono', 'urgencia']))
const showReanimacion   = computed(() => sectionVisible('Reanimación', ['reanimación', 'paros', 'ciclos']))
const showTransfusion   = computed(() => sectionVisible('Transfusión', ['transfusión', 'unidades']))
const showVasoactivas   = computed(() => sectionVisible('Drogas Vasoactivas', ['drogas vasoactivas']))
const showCirugias      = computed(() => sectionVisible('Cirugías en Hospitalización', ['cirugía', 'cirugías', 'hospitalización']))
const showTrr           = computed(() => sectionVisible('Terapia de Reemplazo Renal', ['terapia reemplazo renal', 'TRR', 'hemodiálisis', 'hemofiltración', 'diálisis']))
const showUci           = computed(() => sectionVisible('Variables UCI', ['reingreso', 'secuela', 'neuropatía', 'miopatía', 'desnutrición', 'secuelas']))
const showInfecciones   = computed(() => sectionVisible('Infecciones por Foco', [...FOCOS.map(f => f.label), 'sepsis']))
const showFalla         = computed(() => sectionVisible('Falla Orgánica', ORGANOS.map(o => o.label)))
const showDiagnosticos  = computed(() => sectionVisible('Diagnósticos y Egreso', ['diagnóstico', 'egreso', 'fármacos', 'fallecimiento', 'mortalidad', 'HFAV', 'hemofiltración']))

function focoVisible(label: string): boolean {
  if (!q.value) return true
  if (normalizeSearch('Infecciones por Foco').includes(q.value)) return true
  return normalizeSearch(label).includes(q.value)
}
function organoVisible(label: string): boolean {
  if (!q.value) return true
  if (normalizeSearch('Falla Orgánica').includes(q.value)) return true
  return normalizeSearch(label).includes(q.value)
}

function bool(key: keyof ClinicalData): boolean | null | 'unknown' {
  const val = store.clinicalData[key] as boolean | null
  if (val === null && store.clinicalData._unknowns.includes(key as string)) return 'unknown'
  return val
}

function setBool(key: keyof ClinicalData, value: boolean | null | 'unknown') {
  if (value === 'unknown') {
    store.setClinical(key, null as ClinicalData[typeof key])
    const u = store.clinicalData._unknowns
    if (!u.includes(key as string)) {
      store.setClinical('_unknowns', [...u, key as string] as ClinicalData['_unknowns'])
    }
  } else {
    store.setClinical(key, value as ClinicalData[typeof key])
    store.setClinical('_unknowns', store.clinicalData._unknowns.filter(k => k !== (key as string)) as ClinicalData['_unknowns'])
  }
}
function str(key: keyof ClinicalData): string {
  return (store.clinicalData[key] as string) ?? ''
}
function num(key: keyof ClinicalData): number | null {
  return store.clinicalData[key] as number | null
}
function setVal(key: keyof ClinicalData, value: unknown) {
  store.setClinical(key, value as ClinicalData[typeof key])
}
function numInput(key: keyof ClinicalData, raw: string) {
  const n = raw === '' ? null : Number(raw)
  setVal(key, isNaN(n as number) ? null : n)
}
function handleToggle(key: keyof ClinicalData, value: boolean | null | 'unknown', evidenciaKey: keyof ClinicalData) {
  setBool(key, value)
  if (value === true) {
    store.setActiveClinical(evidenciaKey)
  } else if (store.activeClinicalField === evidenciaKey) {
    // Al marcar No/? sobre el campo activo, cerrar la captura (no hay evidencia que capturar)
    store.clearActive()
  }
}

function sectionDifficulty(section: string) {
  return store.clinicalDifficulty[section]?.difficulty ?? null
}
function sectionNotes(section: string) {
  return store.clinicalDifficulty[section]?.notes ?? ''
}
</script>

<template>
  <div class="space-y-2">

    <!-- ── SOPORTE VENTILATORIO ── -->
    <section v-show="showVentilatorio" data-clinical-section="ventilatorio" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soporte Ventilatorio</span>
        <DifficultyBadge :model-value="sectionDifficulty('ventilatorio')" :notes="sectionNotes('ventilatorio')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('ventilatorio', $event)" @update:notes="store.setClinicalDifficultyNotes('ventilatorio', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2.5">
        <BaseClinicalVariable
          label="Ventilación mecánica invasiva (VMI)"
          :model-value="bool('vmi')"
          :evidencia="str('vmiEvidencia')"
          :comments="str('vmiComments')"
          :is-active="store.activeClinicalField === 'vmiEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('vmi', $event, 'vmiEvidencia')"
          @update:evidencia="setVal('vmiEvidencia', $event)"
          @update:comments="setVal('vmiComments', $event)"
          @activate="store.setActiveClinical('vmiEvidencia')"
        >
          <input
            :value="str('vmiMotivo')" :readonly="isReadOnly"
            placeholder="Motivo de la VMI…" class="field-input"
            @input="setVal('vmiMotivo', ($event.target as HTMLInputElement).value)"
          />
          <ClinicalToggle
            label="Urgencia inmediata"
            :model-value="bool('vmiUrgente')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setBool('vmiUrgente', $event)"
          />
          <ClinicalToggle
            label="Posición prono"
            :model-value="bool('vmiProno')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setBool('vmiProno', $event)"
          />
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Inicio VMI</label>
              <input
                type="date"
                :value="str('vmiInicio')"
                :disabled="isReadOnly"
                class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all border-gray-200"
                @input="setVal('vmiInicio', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Fin VMI</label>
              <input
                type="date"
                :value="str('vmiFin')"
                :disabled="isReadOnly"
                class="w-full rounded border px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-sky-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all border-gray-200"
                @input="setVal('vmiFin', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </BaseClinicalVariable>

        <BaseClinicalVariable
          label="Ventilación mecánica no invasiva (VMNI)"
          :model-value="bool('vmni')"
          :evidencia="str('vmniEvidencia')"
          :is-active="store.activeClinicalField === 'vmniEvidencia'"
          :is-read-only="isReadOnly"
          :has-comments="false"
          @update:model-value="handleToggle('vmni', $event, 'vmniEvidencia')"
          @update:evidencia="setVal('vmniEvidencia', $event)"
          @activate="store.setActiveClinical('vmniEvidencia')"
        />
      </div>
    </section>

    <!-- ── REANIMACIÓN ── -->
    <section v-show="showReanimacion" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reanimación</span>
        <DifficultyBadge :model-value="sectionDifficulty('reanimacion')" :notes="sectionNotes('reanimacion')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('reanimacion', $event)" @update:notes="store.setClinicalDifficultyNotes('reanimacion', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <div>
          <label class="field-label">Maniobras de reanimación</label>
          <textarea
            :value="str('maniobrasReanimacion')" :readonly="isReadOnly" rows="2"
            placeholder="Descripción de maniobras realizadas…" class="field-textarea"
            @input="setVal('maniobrasReanimacion', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div class="grid grid-cols-2 gap-x-3">
          <div>
            <label class="field-label">Cantidad de paros</label>
            <input
              :value="num('cantidadParos') ?? ''" :readonly="isReadOnly"
              type="number" min="0" placeholder="0" class="field-input"
              @input="numInput('cantidadParos', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="field-label">Ciclos para sacar de paro</label>
            <input
              :value="num('ciclosParo') ?? ''" :readonly="isReadOnly"
              type="number" min="0" placeholder="0" class="field-input"
              @input="numInput('ciclosParo', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── TRANSFUSIÓN ── -->
    <section v-show="showTransfusion" data-clinical-section="transfusion" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transfusión</span>
        <DifficultyBadge :model-value="sectionDifficulty('transfusion')" :notes="sectionNotes('transfusion')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('transfusion', $event)" @update:notes="store.setClinicalDifficultyNotes('transfusion', $event)" />
      </div>
      <div class="px-3 py-2">
        <BaseClinicalVariable
          label="Hubo transfusión"
          :model-value="bool('transfusion')"
          :evidencia="str('transfusionEvidencia')"
          :comments="str('transfusionComments')"
          :is-active="store.activeClinicalField === 'transfusionEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('transfusion', $event, 'transfusionEvidencia')"
          @update:evidencia="setVal('transfusionEvidencia', $event)"
          @update:comments="setVal('transfusionComments', $event)"
          @activate="store.setActiveClinical('transfusionEvidencia')"
        >
          <div>
            <label class="field-label">Unidades transfundidas</label>
            <input
              :value="num('transfusionUnidades') ?? ''" :readonly="isReadOnly"
              type="number" min="0" placeholder="0" class="field-input w-24"
              @input="numInput('transfusionUnidades', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </BaseClinicalVariable>
      </div>
    </section>

    <!-- ── DROGAS VASOACTIVAS ── -->
    <section v-show="showVasoactivas" data-clinical-section="vasoactivas" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drogas Vasoactivas</span>
        <DifficultyBadge :model-value="sectionDifficulty('vasoactivas')" :notes="sectionNotes('vasoactivas')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('vasoactivas', $event)" @update:notes="store.setClinicalDifficultyNotes('vasoactivas', $event)" />
      </div>
      <div class="px-3 py-2">
        <BaseClinicalVariable
          label="Uso de drogas vasoactivas"
          :model-value="bool('drogasVasoactivas')"
          :evidencia="str('drogasVasoactivasEvidencia')"
          :comments="str('drogasVasoactivasComments')"
          :is-active="store.activeClinicalField === 'drogasVasoactivasEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('drogasVasoactivas', $event, 'drogasVasoactivasEvidencia')"
          @update:evidencia="setVal('drogasVasoactivasEvidencia', $event)"
          @update:comments="setVal('drogasVasoactivasComments', $event)"
          @activate="store.setActiveClinical('drogasVasoactivasEvidencia')"
        >
          <ClinicalToggle
            label="Más de 1 droga vasoactiva"
            :model-value="bool('drogasVasoactivasMultiples')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setBool('drogasVasoactivasMultiples', $event)"
          />
        </BaseClinicalVariable>
      </div>
    </section>

    <!-- ── CIRUGÍAS (HOSPITALIZACIÓN) ── -->
    <section v-show="showCirugias" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cirugías en Hospitalización</span>
        <DifficultyBadge :model-value="sectionDifficulty('cirugias')" :notes="sectionNotes('cirugias')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('cirugias', $event)" @update:notes="store.setClinicalDifficultyNotes('cirugias', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <div>
          <label class="field-label">Cantidad de cirugías</label>
          <input
            :value="num('cirugiasHosp') ?? ''" :readonly="isReadOnly"
            type="number" min="0" placeholder="0" class="field-input w-24"
            @input="numInput('cirugiasHosp', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="field-label">Descripción (cuáles)</label>
          <textarea
            :value="str('cirugiasHospDescripcion')" :readonly="isReadOnly" rows="2"
            placeholder="Ej: colecistectomía laparoscópica, apendicectomía…" class="field-textarea"
            @input="setVal('cirugiasHospDescripcion', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </section>

    <!-- ── TRR ── -->
    <section v-show="showTrr" data-clinical-section="trr" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Terapia de Reemplazo Renal</span>
        <DifficultyBadge :model-value="sectionDifficulty('trr')" :notes="sectionNotes('trr')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('trr', $event)" @update:notes="store.setClinicalDifficultyNotes('trr', $event)" />
      </div>
      <div class="px-3 py-2">
        <BaseClinicalVariable
          label="Terapia de reemplazo renal (TRR)"
          :model-value="bool('trr')"
          :evidencia="str('trrEvidencia')"
          :comments="str('trrComments')"
          :is-active="store.activeClinicalField === 'trrEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('trr', $event, 'trrEvidencia')"
          @update:evidencia="setVal('trrEvidencia', $event)"
          @update:comments="setVal('trrComments', $event)"
          @activate="store.setActiveClinical('trrEvidencia')"
        >
          <div>
            <label class="field-label">Modalidad</label>
            <select
              :value="str('trrTipo')" :disabled="isReadOnly" class="field-input"
              @change="setVal('trrTipo', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— Seleccionar —</option>
              <option value="hemodiálisis_intermitente">Hemodiálisis intermitente</option>
              <option value="hemofiltración_continua_crrt">Hemofiltración continua (CRRT)</option>
              <option value="diálisis_peritoneal">Diálisis peritoneal</option>
            </select>
          </div>
        </BaseClinicalVariable>
      </div>
    </section>

    <!-- ── INFECCIONES POR FOCO ── -->
    <section v-show="showInfecciones" data-clinical-section="infecciones" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Infecciones por Foco</span>
        <DifficultyBadge :model-value="sectionDifficulty('infecciones')" :notes="sectionNotes('infecciones')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('infecciones', $event)" @update:notes="store.setClinicalDifficultyNotes('infecciones', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <BaseClinicalVariable
          v-for="foco in FOCOS"
          v-show="focoVisible(foco.label)"
          :key="foco.key"
          :label="foco.label"
          :model-value="bool(foco.key)"
          :evidencia="str(foco.evidenciaKey)"
          :comments="str(foco.commentsKey)"
          :is-active="store.activeClinicalField === foco.evidenciaKey"
          :is-read-only="isReadOnly"
          size="sm"
          @update:model-value="handleToggle(foco.key, $event, foco.evidenciaKey)"
          @update:evidencia="setVal(foco.evidenciaKey, $event)"
          @update:comments="setVal(foco.commentsKey, $event)"
          @activate="store.setActiveClinical(foco.evidenciaKey)"
        >
          <!-- Tipo específico (urinario, respiratorio) -->
          <select
            v-if="foco.tipoKey"
            :value="str(foco.tipoKey)"
            :disabled="isReadOnly"
            class="field-input mb-1.5"
            @change="setVal(foco.tipoKey!, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Tipo —</option>
            <option v-for="op in foco.tipoOpciones" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>

          <!-- Contaminación de cultivo (sangre) -->
          <div v-if="foco.contaminacionKey" class="flex items-center gap-2 mb-1.5">
            <span class="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Contaminación</span>
            <div class="flex gap-1">
              <button
                :class="['px-2 py-0.5 rounded text-[10px] font-semibold transition-colors', bool(foco.contaminacionKey) === true ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']"
                :disabled="isReadOnly"
                title="Cultivo positivo por contaminación, no infección real"
                @click.stop="setBool(foco.contaminacionKey!, bool(foco.contaminacionKey) === true ? null : true)"
              >Sí (contaminado)</button>
              <button
                :class="['px-2 py-0.5 rounded text-[10px] font-semibold transition-colors', bool(foco.contaminacionKey) === false ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']"
                :disabled="isReadOnly"
                @click.stop="setBool(foco.contaminacionKey!, bool(foco.contaminacionKey) === false ? null : false)"
              >No</button>
            </div>
          </div>

          <!-- Germen input -->
          <input
            :value="str(foco.germenKey)" :readonly="isReadOnly"
            placeholder="Germen aislado (opcional)…" class="field-input"
            @input="setVal(foco.germenKey, ($event.target as HTMLInputElement).value)"
          />
        </BaseClinicalVariable>

        <!-- ── SEPSIS (transversal) ── -->
        <div class="pt-1 border-t border-gray-100">
          <BaseClinicalVariable
            label="Sepsis"
            :model-value="bool('sepsis')"
            :evidencia="str('sepsisEvidencia')"
            :comments="str('sepsisComments')"
            :is-active="store.activeClinicalField === 'sepsisEvidencia'"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="handleToggle('sepsis', $event, 'sepsisEvidencia')"
            @update:evidencia="setVal('sepsisEvidencia', $event)"
            @update:comments="setVal('sepsisComments', $event)"
            @activate="store.setActiveClinical('sepsisEvidencia')"
          />
        </div>
      </div>
    </section>

    <!-- ── FALLA ORGÁNICA ── -->
    <section v-show="showFalla" data-clinical-section="falla" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Falla Orgánica</span>
        <DifficultyBadge :model-value="sectionDifficulty('falla_organica')" :notes="sectionNotes('falla_organica')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('falla_organica', $event)" @update:notes="store.setClinicalDifficultyNotes('falla_organica', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <BaseClinicalVariable
          v-for="organo in ORGANOS"
          v-show="organoVisible(organo.label)"
          :key="organo.key"
          :label="organo.label"
          :model-value="bool(organo.key)"
          :evidencia="str(organo.evidenciaKey)"
          :comments="str(organo.commentsKey)"
          :is-active="store.activeClinicalField === organo.evidenciaKey"
          :is-read-only="isReadOnly"
          size="sm"
          @update:model-value="handleToggle(organo.key, $event, organo.evidenciaKey)"
          @update:evidencia="setVal(organo.evidenciaKey, $event)"
          @update:comments="setVal(organo.commentsKey, $event)"
          @activate="store.setActiveClinical(organo.evidenciaKey)"
        >
          <!-- Descripcion input (for 'Otra') -->
          <input
            v-if="organo.descripcionKey"
            :value="str(organo.descripcionKey)" :readonly="isReadOnly"
            placeholder="¿Qué órgano? (especifique)…" class="field-input"
            @input="setVal(organo.descripcionKey!, ($event.target as HTMLInputElement).value)"
          />
        </BaseClinicalVariable>
      </div>
    </section>

    <!-- ── VARIABLES DE REINGRESO Y SECUELAS UCI ── -->
    <section v-show="showUci" data-clinical-section="uci" class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variables UCI</span>
        <DifficultyBadge :model-value="sectionDifficulty('uci')" :notes="sectionNotes('uci')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('uci', $event)" @update:notes="store.setClinicalDifficultyNotes('uci', $event)" />
      </div>
      <div class="px-3 py-2 space-y-3">
        <!-- Reingreso UCI -->
        <ClinicalToggle
          label="¿Presentó reingreso a la UCI?"
          :model-value="bool('reingresoUci')"
          :is-read-only="isReadOnly"
          @update:model-value="setBool('reingresoUci', $event)"
        />

        <!-- Secuelas UCI (Selección Múltiple) -->
        <div class="border-t border-gray-100 pt-2">
          <span class="block text-[11px] font-semibold text-gray-500 mb-1.5">Secuelas críticas desarrolladas:</span>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                :checked="bool('secuelaNeuropatia') === true"
                :disabled="isReadOnly"
                class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                @change="setBool('secuelaNeuropatia', ($event.target as HTMLInputElement).checked)"
              />
              Neuropatía del paciente crítico
            </label>
            <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                :checked="bool('secuelaMiopatia') === true"
                :disabled="isReadOnly"
                class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                @change="setBool('secuelaMiopatia', ($event.target as HTMLInputElement).checked)"
              />
              Miopatía del paciente crítico
            </label>
            <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                :checked="bool('secuelaDesnutricion') === true"
                :disabled="isReadOnly"
                class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                @change="setBool('secuelaDesnutricion', ($event.target as HTMLInputElement).checked)"
              />
              Desnutrición severa
            </label>
            <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                :checked="bool('secuelaOtras') === true"
                :disabled="isReadOnly"
                class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                @change="setBool('secuelaOtras', ($event.target as HTMLInputElement).checked)"
              />
              Otras secuelas
            </label>
            <div v-if="bool('secuelaOtras') === true" class="pl-6 pt-0.5">
              <input
                :value="str('secuelaOtrasTexto')"
                :readonly="isReadOnly"
                placeholder="Especifique otras secuelas…"
                class="field-input"
                @input="setVal('secuelaOtrasTexto', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── DIAGNÓSTICOS Y EGRESO ── -->
    <section v-show="showDiagnosticos" data-clinical-section="diagnosticos" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnósticos y Egreso</span>
        <DifficultyBadge :model-value="sectionDifficulty('diagnosticos')" :notes="sectionNotes('diagnosticos')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('diagnosticos', $event)" @update:notes="store.setClinicalDifficultyNotes('diagnosticos', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <div>
          <label class="field-label">Diagnóstico de ingreso</label>
          <textarea
            :value="str('diagnosticoIngreso')" :readonly="isReadOnly" rows="2"
            placeholder="Diagnóstico principal al momento de ingresar…" class="field-textarea"
            @input="setVal('diagnosticoIngreso', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div>
          <label class="field-label">Diagnóstico de egreso</label>
          <textarea
            :value="str('diagnosticoEgreso')" :readonly="isReadOnly" rows="2"
            placeholder="Diagnóstico principal al momento del alta…" class="field-textarea"
            @input="setVal('diagnosticoEgreso', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div>
          <label class="field-label">Fármacos suministrados durante hospitalización</label>
          <textarea
            :value="str('farmacosHosp')" :readonly="isReadOnly" rows="3"
            placeholder="Lista de fármacos administrados…" class="field-textarea"
            @input="setVal('farmacosHosp', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <BaseClinicalVariable
          label="Fallecimiento"
          :model-value="bool('fallecimiento')"
          :evidencia="str('fallecimientoEvidencia')"
          :comments="str('fallecimientoComments')"
          :is-active="store.activeClinicalField === 'fallecimientoEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('fallecimiento', $event, 'fallecimientoEvidencia')"
          @update:evidencia="setVal('fallecimientoEvidencia', $event)"
          @update:comments="setVal('fallecimientoComments', $event)"
          @activate="store.setActiveClinical('fallecimientoEvidencia')"
        />
        <BaseClinicalVariable
          label="Hemofiltración de alto volumen (HFAV)"
          :model-value="bool('hfav')"
          :evidencia="str('hfavEvidencia')"
          :comments="str('hfavComments')"
          :is-active="store.activeClinicalField === 'hfavEvidencia'"
          :is-read-only="isReadOnly"
          @update:model-value="handleToggle('hfav', $event, 'hfavEvidencia')"
          @update:evidencia="setVal('hfavEvidencia', $event)"
          @update:comments="setVal('hfavComments', $event)"
          @activate="store.setActiveClinical('hfavEvidencia')"
        />
      </div>
    </section>

  </div>
</template>


<style scoped>
.field-label {
  @apply block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1;
}
.field-input {
  @apply w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50;
}
.field-textarea {
  @apply w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50;
}
</style>
