<script setup lang="ts">
import { computed } from 'vue'
import { useAnnotationStore } from '@/stores/annotation'
import type { ClinicalData } from '@/types/clinical'

defineProps<{ isReadOnly?: boolean }>()

const store = useAnnotationStore()
const d = computed(() => store.clinicalData)

function set<K extends keyof ClinicalData>(key: K, value: ClinicalData[K]) {
  store.setClinical(key, value)
}

function toggle(key: 'consumoSustancias' | 'consumoTabaco' | 'consumoAlcohol' | 'consumoOtrasDrogas', val: boolean) {
  set(key, d.value[key] === val ? null : val)
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

const btnBase = 'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors'
function btnClass(active: boolean, color: 'green' | 'red') {
  if (active) return `${btnBase} ${color === 'green' ? 'bg-green-500' : 'bg-red-500'} text-white`
  return `${btnBase} bg-gray-100 text-gray-500 hover:bg-gray-200`
}
</script>

<template>
  <div class="space-y-2">
    <!-- Nivel 1: consumo de sustancias -->
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs text-gray-700 font-medium">Consumo de sustancias</span>
      <div class="flex gap-1 flex-shrink-0">
        <button :class="btnClass(d.consumoSustancias === true, 'green')" :disabled="isReadOnly" @click="toggle('consumoSustancias', true)">Sí</button>
        <button :class="btnClass(d.consumoSustancias === false, 'red')" :disabled="isReadOnly" @click="toggle('consumoSustancias', false)">No</button>
      </div>
    </div>

    <!-- Nivel 2: las tres ramas -->
    <div v-if="d.consumoSustancias === true" class="pl-3 border-l-2 border-gray-100 space-y-3">

      <!-- TABACO -->
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-500">Tabaco</span>
          <div class="flex gap-1 flex-shrink-0">
            <button :class="btnClass(d.consumoTabaco === true, 'green')" :disabled="isReadOnly" @click="toggle('consumoTabaco', true)">Sí</button>
            <button :class="btnClass(d.consumoTabaco === false, 'red')" :disabled="isReadOnly" @click="toggle('consumoTabaco', false)">No</button>
          </div>
        </div>
        <div v-if="d.consumoTabaco === true" class="mt-1.5 space-y-1.5">
          <select
            :value="d.consumoTabacoEstado"
            :disabled="isReadOnly"
            class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
            @change="set('consumoTabacoEstado', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Cigarrillos / día</label>
              <input
                type="number" min="0"
                :value="d.consumoTabacoCigarrillosDia ?? ''"
                :readonly="isReadOnly"
                placeholder="0"
                class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
                @input="numInput('consumoTabacoCigarrillosDia', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Años de consumo</label>
              <input
                type="number" min="0"
                :value="d.consumoTabacoAnios ?? ''"
                :readonly="isReadOnly"
                placeholder="0"
                class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
                @input="numInput('consumoTabacoAnios', ($event.target as HTMLInputElement).value)"
              />
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
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-500">Alcohol</span>
          <div class="flex gap-1 flex-shrink-0">
            <button :class="btnClass(d.consumoAlcohol === true, 'green')" :disabled="isReadOnly" @click="toggle('consumoAlcohol', true)">Sí</button>
            <button :class="btnClass(d.consumoAlcohol === false, 'red')" :disabled="isReadOnly" @click="toggle('consumoAlcohol', false)">No</button>
          </div>
        </div>
        <div v-if="d.consumoAlcohol === true" class="mt-1.5 space-y-1.5">
          <select
            :value="d.consumoAlcoholEstado"
            :disabled="isReadOnly"
            class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
            @change="set('consumoAlcoholEstado', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <textarea
            :value="d.consumoAlcoholDetalle"
            :readonly="isReadOnly"
            rows="2"
            placeholder="Detalle del consumo (frecuencia, tipo de bebida…)"
            class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
            @input="set('consumoAlcoholDetalle', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>

      <!-- OTRAS DROGAS -->
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-500">Otras drogas</span>
          <div class="flex gap-1 flex-shrink-0">
            <button :class="btnClass(d.consumoOtrasDrogas === true, 'green')" :disabled="isReadOnly" @click="toggle('consumoOtrasDrogas', true)">Sí</button>
            <button :class="btnClass(d.consumoOtrasDrogas === false, 'red')" :disabled="isReadOnly" @click="toggle('consumoOtrasDrogas', false)">No</button>
          </div>
        </div>
        <div v-if="d.consumoOtrasDrogas === true" class="mt-1.5 space-y-1.5">
          <select
            :value="d.consumoOtrasDrogasEstado"
            :disabled="isReadOnly"
            class="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
            @change="set('consumoOtrasDrogasEstado', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Estado —</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="no_disponible">No disponible</option>
          </select>
          <textarea
            :value="d.consumoOtrasDrogasDetalle"
            :readonly="isReadOnly"
            rows="2"
            placeholder="Tipo de sustancia y detalle…"
            class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white disabled:bg-gray-50"
            @input="set('consumoOtrasDrogasDetalle', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>

    </div>
  </div>
</template>
