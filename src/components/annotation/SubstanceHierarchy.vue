<script setup lang="ts">
import { computed } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'

defineProps<{ isReadOnly?: boolean }>()

const store = useAnnotationStore()
const d = computed(() => store.clinicalData)

// El gate de cada sustancia es el CRITERIO (consumo_tabaco/alcohol/otras), no un
// toggle propio: este panel solo muestra el DETALLE/carga cuando el criterio = Sí.
function critYes(name: string): boolean {
  return store.criteria.find(c => c.criterionName === name)?.isPresent === true
}
const tabaco = computed(() => critYes('consumo_tabaco') || d.value.consumoTabaco === true)
const alcohol = computed(() => critYes('consumo_alcohol') || d.value.consumoAlcohol === true)
const otras = computed(() => critYes('consumo_otras') || d.value.consumoOtrasDrogas === true)
const anyYes = computed(() => tabaco.value || alcohol.value || otras.value)

function set<K extends keyof ClinicalData>(key: K, value: ClinicalData[K]) {
  store.setClinical(key, value)
}

function numInput(key: 'consumoTabacoCigarrillosDia' | 'consumoTabacoAnios', raw: string) {
  const n = raw === '' ? null : Number(raw)
  set(key, n)
  recalcIpa(key === 'consumoTabacoCigarrillosDia' ? n : d.value.consumoTabacoCigarrillosDia,
             key === 'consumoTabacoAnios'          ? n : d.value.consumoTabacoAnios)
}

function recalcIpa(cig: number | null, anos: number | null) {
  if (cig != null && anos != null) {
    set('consumoTabacoIpa', ((cig / 20) * anos).toFixed(1))
  } else {
    set('consumoTabacoIpa', '')
  }
}

const selectClass = 'w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50'
</script>

<template>
  <div class="space-y-2">
    <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detalle de consumo de sustancias</span>

    <p v-if="!anyYes" class="text-[11px] text-gray-400 italic">
      Marca "Sí" en Consumo de Tabaco / Alcohol / Otras Drogas (en los criterios de arriba) para registrar la carga.
    </p>

    <div v-else class="pl-3 border-l-2 border-gray-100 space-y-3">
      <!-- TABACO -->
      <div v-if="tabaco">
        <span class="text-xs text-gray-500 font-medium">Tabaco</span>
        <div class="mt-1.5 space-y-1.5">
          <select :value="d.consumoTabacoEstado" :disabled="isReadOnly" :class="selectClass"
            @change="set('consumoTabacoEstado', ($event.target as HTMLSelectElement).value)">
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Cigarrillos / día</label>
              <input type="number" min="0" :value="d.consumoTabacoCigarrillosDia ?? ''" :readonly="isReadOnly" placeholder="0"
                class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50"
                @input="numInput('consumoTabacoCigarrillosDia', ($event.target as HTMLInputElement).value)" />
            </div>
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Años de consumo</label>
              <input type="number" min="0" :value="d.consumoTabacoAnios ?? ''" :readonly="isReadOnly" placeholder="0"
                class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50"
                @input="numInput('consumoTabacoAnios', ($event.target as HTMLInputElement).value)" />
            </div>
          </div>
          <div v-if="d.consumoTabacoIpa" class="flex items-center gap-2">
            <span class="text-[10px] font-medium text-gray-400 uppercase tracking-wider">IPA</span>
            <span class="text-xs font-semibold text-gray-700">{{ d.consumoTabacoIpa }}</span>
            <span class="text-[10px] text-gray-400">(cigarrillos/día ÷ 20 × años)</span>
          </div>
        </div>
      </div>

      <!-- ALCOHOL -->
      <div v-if="alcohol">
        <span class="text-xs text-gray-500 font-medium">Alcohol</span>
        <div class="mt-1.5 space-y-1.5">
          <select :value="d.consumoAlcoholEstado" :disabled="isReadOnly" :class="selectClass"
            @change="set('consumoAlcoholEstado', ($event.target as HTMLSelectElement).value)">
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <textarea :value="d.consumoAlcoholDetalle" :readonly="isReadOnly" rows="2"
            placeholder="Detalle del consumo (frecuencia, tipo de bebida…)"
            class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50"
            @input="set('consumoAlcoholDetalle', ($event.target as HTMLTextAreaElement).value)" />
        </div>
      </div>

      <!-- OTRAS DROGAS -->
      <div v-if="otras">
        <span class="text-xs text-gray-500 font-medium">Otras drogas</span>
        <div class="mt-1.5 space-y-1.5">
          <select :value="d.consumoOtrasDrogasEstado" :disabled="isReadOnly" :class="selectClass"
            @change="set('consumoOtrasDrogasEstado', ($event.target as HTMLSelectElement).value)">
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <textarea :value="d.consumoOtrasDrogasDetalle" :readonly="isReadOnly" rows="2"
            placeholder="Tipo de sustancia y detalle…"
            class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50"
            @input="set('consumoOtrasDrogasDetalle', ($event.target as HTMLTextAreaElement).value)" />
        </div>
      </div>
    </div>
  </div>
</template>
