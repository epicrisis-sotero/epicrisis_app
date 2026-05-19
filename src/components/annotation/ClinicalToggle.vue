<script setup lang="ts">
defineProps<{
  label: string
  modelValue: boolean | null
  isReadOnly?: boolean
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{ 'update:modelValue': [v: boolean | null] }>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2">
      <span :class="size === 'sm' ? 'text-xs text-gray-600' : 'text-xs text-gray-700 font-medium'">
        {{ label }}
      </span>
      <div class="flex gap-1 flex-shrink-0" @click.stop>
        <button
          :disabled="isReadOnly"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
            modelValue === true  ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]"
          @click="emit('update:modelValue', modelValue === true ? null : true)"
        >Sí</button>
        <button
          :disabled="isReadOnly"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
            modelValue === false ? 'bg-red-500 text-white'   : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]"
          @click="emit('update:modelValue', modelValue === false ? null : false)"
        >No</button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="modelValue === true" class="mt-1.5 space-y-1.5">
        <slot />
      </div>
    </Transition>
  </div>
</template>
