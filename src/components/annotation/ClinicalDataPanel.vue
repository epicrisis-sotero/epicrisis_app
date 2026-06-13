<script setup lang="ts">
import { computed } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'
import ClinicalToggle from './ClinicalToggle.vue'
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

const showVentilatorio  = computed(() => sectionVisible('Soporte Ventilatorio', ['Ventilación mecánica invasiva', 'VMI', 'prono', 'urgencia']))
const showReanimacion   = computed(() => sectionVisible('Reanimación', ['reanimación', 'paros', 'ciclos']))
const showTransfusion   = computed(() => sectionVisible('Transfusión', ['transfusión', 'unidades']))
const showVasoactivas   = computed(() => sectionVisible('Drogas Vasoactivas', ['drogas vasoactivas']))
const showCirugias      = computed(() => sectionVisible('Cirugías en Hospitalización', ['cirugía', 'cirugías', 'hospitalización']))
const showTrr           = computed(() => sectionVisible('Terapia de Reemplazo Renal', ['terapia reemplazo renal', 'TRR', 'hemodiálisis', 'hemofiltración', 'diálisis']))
const showInfecciones   = computed(() => sectionVisible('Infecciones por Foco', [...FOCOS.map(f => f.label), 'sepsis']))
const showFalla         = computed(() => sectionVisible('Falla Orgánica', ORGANOS.map(o => o.label)))
const showDiagnosticos  = computed(() => sectionVisible('Diagnósticos y Egreso', ['diagnóstico', 'egreso', 'fármacos', 'mortalidad', 'HFAV', 'hemofiltración']))

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
        <ClinicalToggle
          label="Ventilación mecánica invasiva (VMI)"
          :model-value="bool('vmi')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('vmiEvidencia')"
          @update:model-value="handleToggle('vmi', $event, 'vmiEvidencia')"
        >
          <textarea
            :value="str('vmiEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'vmiEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('vmiEvidencia')"
            @input="setVal('vmiEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
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
        </ClinicalToggle>
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
        <ClinicalToggle
          label="Hubo transfusión"
          :model-value="bool('transfusion')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('transfusionEvidencia')"
          @update:model-value="handleToggle('transfusion', $event, 'transfusionEvidencia')"
        >
          <textarea
            :value="str('transfusionEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'transfusionEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('transfusionEvidencia')"
            @input="setVal('transfusionEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
          <div>
            <label class="field-label">Unidades transfundidas</label>
            <input
              :value="num('transfusionUnidades') ?? ''" :readonly="isReadOnly"
              type="number" min="0" placeholder="0" class="field-input w-24"
              @input="numInput('transfusionUnidades', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </ClinicalToggle>
      </div>
    </section>

    <!-- ── DROGAS VASOACTIVAS ── -->
    <section v-show="showVasoactivas" data-clinical-section="vasoactivas" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drogas Vasoactivas</span>
        <DifficultyBadge :model-value="sectionDifficulty('vasoactivas')" :notes="sectionNotes('vasoactivas')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('vasoactivas', $event)" @update:notes="store.setClinicalDifficultyNotes('vasoactivas', $event)" />
      </div>
      <div class="px-3 py-2">
        <ClinicalToggle
          label="Uso de drogas vasoactivas"
          :model-value="bool('drogasVasoactivas')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('drogasVasoactivasEvidencia')"
          @update:model-value="handleToggle('drogasVasoactivas', $event, 'drogasVasoactivasEvidencia')"
        >
          <textarea
            :value="str('drogasVasoactivasEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'drogasVasoactivasEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('drogasVasoactivasEvidencia')"
            @input="setVal('drogasVasoactivasEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
          <ClinicalToggle
            label="Más de 1 droga vasoactiva"
            :model-value="bool('drogasVasoactivasMultiples')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setBool('drogasVasoactivasMultiples', $event)"
          />
        </ClinicalToggle>
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
        <ClinicalToggle
          label="Terapia de reemplazo renal (TRR)"
          :model-value="bool('trr')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('trrEvidencia')"
          @update:model-value="handleToggle('trr', $event, 'trrEvidencia')"
        >
          <textarea
            :value="str('trrEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'trrEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('trrEvidencia')"
            @input="setVal('trrEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
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
        </ClinicalToggle>
      </div>
    </section>

    <!-- ── INFECCIONES POR FOCO ── -->
    <section v-show="showInfecciones" data-clinical-section="infecciones" data-capture-zone class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Infecciones por Foco</span>
        <DifficultyBadge :model-value="sectionDifficulty('infecciones')" :notes="sectionNotes('infecciones')" :is-read-only="isReadOnly" @update:model-value="store.setClinicalDifficulty('infecciones', $event)" @update:notes="store.setClinicalDifficultyNotes('infecciones', $event)" />
      </div>
      <div class="px-3 py-2 space-y-2">
        <ClinicalToggle
          v-for="foco in FOCOS"
          v-show="focoVisible(foco.label)"
          :key="foco.key"
          :label="foco.label"
          :model-value="bool(foco.key)"
          :is-read-only="isReadOnly"
          size="sm"
          class="p-2 rounded-lg border transition-all cursor-pointer"
          :class="store.activeClinicalField === foco.evidenciaKey
            ? 'border-brand-400 bg-brand-50 shadow-sm'
            : 'border-gray-100 bg-white hover:border-gray-200'"
          @click="store.setActiveClinical(foco.evidenciaKey)"
          @update:model-value="handleToggle(foco.key, $event, foco.evidenciaKey)"
        >
          <!-- Evidence field -->
          <div class="mb-2 mt-1.5">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Tu evidencia (ground truth)
              </label>
              <button
                v-if="str(foco.evidenciaKey) && !isReadOnly"
                class="text-[10px] text-gray-400 hover:text-red-500 transition-colors leading-none"
                title="Limpiar evidencia capturada"
                @click.stop="setVal(foco.evidenciaKey, '')"
              >✕ limpiar</button>
            </div>
            <div
              :class="[
                'min-h-[32px] rounded border px-2 py-1.5 text-xs font-mono leading-relaxed',
                str(foco.evidenciaKey)
                  ? 'bg-yellow-50 border-yellow-300 text-gray-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400 italic',
              ]"
            >
              {{ str(foco.evidenciaKey) || 'Selecciona texto en el documento y presiona "Capturar"' }}
            </div>
          </div>

          <!-- Tipo específico (urinario, respiratorio) -->
          <select
            v-if="foco.tipoKey && bool(foco.key) === true"
            :value="str(foco.tipoKey)"
            :disabled="isReadOnly"
            class="field-input mb-2"
            @change="setVal(foco.tipoKey!, ($event.target as HTMLSelectElement).value)"
            @click.stop
          >
            <option value="">— Tipo —</option>
            <option v-for="op in foco.tipoOpciones" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>

          <!-- Contaminación de cultivo (sangre) -->
          <div v-if="foco.contaminacionKey && bool(foco.key) === true" class="flex items-center gap-2 mb-2" @click.stop>
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
            placeholder="Germen aislado (opcional)…" class="field-input mb-2"
            @input="setVal(foco.germenKey, ($event.target as HTMLInputElement).value)"
            @click.stop
          />

          <!-- Comments field -->
          <div v-if="store.activeClinicalField === foco.evidenciaKey" class="mt-2">
            <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
              Comentarios <span class="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              :value="str(foco.commentsKey)"
              :readonly="isReadOnly"
              rows="2"
              placeholder="Ej: texto ambiguo, sigla no estándar…"
              class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white"
              @input="setVal(foco.commentsKey, ($event.target as HTMLTextAreaElement).value)"
              @click.stop
            />
          </div>
        </ClinicalToggle>

        <!-- ── SEPSIS (transversal) ── -->
        <div class="pt-1 border-t border-gray-100">
          <ClinicalToggle
            label="Sepsis"
            :model-value="bool('sepsis')"
            :is-read-only="isReadOnly"
            size="sm"
            class="p-2 rounded-lg border transition-all cursor-pointer"
            :class="store.activeClinicalField === 'sepsisEvidencia'
              ? 'border-brand-400 bg-brand-50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'"
            @click="store.setActiveClinical('sepsisEvidencia')"
            @update:model-value="handleToggle('sepsis', $event, 'sepsisEvidencia')"
          >
            <div class="mb-2 mt-1.5">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Tu evidencia (ground truth)</label>
                <button
                  v-if="str('sepsisEvidencia') && !isReadOnly"
                  class="text-[10px] text-gray-400 hover:text-red-500 transition-colors leading-none"
                  @click.stop="setVal('sepsisEvidencia', '')"
                >✕ limpiar</button>
              </div>
              <div :class="['min-h-[32px] rounded border px-2 py-1.5 text-xs font-mono leading-relaxed', str('sepsisEvidencia') ? 'bg-yellow-50 border-yellow-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-400 italic']">
                {{ str('sepsisEvidencia') || 'Selecciona texto en el documento y presiona "Capturar"' }}
              </div>
            </div>
            <div v-if="store.activeClinicalField === 'sepsisEvidencia'" class="mt-2">
              <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Comentarios <span class="normal-case font-normal">(opcional)</span></label>
              <textarea
                :value="str('sepsisComments')"
                :readonly="isReadOnly"
                rows="2"
                placeholder="Ej: sepsis de origen desconocido, criterios SOFA…"
                class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white"
                @input="setVal('sepsisComments', ($event.target as HTMLTextAreaElement).value)"
                @click.stop
              />
            </div>
          </ClinicalToggle>
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
        <ClinicalToggle
          v-for="organo in ORGANOS"
          v-show="organoVisible(organo.label)"
          :key="organo.key"
          :label="organo.label"
          :model-value="bool(organo.key)"
          :is-read-only="isReadOnly"
          size="sm"
          class="p-2 rounded-lg border transition-all cursor-pointer"
          :class="store.activeClinicalField === organo.evidenciaKey
            ? 'border-brand-400 bg-brand-50 shadow-sm'
            : 'border-gray-100 bg-white hover:border-gray-200'"
          @click="store.setActiveClinical(organo.evidenciaKey)"
          @update:model-value="handleToggle(organo.key, $event, organo.evidenciaKey)"
        >
          <!-- Evidence field -->
          <div class="mb-2 mt-1.5">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Tu evidencia (ground truth)
              </label>
              <button
                v-if="str(organo.evidenciaKey) && !isReadOnly"
                class="text-[10px] text-gray-400 hover:text-red-500 transition-colors leading-none"
                title="Limpiar evidencia capturada"
                @click.stop="setVal(organo.evidenciaKey, '')"
              >✕ limpiar</button>
            </div>
            <div
              :class="[
                'min-h-[32px] rounded border px-2 py-1.5 text-xs font-mono leading-relaxed',
                str(organo.evidenciaKey)
                  ? 'bg-yellow-50 border-yellow-300 text-gray-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400 italic',
              ]"
            >
              {{ str(organo.evidenciaKey) || 'Selecciona texto en el documento y presiona "Capturar"' }}
            </div>
          </div>

          <!-- Descripcion input (for 'Otra') -->
          <input
            v-if="organo.descripcionKey"
            :value="str(organo.descripcionKey)" :readonly="isReadOnly"
            placeholder="¿Qué órgano? (especifique)…" class="field-input mb-2"
            @input="setVal(organo.descripcionKey!, ($event.target as HTMLInputElement).value)"
            @click.stop
          />

          <!-- Comments field -->
          <div v-if="store.activeClinicalField === organo.evidenciaKey" class="mt-2">
            <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
              Comentarios <span class="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              :value="str(organo.commentsKey)"
              :readonly="isReadOnly"
              rows="2"
              placeholder="Ej: texto ambiguo, sigla no estándar…"
              class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white"
              @input="setVal(organo.commentsKey, ($event.target as HTMLTextAreaElement).value)"
              @click.stop
            />
          </div>
        </ClinicalToggle>
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
        <ClinicalToggle
          label="Mortalidad"
          :model-value="bool('mortalidad')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('mortalidadEvidencia')"
          @update:model-value="handleToggle('mortalidad', $event, 'mortalidadEvidencia')"
        >
          <textarea
            :value="str('mortalidadEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'mortalidadEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('mortalidadEvidencia')"
            @input="setVal('mortalidadEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
        </ClinicalToggle>
        <ClinicalToggle
          label="Hemofiltración de alto volumen (HFAV)"
          :model-value="bool('hfav')"
          :is-read-only="isReadOnly"
          @click="store.setActiveClinical('hfavEvidencia')"
          @update:model-value="handleToggle('hfav', $event, 'hfavEvidencia')"
        >
          <textarea
            :value="str('hfavEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Selecciona texto en el documento y captura, o escribe…" class="field-textarea"
            :class="store.activeClinicalField === 'hfavEvidencia' ? 'ring-2 ring-brand-100 border-brand-500' : ''"
            @focus="store.setActiveClinical('hfavEvidencia')"
            @input="setVal('hfavEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
        </ClinicalToggle>
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
