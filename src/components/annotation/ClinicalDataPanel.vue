<script setup lang="ts">
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'
import ClinicalToggle from './ClinicalToggle.vue'

defineProps<{ isReadOnly?: boolean }>()

const store = useAnnotationStore()

interface FocoMeta {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  germenKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
}

interface OrganMeta {
  key: keyof ClinicalData
  label: string
  evidenciaKey: keyof ClinicalData
  commentsKey: keyof ClinicalData
  descripcionKey?: keyof ClinicalData
}

const FOCOS: FocoMeta[] = [
  { key: 'infeccionUrinario',         label: 'Urinario',               evidenciaKey: 'infeccionUrinarioEvidencia',         germenKey: 'infeccionUrinarioGermen',         commentsKey: 'infeccionUrinarioComments' },
  { key: 'infeccionRespiratorio',     label: 'Respiratorio',           evidenciaKey: 'infeccionRespiratorioEvidencia',     germenKey: 'infeccionRespiratorioGermen',     commentsKey: 'infeccionRespiratorioComments' },
  { key: 'infeccionVascular',         label: 'Vascular',               evidenciaKey: 'infeccionVascularEvidencia',         germenKey: 'infeccionVascularGermen',         commentsKey: 'infeccionVascularComments' },
  { key: 'infeccionSangre',           label: 'Sangre',                 evidenciaKey: 'infeccionSangreEvidencia',           germenKey: 'infeccionSangreGermen',           commentsKey: 'infeccionSangreComments' },
  { key: 'infeccionCerebral',         label: 'Cerebral',               evidenciaKey: 'infeccionCerebralEvidencia',         germenKey: 'infeccionCerebralGermen',         commentsKey: 'infeccionCerebralComments' },
  { key: 'infeccionCardiaco',         label: 'Cardíaco',               evidenciaKey: 'infeccionCardiacoEvidencia',         germenKey: 'infeccionCardiacoGermen',         commentsKey: 'infeccionCardiacoComments' },
  { key: 'infeccionQuirurgico',       label: 'Quirúrgico',             evidenciaKey: 'infeccionQuirurgicoEvidencia',       germenKey: 'infeccionQuirurgicoGermen',       commentsKey: 'infeccionQuirurgicoComments' },
  { key: 'infeccionGastrointestinal', label: 'Gastrointestinal',       evidenciaKey: 'infeccionGastrointestinalEvidencia', germenKey: 'infeccionGastrointestinalGermen', commentsKey: 'infeccionGastrointestinalComments' },
  { key: 'infeccionPielTejidos',      label: 'Piel y tejidos blandos', evidenciaKey: 'infeccionPielTejidosEvidencia',      germenKey: 'infeccionPielTejidosGermen',      commentsKey: 'infeccionPielTejidosComments' },
]

const ORGANOS: OrganMeta[] = [
  { key: 'fallaRenal',    label: 'Renal',    evidenciaKey: 'fallaRenalEvidencia', commentsKey: 'fallaRenalComments' },
  { key: 'fallaNervioso', label: 'Nervioso', evidenciaKey: 'fallaNerviosoEvidencia', commentsKey: 'fallaNerviosoComments' },
  { key: 'fallaVascular', label: 'Vascular', evidenciaKey: 'fallaVascularEvidencia', commentsKey: 'fallaVascularComments' },
  { key: 'fallaCardiaco', label: 'Cardíaco', evidenciaKey: 'fallaCardiacoEvidencia', commentsKey: 'fallaCardiacoComments' },
  { key: 'fallaPulmonar', label: 'Pulmonar', evidenciaKey: 'fallaPulmonarEvidencia', commentsKey: 'fallaPulmonarComments' },
  { key: 'fallaHepatico', label: 'Hepático', evidenciaKey: 'fallaHepaticoEvidencia', commentsKey: 'fallaHepaticoComments' },
  { key: 'fallaOtra',     label: 'Otra',     evidenciaKey: 'fallaOtraEvidencia', commentsKey: 'fallaOtraComments', descripcionKey: 'fallaOtraDescripcion' },
]

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
function numInput(key: keyof ClinicalData, raw: string) {
  const n = raw === '' ? null : Number(raw)
  setVal(key, isNaN(n as number) ? null : n)
}
function handleToggle(key: keyof ClinicalData, value: boolean | null, evidenciaKey: keyof ClinicalData) {
  setVal(key, value)
  if (value === true) {
    store.setActiveClinical(evidenciaKey)
  }
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
        <ClinicalToggle
          label="Ventilación mecánica invasiva (VMI)"
          :model-value="bool('vmi')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('vmi', $event)"
        >
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
          <ClinicalToggle
            label="Urgencia inmediata"
            :model-value="bool('vmiUrgente')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setVal('vmiUrgente', $event)"
          />
          <ClinicalToggle
            label="Posición prono"
            :model-value="bool('vmiProno')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setVal('vmiProno', $event)"
          />
        </ClinicalToggle>
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
      <div class="px-3 py-2">
        <ClinicalToggle
          label="Hubo transfusión"
          :model-value="bool('transfusion')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('transfusion', $event)"
        >
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
        </ClinicalToggle>
      </div>
    </section>

    <!-- ── DROGAS VASOACTIVAS ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drogas Vasoactivas</span>
      </div>
      <div class="px-3 py-2">
        <ClinicalToggle
          label="Uso de drogas vasoactivas"
          :model-value="bool('drogasVasoactivas')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('drogasVasoactivas', $event)"
        >
          <textarea
            :value="str('drogasVasoactivasEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
            @input="setVal('drogasVasoactivasEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
          <ClinicalToggle
            label="Más de 1 droga vasoactiva"
            :model-value="bool('drogasVasoactivasMultiples')"
            :is-read-only="isReadOnly"
            size="sm"
            @update:model-value="setVal('drogasVasoactivasMultiples', $event)"
          />
        </ClinicalToggle>
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
      <div class="px-3 py-2">
        <ClinicalToggle
          label="Terapia de reemplazo renal (TRR)"
          :model-value="bool('trr')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('trr', $event)"
        >
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
        </ClinicalToggle>
      </div>
    </section>

    <!-- ── INFECCIONES POR FOCO ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Infecciones por Foco</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <ClinicalToggle
          v-for="foco in FOCOS"
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
            <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
              Tu evidencia (ground truth)
            </label>
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
      </div>
    </section>

    <!-- ── FALLA ORGÁNICA ── -->
    <section class="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Falla Orgánica</span>
      </div>
      <div class="px-3 py-2 space-y-2">
        <ClinicalToggle
          v-for="organo in ORGANOS"
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
            <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
              Tu evidencia (ground truth)
            </label>
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
        <ClinicalToggle
          label="Mortalidad"
          :model-value="bool('mortalidad')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('mortalidad', $event)"
        >
          <textarea
            :value="str('mortalidadEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
            @input="setVal('mortalidadEvidencia', ($event.target as HTMLTextAreaElement).value)"
          />
        </ClinicalToggle>
        <ClinicalToggle
          label="Hemofiltración de alto volumen (HFAV)"
          :model-value="bool('hfav')"
          :is-read-only="isReadOnly"
          @update:model-value="setVal('hfav', $event)"
        >
          <textarea
            :value="str('hfavEvidencia')" :readonly="isReadOnly" rows="2"
            placeholder="Fragmento de evidencia del documento…" class="field-textarea"
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
