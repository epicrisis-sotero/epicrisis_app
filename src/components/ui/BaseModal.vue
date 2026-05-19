<script setup lang="ts">
defineProps<{
  title: string
  open: boolean
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900">{{ title }}</h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
