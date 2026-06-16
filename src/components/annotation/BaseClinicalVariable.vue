<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: boolean | null | 'unknown'
    evidencia: string
    comments?: string
    isActive: boolean
    isReadOnly?: boolean
    size?: 'sm' | 'md'
    hasComments?: boolean
    evidenciaPlaceholder?: string
    commentsPlaceholder?: string
  }>(),
  {
    isReadOnly: false,
    size: 'md',
    hasComments: true,
    evidenciaPlaceholder: 'Selecciona texto en el documento y presiona "Capturar"',
    commentsPlaceholder: 'Ej: texto ambiguo, sigla no estándar, requiere revisión de experta…'
  }
)

const emit = defineEmits<{
  'update:modelValue': [v: boolean | null | 'unknown']
  'update:evidencia': [v: string]
  'update:comments': [v: string]
  'activate': []
}>()

const showEvidence = computed(() =>
  props.isActive || props.modelValue !== null || !!props.evidencia
)

const containerClasses = computed(() => [
  'p-2 rounded-lg border transition-all cursor-pointer',
  props.isActive
    ? 'border-brand-400 bg-brand-50 shadow-sm'
    : 'border-gray-100 bg-white hover:border-gray-200',
])

function activate() {
  if (!props.isReadOnly) {
    emit('activate')
  }
}

function handleValueChange(val: boolean | null | 'unknown') {
  if (!props.isReadOnly) {
    emit('update:modelValue', val)
  }
}
</script>

<template>
  <div :class="containerClasses" @click="activate">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2">
      <span :class="size === 'sm' ? 'text-xs text-gray-600 font-medium' : 'text-xs text-gray-700 font-semibold'">
        {{ label }}
      </span>
      <div class="flex gap-1 flex-shrink-0" @click.stop>
        <button
          :disabled="isReadOnly"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
            modelValue === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]"
          @click="handleValueChange(modelValue === true ? null : true)"
        >Sí</button>
        <button
          :disabled="isReadOnly"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
            modelValue === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]"
          @click="handleValueChange(modelValue === false ? null : false)"
        >No</button>
        <button
          :disabled="isReadOnly"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
            modelValue === 'unknown' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
          ]"
          title="No se puede determinar a partir de la epicrisis"
          @click="handleValueChange(modelValue === 'unknown' ? null : 'unknown')"
        >?</button>
      </div>
    </div>

    <!-- Conditional content when value is Yes (for extra inputs/slots) -->
    <div v-if="modelValue === true" class="mt-1.5 space-y-1.5" @click.stop>
      <slot />
    </div>

    <!-- Evidence and comments block -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
      leave-active-class="transition-all duration-100 ease-in overflow-hidden"
      leave-from-class="opacity-100 max-h-[500px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="showEvidence" class="mt-1.5" @click.stop>
        <!-- Evidence -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Tu evidencia (ground truth)
            </label>
            <button
              v-if="evidencia && !isReadOnly"
              class="text-[10px] text-gray-400 hover:text-red-500 transition-colors leading-none"
              title="Limpiar evidencia"
              @click="emit('update:evidencia', '')"
            >✕ limpiar</button>
          </div>
          <div
            :class="[
              'min-h-[28px] rounded border px-2 py-1.5 text-xs font-mono leading-relaxed',
              evidencia
                ? 'bg-yellow-50 border-yellow-300 text-gray-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 italic',
            ]"
          >
            {{ evidencia || evidenciaPlaceholder }}
          </div>
        </div>

        <!-- Comments -->
        <div v-if="isActive && hasComments" class="mt-2">
          <label class="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
            Comentarios <span class="normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            :value="comments"
            :readonly="isReadOnly"
            rows="2"
            :placeholder="commentsPlaceholder"
            class="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 bg-white"
            @input="emit('update:comments', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
