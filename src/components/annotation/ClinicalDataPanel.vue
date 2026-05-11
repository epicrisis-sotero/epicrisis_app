<script setup lang="ts">
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'

defineProps<{ isReadOnly?: boolean }>()

const store = useAnnotationStore()

interface FocoMeta {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  germenKey: keyof ClinicalData
}

interface OrganMeta {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  descripcionKey?: keyof ClinicalData
}

const FOCOS: FocoMeta[] = [
  { key: 'infeccionUrinario',         label: 'Urinario',               evidenciaKey: 'infeccionUrinarioEvidencia',         germenKey: 'infeccionUrinarioGermen' },
  { key: 'infeccionRespiratorio',     label: 'Respiratorio',           evidenciaKey: 'infeccionRespiratorioEvidencia',     germenKey: 'infeccionRespiratorioGermen' },
  { key: 'infeccionVascular',         label: 'Vascular',               evidenciaKey: 'infeccionVascularEvidencia',         germenKey: 'infeccionVascularGermen' },
  { key: 'infeccionSangre',           label: 'Sangre',                 evidenciaKey: 'infeccionSangreEvidencia',           germenKey: 'infeccionSangreGermen' },
  { key: 'infeccionCerebral',         label: 'Cerebral',               evidenciaKey: 'infeccionCerebralEvidencia',         germenKey: 'infeccionCerebralGermen' },
  { key: 'infeccionCardiaco',         label: 'Cardíaco',               evidenciaKey: 'infeccionCardiacoEvidencia',         germenKey: 'infeccionCardiacoGermen' },
  { key: 'infeccionQuirurgico',       label: 'Quirúrgico',             evidenciaKey: 'infeccionQuirurgicoEvidencia',       germenKey: 'infeccionQuirurgicoGermen' },
  { key: 'infeccionGastrointestinal', label: 'Gastrointestinal',       evidenciaKey: 'infeccionGastrointestinalEvidencia', germenKey: 'infeccionGastrointestinalGermen' },
  { key: 'infeccionPielTejidos',      label: 'Piel y tejidos blandos', evidenciaKey: 'infeccionPielTejidosEvidencia',      germenKey: 'infeccionPielTejidosGermen' },
]

const ORGANOS: OrganMeta[] = [
  { key: 'fallaRenal',    label: 'Renal',    evidenciaKey: 'fallaRenalEvidencia' },
  { key: 'fallaNervioso', label: 'Nervioso', evidenciaKey: 'fallaNerviosoEvidencia' },
  { key: 'fallaVascular', label: 'Vascular', evidenciaKey: 'fallaVascularEvidencia' },
  { key: 'fallaCardiaco', label: 'Cardíaco', evidenciaKey: 'fallaCardiacoEvidencia' },
  { key: 'fallaPulmonar', label: 'Pulmonar', evidenciaKey: 'fallaPulmonarEvidencia' },
  { key: 'fallaHepatico', label: 'Hepático', evidenciaKey: 'fallaHepaticoEvidencia' },
  { key: 'fallaOtra',     label: 'Otra',     evidenciaKey: 'fallaOtraEvidencia', descripcionKey: 'fallaOtraDescripcion' },
]

function btnClass(current: boolean | null, value: boolean) {
  const active = current === value
  return [
    'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
    active && value  ? 'bg-green-500 text-white' : '',
    active && !value ? 'bg-red-500 text-white'   : '',
    !active          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : '',
  ]
}

function bool(key: keyof ClinicalData): boolean | null {
  return store.clinicalData[key] as boolean | null
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
function toggle(key: keyof ClinicalData, value: boolean) {
  setVal(key, store.clinicalData[key] === value ? null : value)
}
function numInput(key: keyof ClinicalData, raw: string) {
  const n = raw === '' ? null : Number(raw)
  setVal(key, isNaN(n as number) ? null : n)
}
</script>

<template>
  <div class="space-y-2">

    <!-- ── SOPORTE VENTILATORIO ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soporte Ventilatorio</span>
      </div>
      <div class="px-3 py-2 space-y-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-gray-700 font-medium">Ventilación mecánica invasiva (VMI)</span>
            <div class="flex gap-1 flex-shrink-0" @click.stop>
              <button :class="btnClass(bool('vmi'), true)"  :disabled="isReadOnly" @click="toggle('vmi', true)">Sí</button>
              <button :class="btnClass(bool('vmi'), false)" :disabled="isReadOnly" @click="toggle('vmi', false)">No</button>
            </div>
          </div>
          <div v-if="bool('vmi') === true" class="mt-1.5 space-y-1.5">
            <textarea
              :value="str('vmiEvidencia')" :readonly="isReadOnly" rows="2"
              placeholder="Fragmento de evidencia del documento…" class="field-textarea"
              @input="setVal('vmiEvidencia', ($event.target as HTMLTextAreaElement).value)"
            />
            <input
              :value="str('vmiMotivo')" :readonly="isReadOnly"
              placeholder="Motivo de la VMI…" class="field-input"
              @input="setVal('vmiMotivo', ($event.target as HTMLInputElement).value)"
            />
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-600">Urgencia</span>
              <div class="flex gap-1">
                <button :class="btnClass(bool('vmiUrgente'), true)"  :disabled="isReadOnly" @click="toggle('vmiUrgente', true)">Inmediata</button>
                <button :class="btnClass(bool('vmiUrgente'), false)" :disabled="isReadOnly" @click="toggle('vmiUrgente', false)">Planificada</button>
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-600">Posición prono</span>
              <div class="flex gap-1">
                <button :class="btnClass(bool('vmiProno'), true)"  :disabled="isReadOnly" @click="toggle('vmiProno', true)">Sí</button>
                <button :class="btnClass(bool('vmiProno'), false)" :disabled="isReadOnly" @click="toggle('vmiProno', false)">No</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── REANIMACIÓN ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reanimación</span>
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
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transfusión</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-700 font-medium">Hubo transfusión</span>
          <div class="flex gap-1">
            <button :class="btnClass(bool('transfusion'), true)"  :disabled="isReadOnly" @click="toggle('transfusion', true)">Sí</button>
            <button :class="btnClass(bool('transfusion'), false)" :disabled="isReadOnly" @click="toggle('transfusion', false)">No</button>
          </div>
        </div>
        <template v-if="bool('transfusion') === true">
          <textarea
            :value="str('transfusionEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
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
        </template>
      </div>
    </section>

    <!-- ── DROGAS VASOACTIVAS ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drogas Vasoactivas</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-700 font-medium">Uso de drogas vasoactivas</span>
          <div class="flex gap-1">
            <button :class="btnClass(bool('drogasVasoactivas'), true)"  :disabled="isReadOnly" @click="toggle('drogasVasoactivas', true)">Sí</button>
            <button :class="btnClass(bool('drogasVasoactivas'), false)" :disabled="isReadOnly" @click="toggle('drogasVasoactivas', false)">No</button>
          </div>
        </div>
        <template v-if="bool('drogasVasoactivas') === true">
          <textarea
            :value="str('drogasVasoactivasEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
            @input="setVal('drogasVasoactivasEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-gray-600">Más de 1 droga vasoactiva</span>
            <div class="flex gap-1">
              <button :class="btnClass(bool('drogasVasoactivasMultiples'), true)"  :disabled="isReadOnly" @click="toggle('drogasVasoactivasMultiples', true)">Sí</button>
              <button :class="btnClass(bool('drogasVasoactivasMultiples'), false)" :disabled="isReadOnly" @click="toggle('drogasVasoactivasMultiples', false)">No</button>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ── CIRUGÍAS (HOSPITALIZACIÓN) ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cirugías en Hospitalización</span>
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
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Terapia de Reemplazo Renal</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-700 font-medium">Terapia de reemplazo renal (TRR)</span>
          <div class="flex gap-1">
            <button :class="btnClass(bool('trr'), true)"  :disabled="isReadOnly" @click="toggle('trr', true)">Sí</button>
            <button :class="btnClass(bool('trr'), false)" :disabled="isReadOnly" @click="toggle('trr', false)">No</button>
          </div>
        </div>
        <template v-if="bool('trr') === true">
          <textarea
            :value="str('trrEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
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
        </template>
      </div>
    </section>

    <!-- ── INFECCIONES POR FOCO ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Infecciones por Foco</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <template v-for="foco in FOCOS" :key="foco.key">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-600 font-medium">{{ foco.label }}</span>
              <div class="flex gap-1 flex-shrink-0">
                <button :class="btnClass(bool(foco.key), true)"  :disabled="isReadOnly" @click="toggle(foco.key, true)">Sí</button>
                <button :class="btnClass(bool(foco.key), false)" :disabled="isReadOnly" @click="toggle(foco.key, false)">No</button>
              </div>
            </div>
            <div v-if="bool(foco.key) === true" class="mt-1.5 space-y-1.5 pl-0">
              <textarea
                :value="str(foco.evidenciaKey)" :readonly="isReadOnly" rows="2"
                placeholder="Fragmento de evidencia del documento…" class="field-textarea"
                @input="setVal(foco.evidenciaKey, ($event.target as HTMLTextAreaElement).value)"
              />
              <input
                :value="str(foco.germenKey)" :readonly="isReadOnly"
                placeholder="Germen aislado (opcional)…" class="field-input"
                @input="setVal(foco.germenKey, ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ── FALLA ORGÁNICA ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Falla Orgánica</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <template v-for="organo in ORGANOS" :key="organo.key">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-600 font-medium">{{ organo.label }}</span>
              <div class="flex gap-1 flex-shrink-0">
                <button :class="btnClass(bool(organo.key), true)"  :disabled="isReadOnly" @click="toggle(organo.key, true)">Sí</button>
                <button :class="btnClass(bool(organo.key), false)" :disabled="isReadOnly" @click="toggle(organo.key, false)">No</button>
              </div>
            </div>
            <div v-if="bool(organo.key) === true" class="mt-1.5 space-y-1.5">
              <textarea
                :value="str(organo.evidenciaKey)" :readonly="isReadOnly" rows="2"
                placeholder="Fragmento de evidencia del documento…" class="field-textarea"
                @input="setVal(organo.evidenciaKey, ($event.target as HTMLTextAreaElement).value)"
              />
              <input
                v-if="organo.descripcionKey"
                :value="str(organo.descripcionKey)" :readonly="isReadOnly"
                placeholder="¿Qué órgano? (especifique)…" class="field-input"
                @input="setVal(organo.descripcionKey!, ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ── DIAGNÓSTICOS Y EGRESO ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diagnósticos y Egreso</span>
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
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-700 font-medium">Mortalidad</span>
          <div class="flex gap-1">
            <button :class="btnClass(bool('mortalidad'), true)"  :disabled="isReadOnly" @click="toggle('mortalidad', true)">Sí</button>
            <button :class="btnClass(bool('mortalidad'), false)" :disabled="isReadOnly" @click="toggle('mortalidad', false)">No</button>
          </div>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-700 font-medium">Hemofiltración de alto volumen (HFAV)</span>
          <div class="flex gap-1">
            <button :class="btnClass(bool('hfav'), true)"  :disabled="isReadOnly" @click="toggle('hfav', true)">Sí</button>
            <button :class="btnClass(bool('hfav'), false)" :disabled="isReadOnly" @click="toggle('hfav', false)">No</button>
          </div>
        </div>
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
